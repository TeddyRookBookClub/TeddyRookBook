/* Advanced Biology (AP and College), course key apbio: course visuals (names prefixed apbio-), on window.MathLadder.viz.
   Load order: math/viz/core.js (+ viz.css), bio/viz/bio.js (+ bio.css), then this file. Vanilla JS, no libraries, no network;
   every drawing is original SVG made here. CSS is injected below and uses the kit's theme variables (light and dark).
   Common options as in the kit: quiet (hide what would give an answer away), interactive: false, task, caption, label, ask.

   apbio-fork      a replication fork, step by step: helicase, primase and primers, the leading strand, Okazaki fragments on
                   the lagging strand, primer replacement, ligase. step: 0-5 (start; with interactive: false the one step shown,
                   default 5); ask: 'helicase' | 'primase' | 'polymerase' | 'ligase' | 'leading' | 'lagging' | 'okazaki' |
                   'primer' | 'topo' (that label becomes "?"; quiet hides the other labels); numbers: true (numbered labels + key).
   apbio-chain     an electron transport chain in its membrane. mode 'mito' (complexes I-IV, Q, cytochrome c, ATP synthase;
                   intermembrane space above, matrix below) | 'thylakoid' (photosystem II, plastoquinone, cytochrome complex,
                   plastocyanin, photosystem I, ferredoxin, NADP⁺ reductase, ATP synthase; stroma above, thylakoid space below).
                   show 'both' | 'electrons' | 'protons' (a switch when interactive); ask: a part key (mito: c1 c2 q c3 cytc c4
                   atp; thylakoid: ps2 pq cyt pc ps1 fd nr atp).
   apbio-operon    operon: 'lac' | 'trp'. lac: lactose (false), glucose (true), cap (true: show the CAP site and glucose switch);
                   trp: trp (false: tryptophan scarce). Shows the repressor, RNA polymerase and whether the genes are read.
   apbio-ribosome  translation codon by codon: initiation, A-site entry, peptide bond, translocation, release factor at the
                   stop codon. mrna (default 'AUGUUCGGAUAA'; read from the first AUG); step (start / still); ask: 'E' | 'P' | 'A'.
   apbio-splice    a eukaryotic gene to mature mRNA: transcription, 5′ cap and poly-A tail, introns spliced out, export.
                   exons (4); skip: exon index for the second splice variant (2 = exon 3); step; alt: false hides the variant switch.
   apbio-genemap   a chromosome with genes at map positions. genes: [{ name, pos }] (map units); tap two genes to read the
                   distance; known: [[a, b], …] pairs whose distance is printed (default all neighbors; quiet: none);
                   ask: [a, b] ("?" for that distance) or a gene name ("?" for that gene).
   apbio-nondisjunction  one chromosome pair through meiosis I and II. when: 'none' | 'I' | 'II'; gametes labeled n, n + 1,
                   n − 1; ask: gamete index 0-3; a switch when interactive.
   apbio-cascade   signal amplification: each activated molecule activates gain of the next. gain (10), steps (3), names
                   (row labels); sliders when interactive; quiet hides the counts.
   apbio-cube      surface area to volume of a cube. s (2), max (10), unit ('µm'); compare: [1, 2, 4] draws several cubes
                   with a table instead of the slider; quiet hides the numbers.
   apbio-psi       water potential across a membrane. left, right: { name, C (mol/L), i, P (bars) }; T (kelvin, 295);
                   sliders for both concentrations when interactive; quiet hides Ψ and the arrow.
   apbio-semilog   sizing DNA: ladder bands on a semi-log plot (distance against log size). ladder: [bp, …]; unknown (mm);
                   len (gel length in mm, 60); a slider moves the unknown band; quiet hides the reading.
   apbio-potential the resting membrane potential in four steps: no gradients, the pump, potassium leak, balance near −70 mV.
                   step; ask: 'pump' | 'channel'.
   apbio-bottles   light and dark bottles for primary productivity. initial, light, dark (mg O₂/L); hours; quiet hides the
                   working; ask: 'npp' | 'r' | 'gpp'.
   apbio-se        standard deviation against standard error: a sample of n values with mean ± SD and mean ± 2 SE.
                   mean (50), sd (10), n (5), seed; a slider for n.
   apbio-hw        Hardy-Weinberg as areas of a square: p², 2pq, q². q (0.3); slider; quiet hides values; ask: 'p2' | 'pq' | 'q2'.
   apbio-drift     genetic drift: allele frequency in several populations of size N over generations (random sampling).
                   N (20), pops (8), gens (60), p0 (0.5), seed; a switch for N and a Run again button.
   apbio-timeline  a vertical timeline (HTML, wraps on phones): events [{ t (millions of years ago), text, key }]; spacing in
                   proportion to time (with a minimum); ask: key ("?" for that event's text).                              */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V || !D) return;
  var M = Math, NS = 'http://www.w3.org/2000/svg';
  function B() { return ML.bio || {}; }

  if (!D.getElementById('apbio-viz-css')) {
    var st = D.createElement('style'); st.id = 'apbio-viz-css';
    st.textContent = [
      '.apv{--a-dna:#33403a;--a-new:#0f7d5c;--a-rna:#d9480f;--a-e:#b8860b;--a-h:#c2255c;--a-k:#7048e8;--a-na:#e8590c;--a-mem:#f3dfb5;--a-memline:#b08a4a;',
      '--a-cpx:#d6e6f7;--a-cpxl:#1c6fd6;--a-ps:#d3efd8;--a-psl:#2b8a3e;--a-syn:#f8d9e4;--a-synl:#c2255c;--a-gene:#e7f0ea;--a-genel:#0f7d5c;--a-intron:#efe6d2;--a-intronl:#a68a52;--a-rep:#ffe3e3;--a-repl:#c92a2a;--a-pol:#dbe4ff;--a-poll:#3b5bdb;--a-dot:#868e96}',
      'html[data-theme="dark"] .apv{--a-dna:#cfdad3;--a-new:#33dfb7;--a-rna:#ffa94d;--a-e:#ffd479;--a-h:#f783ac;--a-k:#b197fc;--a-na:#ffa94d;--a-mem:#4a3d24;--a-memline:#c9a86a;',
      '--a-cpx:#1f3a57;--a-cpxl:#74c0fc;--a-ps:#1f4a2c;--a-psl:#8ce99a;--a-syn:#4a2233;--a-synl:#f783ac;--a-gene:#1f3b2e;--a-genel:#33dfb7;--a-intron:#3d3524;--a-intronl:#d8b86c;--a-rep:#4a2424;--a-repl:#ff8787;--a-pol:#24305a;--a-poll:#91a7ff;--a-dot:#adb5bd}',
      '.apv .a-dna{stroke:var(--a-dna);stroke-width:5;fill:none;stroke-linecap:round}.apv .a-new{stroke:var(--a-new);stroke-width:5;fill:none;stroke-linecap:round}',
      '.apv .a-rna{stroke:var(--a-rna);stroke-width:7;fill:none;stroke-linecap:butt}.apv .a-rnaf{fill:var(--a-rna)}.apv .a-newf{fill:var(--a-new)}.apv .a-dnaf{fill:var(--a-dna)}',
      '.apv .a-mem{fill:var(--a-mem);stroke:var(--a-memline);stroke-width:1.5}.apv .a-cpx{fill:var(--a-cpx);stroke:var(--a-cpxl);stroke-width:2}.apv .a-ps{fill:var(--a-ps);stroke:var(--a-psl);stroke-width:2}',
      '.apv .a-syn{fill:var(--a-syn);stroke:var(--a-synl);stroke-width:2}.apv .a-epath{stroke:var(--a-e);stroke-width:3.5;fill:none;stroke-dasharray:7 5}.apv .a-eh{fill:var(--a-e)}',
      '.apv .a-hpath{stroke:var(--a-h);stroke-width:3;fill:none}.apv .a-hh{fill:var(--a-h)}.apv .a-hion{fill:var(--a-h);font:700 13px system-ui,sans-serif}',
      '.apv .a-in{fill:var(--bv-lab);font:700 15px system-ui,sans-serif}.apv .a-in-sm{fill:var(--bv-lab);font:600 13px system-ui,sans-serif}.apv .a-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}',
      '.apv .a-gene{fill:var(--a-gene);stroke:var(--a-genel);stroke-width:2}.apv .a-intron{fill:var(--a-intron);stroke:var(--a-intronl);stroke-width:1.5}',
      '.apv .a-rep{fill:var(--a-rep);stroke:var(--a-repl);stroke-width:2}.apv .a-pol{fill:var(--a-pol);stroke:var(--a-poll);stroke-width:2}',
      '.apv .a-e1{fill:#ffe8a3;stroke:#b8860b;stroke-width:2}.apv .a-e2{fill:var(--a-pol);stroke:var(--a-poll);stroke-width:2}.apv .a-e3{fill:#e5dbff;stroke:#7048e8;stroke-width:2}.apv .a-e4{fill:#ffdeeb;stroke:#c2255c;stroke-width:2}',
      'html[data-theme="dark"] .apv .a-e1{fill:#4a3f16;stroke:#ffd479}html[data-theme="dark"] .apv .a-e3{fill:#30254f;stroke:#b197fc}html[data-theme="dark"] .apv .a-e4{fill:#4a2233;stroke:#f783ac}',
      '.apv .a-k{fill:var(--a-k)}.apv .a-na{fill:var(--a-na)}.apv .a-kt{fill:var(--a-k);font:700 13px system-ui,sans-serif}.apv .a-nat{fill:var(--a-na);font:700 13px system-ui,sans-serif}',
      '.apv .a-dot{fill:var(--a-dot)}.apv .a-axis{stroke:var(--bv-line);stroke-width:1.5}.apv .a-grid{stroke:var(--bv-grid);stroke-width:1}.apv .a-tick{fill:var(--bv-sub);font:12px system-ui,sans-serif}',
      '.apv .a-guide{stroke:var(--bv-ask);stroke-width:2;stroke-dasharray:5 4;fill:none}.apv .a-pt{fill:var(--bv-acc)}.apv .a-unk{fill:var(--bv-ask)}.apv .a-fit{stroke:var(--bv-acc);stroke-width:2;fill:none;opacity:.7}',
      '.apv .a-tbl{border-collapse:collapse;margin:.5rem auto 0;font-size:.92rem;max-width:100%}.apv .a-tbl td,.apv .a-tbl th{border:1px solid var(--mv-line);padding:.25rem .55rem;text-align:center}.apv .a-tbl th{background:var(--bv-accs)}',
      '.apv .a-wrap{overflow-x:auto;max-width:100%}',
      '.apv .a-tl{position:relative;margin:.4rem 0 0;padding:0 0 0 1.4rem;list-style:none}.apv .a-tl::before{content:"";position:absolute;left:.45rem;top:.3rem;bottom:.3rem;width:4px;border-radius:2px;background:var(--bv-acc);opacity:.55}',
      '.apv .a-tl li{position:relative;margin:0;padding:.1rem 0 .1rem .4rem;line-height:1.4}.apv .a-tl li::before{content:"";position:absolute;left:-1.22rem;top:.42rem;width:.8rem;height:.8rem;border-radius:50%;background:var(--bv-panel);border:3px solid var(--bv-acc)}',
      '.apv .a-tl .a-when{display:block;font-weight:700;color:var(--bv-acc);font-size:.9rem}.apv .a-tl .a-what{display:block;font-size:.95rem}.apv .a-tl .a-ask{color:var(--bv-ask);font-weight:800;font-size:1.2rem}',
      '.apv .a-meter{font:700 15px system-ui,sans-serif}'
    ].join('');
    D.head.appendChild(st);
  }

  /* ---------- helpers ---------- */
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function svgRoot(w, hh, label) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'bv-svg', role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  var uidN = 0; function uid(p) { return 'apv-' + (p || 'x') + '-' + (++uidN); }
  function head(svg, cls) { var defs = svg.querySelector('defs') || sv('defs', null, svg), id = uid('ah'); var mk = sv('marker', { id: id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0,0 L10,5 L0,10 z', class: cls || 'bv-arrowhead' }, mk); return 'url(#' + id + ')'; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmt(v, d) { return V.fmt(v, d === undefined ? 2 : d); }
  function frame(el, o, name, label) {
    el.classList.add('bv', 'apv', 'apv-' + name);
    var F = { quiet: !!(o.quiet || o.readout === false), inter: o.interactive !== false };
    if (!el.getAttribute('aria-label') || F.quiet) el.setAttribute('aria-label', o.label || label);
    if (o.task) el.appendChild(h('p', 'bv-task', o.task));
    F.body = h('div', 'bv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl bv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout bv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = F.quiet ? '' : (html || ''); F.out.hidden = F.quiet || !html; if (html && ML.typeset) try { ML.typeset(F.out); } catch (e) { } };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  function stepper(parent, n, go, start, label) {
    var bar = h('div', 'bv-nav'), i = start || 0;
    var back = V.button(bar, '‹ Back', function () { set(i - 1); }), lab = h('span', 'bv-navn'), next = V.button(bar, 'Next ›', function () { set(i + 1); }, 'pri');
    bar.insertBefore(lab, next);
    function set(k) { i = M.max(0, M.min(n - 1, k)); back.disabled = i === 0; next.disabled = i === n - 1; lab.textContent = label ? label(i) : 'Step ' + (i + 1) + ' of ' + n; go(i); }
    parent.appendChild(bar); set(i);
    return { set: set };
  }
  // a label: plain text, "?" when asked, a number when o.numbers, hidden when quiet and not asked
  function labeler(svg, o, F) {
    var keyRows = [], n = 0;
    return {
      put: function (key, x, y, text, at) {
        at = at || {}; var asked = o.ask === key;
        if (F.quiet && !asked) return null;
        if (asked) return txt(svg, x, y + 6, '?', Object.assign({}, at, { class: 'bv-askt' }));
        if (o.numbers) { n++; keyRows.push([n + '.', text]); var g = sv('g', { class: 'bv-mark', transform: 'translate(' + x + ',' + (y - 4) + ')' }, svg); sv('circle', { r: 12 }, g); txt(g, 0, 5, String(n), { 'text-anchor': 'middle' }); return g; }
        return txt(svg, x, y, text, Object.assign({ class: 'bv-lab bv-lab-sm' }, at));
      },
      key: function (parent) { if (!keyRows.length) return; var ol = h('ol', 'bv-keylist'); keyRows.forEach(function (r) { ol.appendChild(h('li', '', '<b>' + esc(r[0]) + '</b> ' + esc(r[1]))); }); parent.appendChild(ol); },
      reset: function () { keyRows = []; n = 0; }
    };
  }
  // dense pictures keep a readable size on phones: they scroll sideways inside their own box instead of shrinking
  function wide(F, svg, minW) { var w = h('div', 'a-wrap'); svg.style.minWidth = minW + 'px'; w.appendChild(svg); F.body.appendChild(w);
    function note() { var n = F.body.querySelector('.a-swipe'), need = F.body.clientWidth && F.body.clientWidth < minW; if (need && !n) F.body.appendChild(h('p', 'bv-sub a-swipe', 'Swipe sideways to see the whole picture.')); if (!need && n) n.remove(); }
    W.setTimeout(note, 0); if ('ResizeObserver' in W) new ResizeObserver(note).observe(F.body); }
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ (t >>> 15), t | 1); t ^= t + M.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* =========================== apbio-fork =========================== */
  var FORK_SAY = [
    'Helicase unwinds the double helix at the replication fork by breaking the hydrogen bonds between bases. Topoisomerase, ahead of the fork, relieves the twisting.',
    'Primase lays short RNA primers. DNA polymerase can only add nucleotides to an existing 3′ end, so every new strand begins on a primer.',
    'The leading strand: its template runs 3′ → 5′ toward the fork, so DNA polymerase builds the new strand 5′ → 3′ in one piece, following the fork.',
    'The lagging strand: polymerase still builds 5′ → 3′, but on this template that points away from the fork. It makes short Okazaki fragments, each on a new primer, as the fork opens.',
    'Another DNA polymerase removes the RNA primers and fills those gaps with DNA. Small nicks are left between fragments.',
    'DNA ligase seals the nicks, joining the fragments into one continuous lagging strand. Each new double helix has one old strand and one new strand.'
  ];
  V.register('apbio-fork', function (el, o) {
    var F = frame(el, o, 'fork', 'A DNA replication fork with the leading and lagging strands');
    var svg = svgRoot(600, 300, el.getAttribute('aria-label')); wide(F, svg, 560); var keyBox = h('div'); F.body.appendChild(keyBox);
    function draw(s) {
      svg.innerHTML = ''; keyBox.innerHTML = ''; var L = labeler(svg, o, F), mkN = head(svg, 'bv-arrowhead'), mkG = head(svg, 'bv-arrowhead-lo');
      // parental duplex on the right, fork at x = 400
      sv('path', { d: 'M400,141 L590,141', class: 'a-dna' }, svg); sv('path', { d: 'M400,159 L590,159', class: 'a-dna' }, svg);
      for (var x = 410; x < 590; x += 14) sv('line', { x1: x, y1: 145, x2: x, y2: 155, class: 'a-axis' }, svg);
      sv('path', { d: 'M400,141 L345,72 L20,72', class: 'a-dna' }, svg); sv('path', { d: 'M400,159 L345,228 L20,228', class: 'a-dna' }, svg);
      if (!F.quiet) { txt(svg, 22, 62, '3′', { class: 'bv-lab bv-lab-sm' }); txt(svg, 572, 132, '5′', { class: 'bv-lab bv-lab-sm' }); txt(svg, 22, 250, '5′', { class: 'bv-lab bv-lab-sm' }); txt(svg, 572, 182, '3′', { class: 'bv-lab bv-lab-sm' }); }
      sv('path', { d: 'M470,26 L560,26', class: 'bv-ar', 'marker-end': mkN }, svg); txt(svg, 466, 31, 'fork moves', { class: 'bv-sub', 'text-anchor': 'end' });
      // helicase and topoisomerase
      sv('polygon', { points: '400,124 418,134 418,166 400,176 382,166 382,134', class: 'a-e1' }, svg);
      L.put('helicase', 400, 202, 'helicase', { 'text-anchor': 'middle' });
      sv('ellipse', { cx: 520, cy: 150, rx: 18, ry: 24, class: 'a-e1', opacity: 0.75 }, svg); L.put('topo', 520, 112, 'topoisomerase', { 'text-anchor': 'middle' });
      // leading strand (y = 88), primer at its 5′ end on the left
      var leadEnd = s >= 2 ? 330 : 56;
      if (s >= 1) {
        if (s >= 2) sv('path', { d: 'M56,88 L' + leadEnd + ',88', class: 'a-new', 'marker-end': mkG }, svg);
        sv('path', { d: 'M30,88 L56,88', class: s >= 4 ? 'a-new' : 'a-rna' }, svg);
        if (s < 4) L.put('primer', 43, 112, 'RNA primer', { 'text-anchor': 'middle' });
        if (s >= 2) { L.put('leading', 190, 116, 'leading strand (5′ → 3′, toward the fork)', { 'text-anchor': 'middle' }); if (!F.quiet) { txt(svg, 22, 104, '5′', { class: 'bv-sub' }); } }
      }
      if (s === 2 || s === 3) { sv('rect', { x: 316, y: 76, width: 38, height: 26, rx: 9, class: 'a-e2' }, svg); if (s === 2) L.put('polymerase', 335, 60, 'DNA polymerase', { 'text-anchor': 'middle' }); }
      // lagging strand fragments above the bottom template (y = 212), each built right to left, primer at the right (5′) end
      var frags = [[40, 130], [142, 232], [244, 334]];
      frags.forEach(function (fr, i) {
        var x1 = fr[0], x2 = fr[1];
        if (s === 1) { sv('path', { d: 'M' + (x2 - 26) + ',212 L' + x2 + ',212', class: 'a-rna' }, svg); return; }
        if (s >= 3) {
          var full = s >= 5 ? [x1 - (i ? 6 : 0), x2 + 6] : [x1, x2];
          sv('path', { d: 'M' + (x2 - 26) + ',212 L' + (full[0] + 2) + ',212', class: 'a-new', 'marker-end': s < 5 ? mkG : null }, svg);
          sv('path', { d: 'M' + (x2 - 26) + ',212 L' + x2 + ',212', class: s >= 4 ? 'a-new' : 'a-rna' }, svg);
          if (s >= 5 && i < 2) sv('path', { d: 'M' + x2 + ',212 L' + (frags[i + 1][0] + 2) + ',212', class: 'a-new' }, svg);
        }
      });
      if (s === 1) { sv('ellipse', { cx: 318, cy: 212, rx: 16, ry: 12, class: 'a-e3' }, svg); L.put('primase', 318, 192, 'primase', { 'text-anchor': 'middle' }); L.put('primer', 190, 196, 'RNA primers', { 'text-anchor': 'middle' }); }
      if (s === 3) { sv('rect', { x: 230, y: 200, width: 38, height: 26, rx: 9, class: 'a-e2' }, svg); L.put('polymerase', 249, 192, 'DNA polymerase', { 'text-anchor': 'middle' }); L.put('okazaki', 85, 194, 'Okazaki fragment', { 'text-anchor': 'middle' }); }
      if (s >= 3) L.put('lagging', 200, 272, 'lagging strand (5′ → 3′, away from the fork)', { 'text-anchor': 'middle' });
      if (s === 4 && !F.quiet) { txt(svg, 136, 194, 'nick', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 238, 194, 'nick', { class: 'bv-sub', 'text-anchor': 'middle' }); }
      if (s >= 5) { sv('ellipse', { cx: 137, cy: 212, rx: 14, ry: 11, class: 'a-e4' }, svg); L.put('ligase', 137, 194, 'DNA ligase', { 'text-anchor': 'middle' }); }
      if (s >= 3 && !F.quiet) txt(svg, 340, 252, '5′', { class: 'bv-sub' });
      L.key(keyBox); F.say(FORK_SAY[s]);
    }
    var s0 = o.step !== undefined ? M.max(0, M.min(5, o.step | 0)) : (F.inter && !F.quiet ? 0 : 5);
    if (F.inter && !F.quiet) stepper(F.ctl, 6, draw, s0); else draw(s0);
  });

  /* =========================== apbio-chain =========================== */
  var CHAIN = {
    mito: { top: 'intermembrane space (H⁺ builds up)', bot: 'matrix', parts: [
      { k: 'c1', x: 80, w: 64, name: 'I', pump: 1, cls: 'a-cpx' }, { k: 'c2', x: 160, w: 44, name: 'II', small: true, cls: 'a-cpx' },
      { k: 'q', x: 215, w: 30, name: 'Q', mobile: 'mid', cls: 'a-cpx' }, { k: 'c3', x: 280, w: 64, name: 'III', pump: 1, cls: 'a-cpx' },
      { k: 'cytc', x: 340, w: 34, name: 'c', mobile: 'top', cls: 'a-cpx' }, { k: 'c4', x: 400, w: 64, name: 'IV', pump: 1, cls: 'a-cpx' },
      { k: 'atp', x: 520, w: 50, name: 'ATP synthase', syn: 'down', cls: 'a-syn' }],
      epath: ['c1', 'q', 'c3', 'cytc', 'c4'], hUp: true,
      say: { both: 'Electrons from NADH and FADH₂ pass along the chain (gold) and end on oxygen, which forms water. Complexes I, III and IV use that energy to pump H⁺ into the intermembrane space (red). H⁺ flows back through ATP synthase, which makes ATP.',
        electrons: 'Electrons enter at complex I (from NADH) or complex II (from FADH₂), ride ubiquinone (Q) and cytochrome c, and end on O₂. Electrons never pass through ATP synthase.',
        protons: 'H⁺ is pumped out of the matrix at complexes I, III and IV, so it builds up in the intermembrane space. Its only way back is through ATP synthase, which turns that flow into ATP.' } },
    thylakoid: { top: 'stroma', bot: 'thylakoid space (H⁺ builds up)', parts: [
      { k: 'ps2', x: 80, w: 70, name: 'PS II', light: true, cls: 'a-ps' }, { k: 'pq', x: 150, w: 30, name: 'PQ', mobile: 'mid', cls: 'a-cpx' },
      { k: 'cyt', x: 215, w: 60, name: 'cyt', pump: 1, cls: 'a-cpx' }, { k: 'pc', x: 268, w: 32, name: 'PC', mobile: 'bot', cls: 'a-cpx' },
      { k: 'ps1', x: 325, w: 70, name: 'PS I', light: true, cls: 'a-ps' }, { k: 'fd', x: 382, w: 32, name: 'Fd', mobile: 'top', cls: 'a-cpx' },
      { k: 'nr', x: 440, w: 72, name: 'NADP⁺ red.', small: true, top: true, cls: 'a-cpx' }, { k: 'atp', x: 535, w: 50, name: 'ATP synthase', syn: 'up', cls: 'a-syn' }],
      epath: ['ps2', 'pq', 'cyt', 'pc', 'ps1', 'fd', 'nr'], hUp: false,
      say: { both: 'Light drives electrons from water through photosystem II, the cytochrome complex and photosystem I to NADP⁺, making NADPH (gold). Splitting water and pumping at the cytochrome complex load the thylakoid space with H⁺ (red), which flows out through ATP synthase to make ATP.',
        electrons: 'Electrons go from water to photosystem II first, then through plastoquinone (PQ), the cytochrome complex and plastocyanin (PC) to photosystem I, which re-energizes them, then by ferredoxin (Fd) to NADP⁺ reductase.',
        protons: 'H⁺ builds up inside the thylakoid: water splitting releases it there, and the cytochrome complex pumps more in from the stroma. It flows back out to the stroma through ATP synthase, making ATP.' } }
  };
  V.register('apbio-chain', function (el, o) {
    var mode = o.mode === 'thylakoid' ? 'thylakoid' : 'mito', C = CHAIN[mode], show = o.show || 'both';
    var F = frame(el, o, 'chain', mode === 'mito' ? 'The electron transport chain and ATP synthase in the inner mitochondrial membrane' : 'The light reactions in the thylakoid membrane');
    var svg = svgRoot(600, 360, el.getAttribute('aria-label')); wide(F, svg, 560);
    var y1 = 170, y2 = 226, ym = (y1 + y2) / 2;
    function P(k) { return C.parts.filter(function (p) { return p.k === k; })[0]; }
    function ep(p) { return [p.x, p.mobile === 'top' ? y1 - 14 : p.mobile === 'bot' ? y2 + 14 : p.top ? y1 + 8 : p.k === 'c2' ? ym + 14 : p.k === 'q' ? ym - 12 : ym - 18]; }
    function draw() {
      svg.innerHTML = ''; var eh = head(svg, 'a-eh'), hh = head(svg, 'a-hh');
      sv('rect', { x: 0, y: y1, width: 600, height: y2 - y1, class: 'a-mem' }, svg);
      txt(svg, 8, 22, C.top, { class: 'bv-lab bv-lab-sm' }); txt(svg, 8, 352, C.bot, { class: 'bv-lab bv-lab-sm' });
      var rr = rng(7), hiTop = C.hUp;
      for (var i = 0; i < 9; i++) txt(svg, 150 + rr() * 300, hiTop ? 52 + rr() * 60 : 262 + rr() * 50, 'H⁺', { class: 'a-hion', opacity: show === 'electrons' ? 0.25 : 0.5 });
      C.parts.forEach(function (p) {
        var asked = o.ask === p.k;
        if (p.syn) {
          var up = p.syn === 'up', hy = up ? 96 : 300;
          sv('rect', { x: p.x - 10, y: y1 - 4, width: 20, height: y2 - y1 + 8, rx: 5, class: 'a-syn' }, svg);
          sv('rect', { x: p.x - 4, y: up ? hy + 20 : y2, width: 8, height: up ? y1 - hy - 20 : hy - 20 - y2, class: 'a-syn' }, svg);
          sv('ellipse', { cx: p.x, cy: hy, rx: 34, ry: 24, class: 'a-syn' }, svg);
          if (asked) txt(svg, p.x, hy + 8, '?', { class: 'bv-askt', 'text-anchor': 'middle' });
          else { if (!F.quiet) txt(svg, p.x, hy + 5, 'ADP→ATP', { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' }); if (!F.quiet) txt(svg, p.x - 10, up ? hy - 32 : hy + 42, 'ATP synthase', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
          if (show !== 'electrons') { sv('path', { d: up ? 'M' + (p.x + 30) + ',320 C' + (p.x + 30) + ',270 ' + (p.x + 22) + ',180 ' + (p.x + 46) + ',128' : 'M' + (p.x + 30) + ',44 C' + (p.x + 30) + ',100 ' + (p.x + 22) + ',210 ' + (p.x + 46) + ',268', class: 'a-hpath', 'marker-end': hh }, svg); txt(svg, p.x + 36, up ? 340 : 38, 'H⁺', { class: 'a-hion' }); }
          return;
        }
        var top = p.mobile === 'top', bot = p.mobile === 'bot', cy = p.mobile ? ep(p)[1] : ym, hgt = p.small ? 52 : 92;
        if (p.mobile) sv('ellipse', { cx: p.x, cy: cy, rx: p.w / 2, ry: 15, class: p.cls }, svg);
        else if (p.k === 'c2') sv('rect', { x: p.x - p.w / 2, y: ym, width: p.w, height: 52, rx: 12, class: p.cls }, svg);
        else sv('rect', { x: p.x - p.w / 2, y: (p.top ? y1 - 26 : cy - hgt / 2), width: p.w, height: p.top ? 60 : hgt, rx: 14, class: p.cls }, svg);
        var ty = p.top ? y1 + 6 : p.k === 'c2' ? ym + 32 : cy + 5;
        if (asked) txt(svg, p.x, ty + 4, '?', { class: 'bv-askt', 'text-anchor': 'middle' });
        else if (!F.quiet) txt(svg, p.x, ty, p.name, { class: p.name.length > 4 ? 'a-in-sm' : 'a-in', 'text-anchor': 'middle', style: p.name.length > 6 ? 'font-size:11px' : null });
        if (p.light) { sv('path', { d: 'M' + (p.x - 30) + ',58 L' + (p.x - 8) + ',' + (y1 - 50), class: 'bv-ar bv-ar-light', 'marker-end': head(svg, 'bv-arrowhead-hi') }, svg); if (!F.quiet) txt(svg, p.x - 30, 52, 'light', { class: 'bv-sub', 'text-anchor': 'middle' }); }
        if (p.pump && show !== 'electrons') { var ax = p.x + p.w / 2 + 7; sv('path', { d: C.hUp ? 'M' + ax + ',' + (y2 + 52) + ' L' + ax + ',' + (y1 - 44) : 'M' + ax + ',' + (y1 - 56) + ' L' + ax + ',' + (y2 + 48), class: 'a-hpath', 'marker-end': hh }, svg); txt(svg, ax + 6, C.hUp ? y2 + 52 : y1 - 46, 'H⁺', { class: 'a-hion' }); }
      });
      if (show !== 'protons') {
        var pts = C.epath.map(function (k) { return ep(P(k)); });
        var d = 'M' + pts[0][0] + ',' + pts[0][1]; for (var j = 1; j < pts.length; j++) d += ' L' + pts[j][0] + ',' + pts[j][1];
        sv('path', { d: d, class: 'a-epath', 'marker-end': eh }, svg);
        if (mode === 'mito') sv('path', { d: 'M' + P('c2').x + ',' + (ym + 14) + ' L' + (P('q').x - 6) + ',' + (ym - 2), class: 'a-epath', 'marker-end': eh }, svg);
      }
      if (!F.quiet) {
        if (mode === 'mito') { txt(svg, 4, y2 + 92, 'NADH → NAD⁺', { class: 'a-in-sm' }); txt(svg, 172, y2 + 70, 'FADH₂ → FAD', { class: 'a-in-sm', 'text-anchor': 'middle' }); txt(svg, 370, y2 + 92, '½O₂ + 2H⁺ → H₂O', { class: 'a-in-sm', 'text-anchor': 'middle' }); }
        else { txt(svg, 80, y2 + 44, 'H₂O → ½O₂ + 2H⁺', { class: 'a-in-sm', 'text-anchor': 'middle' }); txt(svg, 420, y1 - 46, 'NADP⁺ + H⁺ → NADPH', { class: 'a-in-sm', 'text-anchor': 'middle' }); }
      }
      Array.prototype.slice.call(svg.querySelectorAll('text')).forEach(function (t) { svg.appendChild(t); });
      F.say(C.say[show]);
    }
    draw();
    if (F.inter && !F.quiet) V.seg(F.ctl, { label: 'Show', items: [['both', 'Both'], ['electrons', 'Electrons'], ['protons', 'Protons (H⁺)']], value: show, change: function (v) { show = v; draw(); } });
  });

  /* =========================== apbio-operon =========================== */
  V.register('apbio-operon', function (el, o) {
    var lac = o.operon !== 'trp', st = { lactose: !!o.lactose, glucose: o.glucose !== false, trp: !!o.trp }, cap = lac && o.cap !== false;
    var F = frame(el, o, 'operon', lac ? 'The lac operon of E. coli' : 'The trp operon of E. coli');
    var svg = svgRoot(600, 250, el.getAttribute('aria-label')); wide(F, svg, 540);
    function draw() {
      svg.innerHTML = ''; var mk = head(svg, 'bv-arrowhead'), y = 160;
      sv('line', { x1: 6, y1: y, x2: 594, y2: y, class: 'a-dna' }, svg);
      function seg(x1, x2, cls, label, lbcls) { sv('rect', { x: x1, y: y - 13, width: x2 - x1, height: 26, rx: 5, class: cls }, svg); txt(svg, (x1 + x2) / 2, y + 5, label, { class: lbcls || 'a-in-sm', 'text-anchor': 'middle' }); }
      seg(14, 84, 'a-intron', lac ? 'lacI' : 'trpR');
      if (cap) seg(96, 126, 'a-intron', 'CAP', 'a-in-sm');
      seg(128, 174, 'a-cpx', 'P'); seg(176, 214, 'a-rep', 'O');
      var genes = lac ? ['lacZ', 'lacY', 'lacA'] : ['trpE', 'trpD', 'trpC', 'trpB', 'trpA'], gx = 222, gw = (590 - gx) / genes.length;
      genes.forEach(function (g, i) { seg(gx + i * gw + 2, gx + (i + 1) * gw - 2, 'a-gene', g); });
      txt(svg, 49, y + 34, 'regulatory gene', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 151, y + 34, 'promoter', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 195, y + 50, 'operator', { class: 'bv-sub', 'text-anchor': 'middle' });
      txt(svg, (gx + 590) / 2, y + 34, lac ? 'genes for using lactose' : 'genes for making tryptophan', { class: 'bv-sub', 'text-anchor': 'middle' });
      // repressor state
      var repBound = lac ? !st.lactose : st.trp, capOn = lac && cap && !st.glucose;
      var level = repBound ? 'off' : lac && cap && st.glucose ? 'low' : 'on';
      function repressor(cx, cy, withSmall) {
        sv('path', { d: 'M' + (cx - 24) + ',' + (cy + 14) + ' L' + (cx - 24) + ',' + (cy - 10) + ' Q' + cx + ',' + (cy - 30) + ' ' + (cx + 24) + ',' + (cy - 10) + ' L' + (cx + 24) + ',' + (cy + 14) + ' L' + (cx + 8) + ',' + (cy + 14) + ' L' + (cx + 8) + ',' + (cy + 4) + ' L' + (cx - 8) + ',' + (cy + 4) + ' L' + (cx - 8) + ',' + (cy + 14) + ' Z', class: 'a-rep' }, svg);
        if (withSmall) { sv('circle', { cx: cx + 26, cy: cy - 18, r: 9, class: 'a-e1' }, svg); txt(svg, cx + 40, cy - 14, lac ? 'allolactose' : 'tryptophan', { class: 'bv-sub' }); }
      }
      if (repBound) repressor(195, y - 30, !lac); else repressor(50, 76, lac);
      txt(svg, repBound ? 195 : 8, repBound ? y - 66 : 30, repBound ? 'repressor on the operator' : (lac ? 'repressor: changed shape, cannot bind' : 'repressor (inactive)'), { class: 'bv-lab bv-lab-sm', 'text-anchor': repBound ? 'middle' : 'start' });
      if (capOn) { sv('rect', { x: 94, y: y - 46, width: 34, height: 30, rx: 10, class: 'a-e3' }, svg); txt(svg, 111, y - 26, 'CAP', { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' }); txt(svg, 111, y - 54, 'cAMP-CAP', { class: 'bv-sub', 'text-anchor': 'middle' }); }
      // RNA polymerase
      if (level === 'off') { sv('ellipse', { cx: 150, cy: y - 26, rx: 26, ry: 16, class: 'a-pol' }, svg); txt(svg, 150, y - 22, 'RNAP', { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' }); }
      else {
        sv('ellipse', { cx: 330, cy: y - 26, rx: 26, ry: 16, class: 'a-pol' }, svg); txt(svg, 330, y - 22, 'RNAP', { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' });
        sv('path', { d: 'M230,' + (y - 46) + ' q10,-10 20,0 t20,0 t20,0 t20,0 t20,0', class: 'a-rna', 'stroke-width': level === 'low' ? 3 : 5 }, svg);
        sv('path', { d: 'M360,' + (y - 26) + ' L420,' + (y - 26), class: 'bv-ar', 'marker-end': mk }, svg);
        txt(svg, 270, y - 64, level === 'low' ? 'a little mRNA' : 'mRNA', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
      }
      txt(svg, 590, 30, 'Transcription: ' + (level === 'off' ? 'OFF' : level === 'low' ? 'LOW' : 'ON'), { class: 'bv-lab', 'text-anchor': 'end' });
      var msg;
      if (lac) msg = !st.lactose ? 'No lactose: the lac repressor (made by lacI) sits on the operator and blocks RNA polymerase. The genes are off, which saves energy when there is nothing to digest.' :
        (cap && st.glucose ? 'Lactose is present, so allolactose binds the repressor and changes its shape; it falls off the operator. But glucose is present too, so cAMP is low, CAP does not help, and transcription stays low.' :
          'Lactose is present: allolactose (made from lactose) binds the repressor, which lets go of the operator. ' + (cap ? 'Glucose is scarce, so cAMP rises and cAMP-CAP helps RNA polymerase bind: transcription is high.' : 'RNA polymerase reads the genes.'));
      else msg = st.trp ? 'Plenty of tryptophan: tryptophan binds the trp repressor as a corepressor, which activates it. The active repressor binds the operator and shuts the genes off.' :
        'Little tryptophan: the trp repressor is inactive on its own, so it cannot bind the operator. RNA polymerase reads the genes and the cell makes tryptophan. This operon is on by default.';
      F.say(msg);
    }
    draw();
    if (F.inter && !F.quiet) {
      if (lac) { V.seg(F.ctl, { label: 'Lactose', items: [['0', 'No lactose'], ['1', 'Lactose present']], value: st.lactose ? '1' : '0', change: function (v) { st.lactose = v === '1'; draw(); } }); if (cap) V.seg(F.ctl, { label: 'Glucose', items: [['1', 'Glucose present'], ['0', 'No glucose']], value: st.glucose ? '1' : '0', change: function (v) { st.glucose = v === '1'; draw(); } }); }
      else V.seg(F.ctl, { label: 'Tryptophan', items: [['0', 'Little tryptophan'], ['1', 'Plenty of tryptophan']], value: st.trp ? '1' : '0', change: function (v) { st.trp = v === '1'; draw(); } });
    }
  });

  /* =========================== apbio-ribosome =========================== */
  function aa3(c) { var b = B(); if (!b.CODE) return '?'; var a = b.CODE[c]; return a === '*' ? 'stop' : b.AA[a][0]; }
  function anti(c) { return c.split('').map(function (x) { return { A: 'U', U: 'A', G: 'C', C: 'G' }[x]; }).join(''); }
  V.register('apbio-ribosome', function (el, o) {
    var m = String(o.mrna || 'AUGUUCGGAUAA').toUpperCase().replace(/T/g, 'U'), i0 = m.indexOf('AUG'); if (i0 < 0) i0 = 0;
    var cod = []; for (var i = i0; i + 3 <= m.length; i += 3) { cod.push(m.substr(i, 3)); if (aa3(m.substr(i, 3)) === 'stop') break; }
    var k = cod.length - 1; if (aa3(cod[k]) !== 'stop') { cod.push('UAA'); k++; }
    // the states
    var S = [{ p: 0, t: [{ at: 0, chain: ['Met'] }], say: 'Initiation: the small subunit finds the start codon AUG, the initiator tRNA (carrying Met) pairs with it, and the large subunit joins. The Met-tRNA sits in the P site.' }];
    var chain = ['Met'];
    for (var j = 1; j < k; j++) {
      var a = aa3(cod[j]);
      S.push({ p: j - 1, t: [{ at: j - 1, chain: chain.slice() }, { at: j, aa: a }], gone: j >= 2 ? j - 2 : null, say: 'A tRNA whose anticodon ' + anti(cod[j]) + ' pairs with codon ' + cod[j] + ' enters the A site, carrying ' + a + '.' });
      var nc = chain.concat([a]);
      S.push({ p: j - 1, t: [{ at: j - 1 }, { at: j, chain: nc.slice() }], say: 'Peptide bond: the ribosome moves the growing chain from the P-site tRNA onto ' + a + ' in the A site. The P-site tRNA is now empty.' });
      S.push({ p: j, t: [{ at: j - 1 }, { at: j, chain: nc.slice() }], say: 'Translocation: the ribosome shifts one codon toward the 3′ end. The empty tRNA moves to the E site and will leave; the chain-carrying tRNA is now in the P site.' });
      chain = nc;
    }
    S.push({ p: k - 1, t: [{ at: k - 1, chain: chain.slice() }], rf: true, say: 'Termination: the stop codon ' + cod[k] + ' reaches the A site. No tRNA pairs with it; a release factor binds instead.' });
    S.push({ p: k - 1, t: [], free: chain.slice(), apart: true, say: 'The release factor frees the finished chain (' + chain.join('-') + '), and the ribosome comes apart. The chain folds into its shape.' });
    var F = frame(el, o, 'ribosome', 'A ribosome translating mRNA, with the E, P and A sites');
    var svg = svgRoot(600, 330, el.getAttribute('aria-label')); wide(F, svg, 540);
    var cw = 56, x0 = 300 - cw * 1.5;
    function draw(s) {
      var Sx = S[s]; svg.innerHTML = '';
      var shift = (Sx.p) * cw, X = function (ci) { return x0 + ci * cw - shift + cw / 2 + cw; }; // P site codon at center
      var my = 236;
      // mRNA
      var first = -Sx.p - 2, mstr = '';
      sv('line', { x1: 0, y1: my + 14, x2: 600, y2: my + 14, class: 'a-rna', 'stroke-width': 4 }, svg);
      for (var ci = -3; ci < cod.length + 3; ci++) {
        var cx = X(ci); if (cx < -30 || cx > 630) continue;
        var c = ci >= 0 && ci < cod.length ? cod[ci] : (ci < 0 && i0 + ci * 3 >= 0 ? m.substr(i0 + ci * 3, 3) : '');
        if (c) txt(svg, cx, my + 6, c, { class: 'a-in a-mono', 'text-anchor': 'middle', style: 'font-size:17px;letter-spacing:2px' });
      }
      txt(svg, 8, my + 36, '5′', { class: 'bv-lab bv-lab-sm' }); txt(svg, 592, my + 36, '3′', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'end' });
      // ribosome: sites over codons p-1 (E), p (P), p+1 (A)
      var ex = X(Sx.p - 1), apart = Sx.apart, ly = apart ? 6 : 24;
      sv('rect', { x: ex - cw / 2 - 18, y: ly, width: cw * 3 + 36, height: 190, rx: 40, class: 'a-cpx', opacity: 0.55 }, svg);
      sv('rect', { x: ex - cw / 2 - 18, y: apart ? 284 : 250, width: cw * 3 + 36, height: 40, rx: 18, class: 'a-cpx', opacity: 0.55 }, svg);
      ['E', 'P', 'A'].forEach(function (nm, q) {
        var sx = X(Sx.p - 1 + q); sv('rect', { x: sx - cw / 2 + 3, y: ly + 94, width: cw - 6, height: 92, rx: 8, fill: 'none', class: 'a-axis', 'stroke-dasharray': '4 3' }, svg);
        if (o.ask === nm) txt(svg, sx, ly + 30, '?', { class: 'bv-askt', 'text-anchor': 'middle' }); else if (!F.quiet || o.ask) txt(svg, sx, ly + 30, nm, { class: 'bv-lab', 'text-anchor': 'middle' });
      });
      if (!F.quiet) { txt(svg, ex + cw * 3 + 28, ly + 20, 'large subunit', { class: 'bv-sub' }); }
      // tRNAs
      (Sx.t || []).forEach(function (t) {
        var tx = X(t.at), c = cod[t.at], top = 128;
        sv('path', { d: 'M' + (tx - 18) + ',' + (my - 22) + ' L' + (tx - 18) + ',' + (top + 28) + ' Q' + tx + ',' + (top + 12) + ' ' + (tx + 18) + ',' + (top + 28) + ' L' + (tx + 18) + ',' + (my - 22) + ' Z', class: 'a-ps' }, svg);
        txt(svg, tx, my - 28, anti(c), { class: 'a-in-sm a-mono', 'text-anchor': 'middle' });
        var ch = t.chain || (t.aa ? [t.aa] : null);
        if (ch) ch.slice().reverse().forEach(function (a, q) { var bx = tx - q * 30, by = top - 18 - (q ? 8 : 0); sv('circle', { cx: bx, cy: by, r: 16, class: q === 0 && t.aa && !t.chain ? 'a-e1' : 'a-e3' }, svg); txt(svg, bx, by + 4, a, { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' }); });
      });
      if (Sx.rf) { var rx = X(k); sv('rect', { x: rx - 22, y: 130, width: 44, height: my - 140, rx: 12, class: 'a-e4' }, svg); txt(svg, rx, 192, 'RF', { class: 'a-in', 'text-anchor': 'middle' }); }
      if (Sx.free) Sx.free.forEach(function (a, q) { var bx = 40 + q * 34, by = 230 - (q % 2) * 18 - 60; sv('circle', { cx: bx, cy: by, r: 16, class: 'a-e3' }, svg); txt(svg, bx, by + 4, a, { class: 'a-in-sm', 'text-anchor': 'middle', style: 'font-size:11px' }); });
      F.say(Sx.say);
    }
    var s0 = o.step !== undefined ? M.max(0, M.min(S.length - 1, o.step | 0)) : 0;
    if (F.inter && !F.quiet) stepper(F.ctl, S.length, draw, s0); else draw(s0);
  });

  /* =========================== apbio-splice =========================== */
  V.register('apbio-splice', function (el, o) {
    var nE = M.max(3, M.min(5, o.exons || 4)), skip = o.skip !== undefined ? o.skip : 2, variant = 0;
    var F = frame(el, o, 'splice', 'A eukaryotic gene becoming a mature mRNA: cap, tail and splicing');
    var svg = svgRoot(600, 250, el.getAttribute('aria-label')); wide(F, svg, 520);
    var SAY = ['The gene in the DNA: exons (expressed regions, green) separated by introns (tan). A promoter sits upstream.',
      'Transcription: RNA polymerase copies the whole gene, exons and introns, into pre-mRNA, built 5′ → 3′.',
      'Processing begins: a 5′ cap (a modified G) is added to the front, and a poly-A tail of many A nucleotides to the back. They protect the mRNA and help ribosomes find it.',
      'Splicing: spliceosomes cut out the introns and join the exons. Exons are kept; introns are removed.',
      'The mature mRNA leaves the nucleus through a nuclear pore and is translated in the cytoplasm.'];
    function draw(s) {
      svg.innerHTML = ''; var y = s === 0 ? 120 : 110, x = 30, wE = 60, wI = (540 - nE * wE) / (nE - 1);
      txt(svg, 300, 26, s === 0 ? 'DNA (gene)' : s < 3 ? 'pre-mRNA' : 'mature mRNA' + (variant ? ' (variant 2: exon ' + (skip + 1) + ' skipped)' : ''), { class: 'bv-lab', 'text-anchor': 'middle' });
      if (s === 0) { sv('rect', { x: 4, y: y - 10, width: 22, height: 20, rx: 4, class: 'a-cpx' }, svg); txt(svg, 15, y + 32, 'promoter', { class: 'bv-sub', 'text-anchor': 'start' }); }
      if (s < 3) {
        for (var i = 0; i < nE; i++) {
          var ex = x + i * (wE + wI); sv('rect', { x: ex, y: y - 16, width: wE, height: 32, rx: 5, class: 'a-gene' }, svg); txt(svg, ex + wE / 2, y + 5, 'E' + (i + 1), { class: 'a-in-sm', 'text-anchor': 'middle' });
          if (i < nE - 1) { sv('rect', { x: ex + wE, y: y - 10, width: wI, height: 20, rx: 3, class: 'a-intron' }, svg); txt(svg, ex + wE + wI / 2, y + 30, 'intron', { class: 'bv-sub', 'text-anchor': 'middle' }); }
        }
        if (s >= 1 && !F.quiet) { txt(svg, x - 6, y - 24, '5′', { class: 'bv-lab bv-lab-sm' }); txt(svg, 572, y - 24, '3′', { class: 'bv-lab bv-lab-sm' }); }
      }
      if (s >= 2) {
        var exs = []; for (var q = 0; q < nE; q++) if (!(s >= 3 && variant && q === skip)) exs.push(q);
        var total = s >= 3 ? exs.length * wE : 0, sx = s >= 3 ? 300 - total / 2 : x, yy = s >= 3 ? 130 : y;
        if (s >= 3) exs.forEach(function (q, j) { sv('rect', { x: sx + j * wE, y: yy - 16, width: wE, height: 32, rx: j === 0 ? 5 : 0, class: 'a-gene' }, svg); txt(svg, sx + j * wE + wE / 2, yy + 5, 'E' + (q + 1), { class: 'a-in-sm', 'text-anchor': 'middle' }); });
        var left = s >= 3 ? sx : x, right = s >= 3 ? sx + total : 570;
        sv('circle', { cx: left - 14, cy: yy, r: 12, class: 'a-e1' }, svg); txt(svg, left - 14, yy + 4, 'G', { class: 'a-in-sm', 'text-anchor': 'middle' });
        txt(svg, left - 14, yy + 36, '5′ cap', { class: 'bv-sub', 'text-anchor': 'middle' });
        sv('rect', { x: right + 2, y: yy - 6, width: s >= 3 ? 70 : 26, height: 12, rx: 6, class: 'a-e3' }, svg); txt(svg, right + (s >= 3 ? 37 : 15), yy + 30, 'AAAA… tail', { class: 'bv-sub', 'text-anchor': 'middle' });
        if (s >= 3) {
          if (!F.quiet) txt(svg, 300, 196, variant ? 'One gene, two proteins: the cell chose to skip exon ' + (skip + 1) + '.' : 'Introns cut out; exons joined in order.', { class: 'bv-sub', 'text-anchor': 'middle' });
          if (s === 4) { sv('path', { d: 'M300,160 L300,220', class: 'bv-ar', 'marker-end': head(svg, 'bv-arrowhead') }, svg); txt(svg, 312, 236, 'to the cytoplasm and a ribosome', { class: 'bv-sub' }); }
        }
      }
      F.say(SAY[s] + (s >= 3 && o.alt !== false ? ' Alternative splicing: switch the variant to see one gene give a second mRNA.' : ''));
    }
    var cur = o.step !== undefined ? M.max(0, M.min(4, o.step | 0)) : 0;
    if (F.inter && !F.quiet) {
      var stp = stepper(F.ctl, 5, function (s) { cur = s; draw(s); }, cur);
      if (o.alt !== false) V.seg(F.ctl, { label: 'Splice variant', items: [['0', 'Variant 1'], ['1', 'Variant 2']], value: '0', change: function (v) { variant = +v; if (cur < 3) stp.set(3); else draw(cur); } });
    } else draw(o.step !== undefined ? cur : 3);
  });

  /* =========================== apbio-genemap =========================== */
  V.register('apbio-genemap', function (el, o) {
    var genes = (o.genes || [{ name: 'A', pos: 0 }, { name: 'B', pos: 12 }, { name: 'C', pos: 30 }]).slice().sort(function (a, b) { return a.pos - b.pos; });
    var F = frame(el, o, 'genemap', 'A gene map: genes placed along a chromosome by recombination frequency');
    var lo = genes[0].pos, hi = genes[genes.length - 1].pos, span = M.max(1, hi - lo), svg = svgRoot(600, 200, el.getAttribute('aria-label')); F.body.appendChild(svg);
    var known = o.known || (F.quiet ? [] : genes.slice(1).map(function (g, i) { return [genes[i].name, g.name]; })), sel = [];
    function X(p) { return 50 + (p - lo) / span * 500; }
    function pos(n) { return genes.filter(function (g) { return g.name === n; })[0].pos; }
    function draw() {
      svg.innerHTML = '';
      sv('rect', { x: 30, y: 60, width: 540, height: 34, rx: 17, class: 'a-gene' }, svg);
      genes.forEach(function (g) {
        var x = X(g.pos), on = sel.indexOf(g.name) >= 0, asked = o.ask === g.name;
        sv('line', { x1: x, y1: 56, x2: x, y2: 98, class: on ? 'a-guide' : 'a-axis', 'stroke-width': 3 }, svg);
        var t = txt(svg, x, 44, asked ? '?' : g.name, { class: asked ? 'bv-askt' : 'bv-lab', 'text-anchor': 'middle' });
        if (F.inter && !F.quiet) { var hit = sv('rect', { x: x - 22, y: 20, width: 44, height: 84, fill: 'transparent', tabindex: 0, role: 'button', 'aria-label': 'gene ' + g.name, style: 'cursor:pointer' }, svg); hit.addEventListener('click', function () { pick(g.name); }); hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.name); } }); }
        if (!F.quiet && o.positions) txt(svg, x, 118, fmt(g.pos, 1), { class: 'bv-sub', 'text-anchor': 'middle' });
      });
      var row = 0;
      known.concat(o.ask && Array.isArray(o.ask) ? [o.ask] : []).forEach(function (pr, i) {
        var a = X(pos(pr[0])), b = X(pos(pr[1])), x1 = M.min(a, b), x2 = M.max(a, b), y = 130 + (row++ % 3) * 22, asked = Array.isArray(o.ask) && o.ask[0] === pr[0] && o.ask[1] === pr[1];
        if (asked && i < known.length) return;
        sv('path', { d: 'M' + x1 + ',' + (y - 6) + ' L' + x1 + ',' + y + ' L' + x2 + ',' + y + ' L' + x2 + ',' + (y - 6), class: asked ? 'a-guide' : 'a-axis', fill: 'none' }, svg);
        txt(svg, (x1 + x2) / 2, y + 16, asked ? '?' : fmt(M.abs(pos(pr[1]) - pos(pr[0])), 1) + ' map units', { class: asked ? 'bv-asklab' : 'bv-sub', 'text-anchor': 'middle' });
      });
    }
    function pick(n) { if (sel.indexOf(n) >= 0) sel = sel.filter(function (x) { return x !== n; }); else { sel.push(n); if (sel.length > 2) sel.shift(); } draw(); if (sel.length === 2) { var d = M.abs(pos(sel[0]) - pos(sel[1])); F.say(sel[0] + ' to ' + sel[1] + ': ' + fmt(d, 1) + ' map units, so about ' + fmt(M.min(d, 50), 1) + '% of test-cross offspring are recombinant for these two genes' + (d > 50 ? ' (genes this far apart act as if unlinked: at most 50%).' : '.')); } else F.say('Tap two genes to compare them.'); }
    draw(); if (F.inter && !F.quiet) F.say('Tap two genes to read the distance between them. One map unit = 1% recombinant offspring.');
  });

  /* =========================== apbio-nondisjunction =========================== */
  V.register('apbio-nondisjunction', function (el, o) {
    var when = o.when === 'I' || o.when === 'II' ? o.when : 'none';
    var F = frame(el, o, 'nondisjunction', 'One chromosome pair through meiosis, with or without nondisjunction');
    var svg = svgRoot(600, 300, el.getAttribute('aria-label')); wide(F, svg, 500);
    function chrom(x, y, col, dup) { var c = col ? 'a-e3' : 'a-e1'; sv('rect', { x: x - (dup ? 8 : 4), y: y - 18, width: 8, height: 36, rx: 4, class: c }, svg); if (dup) sv('rect', { x: x, y: y - 18, width: 8, height: 36, rx: 4, class: c }, svg); }
    function cell(x, y, r, list) { sv('circle', { cx: x, cy: y, r: r, class: 'a-gene', opacity: 0.8 }, svg); var w = list.length, sp = 20; list.forEach(function (c, i) { chrom(x + (i - (w - 1) / 2) * sp, y, c[0], c[1]); }); }
    function draw() {
      svg.innerHTML = ''; var mk = head(svg, 'bv-arrowhead');
      cell(300, 46, 34, [[0, 1], [1, 1]]);
      if (!F.quiet) txt(svg, 352, 30, 'one pair, copied (2n)', { class: 'bv-sub' });
      var m1 = when === 'I' ? [[[0, 1], [1, 1]], []] : [[[0, 1]], [[1, 1]]];
      [150, 450].forEach(function (x, i) { sv('path', { d: 'M' + (i ? 320 : 280) + ',78 L' + (i ? 430 : 170) + ',112', class: 'bv-ar', 'marker-end': mk }, svg); cell(x, 140, 30, m1[i]); });
      txt(svg, 300, 98, 'meiosis I' + (when === 'I' ? ': the homologs fail to separate' : ''), { class: when === 'I' ? 'bv-lab bv-lab-sm bv-asklab' : 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
      var gam = [];
      m1.forEach(function (cl, ci) {
        var g0 = [], g1 = [];
        cl.forEach(function (c) { if (when === 'II' && ci === 0) { g0.push([c[0], 0], [c[0], 0]); } else { g0.push([c[0], 0]); g1.push([c[0], 0]); } });
        gam.push(g0, g1);
      });
      var xs = [75, 225, 375, 525];
      gam.forEach(function (g, i) {
        sv('path', { d: 'M' + (i < 2 ? 150 : 450) + ',172 L' + xs[i] + ',214', class: 'bv-ar', 'marker-end': mk }, svg);
        var list = g;
        cell(xs[i], 246, 26, list);
        var n = list.length, tag = n === 1 ? 'n' : n === 2 ? 'n + 1' : 'n − 1', asked = o.ask === i;
        if (asked) txt(svg, xs[i], 296, '?', { class: 'bv-askt', 'text-anchor': 'middle' });
        else if (!F.quiet) txt(svg, xs[i], 292, tag, { class: n === 1 ? 'bv-lab bv-lab-sm' : 'bv-lab bv-lab-sm bv-asklab', 'text-anchor': 'middle' });
      });
      txt(svg, 300, 200, 'meiosis II' + (when === 'II' ? ': sister chromatids fail to separate (left cell)' : ''), { class: when === 'II' ? 'bv-lab bv-lab-sm bv-asklab' : 'bv-lab bv-lab-sm', 'text-anchor': 'middle' });
      F.say(when === 'none' ? 'Normal meiosis: meiosis I separates the homologs and meiosis II separates the sister chromatids, so each of the four cells gets one chromosome of this pair (n).' :
        when === 'I' ? 'Nondisjunction in meiosis I: both homologs go to one cell. All four cells are abnormal: two have an extra chromosome (n + 1) and two are missing it (n − 1).' :
          'Nondisjunction in meiosis II: meiosis I was normal, but in one cell the sister chromatids stay together. Two cells are normal (n), one has an extra chromosome (n + 1) and one is missing it (n − 1).');
    }
    draw();
    if (F.inter && !F.quiet) V.seg(F.ctl, { label: 'Nondisjunction', items: [['none', 'Normal'], ['I', 'In meiosis I'], ['II', 'In meiosis II']], value: when, change: function (v) { when = v; draw(); } });
  });

  /* =========================== apbio-cascade =========================== */
  V.register('apbio-cascade', function (el, o) {
    var gain = M.max(2, M.min(10, o.gain || 10)), steps = M.max(1, M.min(4, o.steps || 3));
    var names = o.names || ['1 signal molecule', 'relay proteins', 'kinase 1', 'kinase 2', 'product molecules'];
    var F = frame(el, o, 'cascade', 'Signal amplification in a cascade');
    var svg = svgRoot(600, 300, el.getAttribute('aria-label')); F.body.appendChild(svg);
    function draw() {
      svg.innerHTML = ''; var rows = steps + 1, rh = 270 / rows;
      for (var r = 0; r < rows; r++) {
        var n = M.pow(gain, r), y = 22 + r * rh + rh / 2, show = M.min(n, 30), sp = M.min(13, 360 / show), x0 = 150;
        for (var q = 0; q < show; q++) sv('circle', { cx: x0 + q * sp + 6, cy: y, r: M.max(3, M.min(6, sp / 2 - 1)), class: r === 0 ? 'a-e1' : r === rows - 1 ? 'a-e3' : 'a-e2' }, svg);
        if (n > show) txt(svg, x0 + show * sp + 14, y + 5, '…', { class: 'bv-lab' });
        txt(svg, 8, y + 5, r === 0 ? names[0] : r === rows - 1 ? names[names.length - 1] : names[M.min(r, names.length - 2)], { class: 'bv-sub' });
        if (!F.quiet || r === 0) txt(svg, 592, y + 5, commas(n), { class: 'bv-lab', 'text-anchor': 'end' });
      }
      var mul = []; for (var i = 0; i < steps; i++) mul.push(gain);
      F.say('Each step multiplies: 1 × ' + mul.join(' × ') + ' = ' + commas(M.pow(gain, steps)) + '. Adding the gains (' + mul.join(' + ') + ' = ' + gain * steps + ') would badly undercount.');
    }
    draw();
    if (F.inter && !F.quiet) { V.slider(F.ctl, { label: 'molecules activated by each one', min: 2, max: 10, step: 1, value: gain, fmt: function (v) { return String(v); }, input: function (v) { gain = v; draw(); } }); V.slider(F.ctl, { label: 'steps', min: 1, max: 4, step: 1, value: steps, fmt: function (v) { return String(v); }, input: function (v) { steps = v; draw(); } }); }
  });

  /* =========================== apbio-cube =========================== */
  V.register('apbio-cube', function (el, o) {
    var s = o.s || 3, max = o.max || 10, unit = o.unit || 'µm', cmp = o.compare;
    var F = frame(el, o, 'cube', 'Surface area and volume of cubes');
    var svg = svgRoot(600, 240, el.getAttribute('aria-label')); F.body.appendChild(svg); var tb = h('div', 'a-wrap'); F.body.appendChild(tb);
    function cube(cx, by, size) { var d = size * 0.45; var p = function (a) { return a.map(function (q) { return q[0] + ',' + q[1]; }).join(' '); };
      sv('polygon', { points: p([[cx - size / 2, by], [cx + size / 2, by], [cx + size / 2, by - size], [cx - size / 2, by - size]]), class: 'a-gene' }, svg);
      sv('polygon', { points: p([[cx - size / 2, by - size], [cx + size / 2, by - size], [cx + size / 2 + d, by - size - d * 0.6], [cx - size / 2 + d, by - size - d * 0.6]]), class: 'a-ps' }, svg);
      sv('polygon', { points: p([[cx + size / 2, by], [cx + size / 2 + d, by - d * 0.6], [cx + size / 2 + d, by - size - d * 0.6], [cx + size / 2, by - size]]), class: 'a-cpx' }, svg); }
    function row(x) { var c = B().cube ? B().cube(x) : { sa: 6 * x * x, v: x * x * x, ratio: 6 / x }; return c; }
    function draw() {
      svg.innerHTML = ''; var list = cmp || [s], n = list.length, scale = 150 / M.max.apply(null, list.concat(cmp ? [] : [max]));
      list.forEach(function (x, i) { var cx = cmp ? 600 * (i + 0.5) / n - 50 : 170; cube(cx, 210, M.max(6, x * scale)); txt(svg, cx, 232, 'side ' + fmt(x, 2) + ' ' + unit, { class: 'bv-sub', 'text-anchor': 'middle' }); });
      if (!cmp && !F.quiet) { var c = row(s); [['surface area = 6s²', fmt(c.sa, 2) + ' ' + unit + '²'], ['volume = s³', fmt(c.v, 2) + ' ' + unit + '³'], ['SA : V = 6/s', fmt(c.ratio, 3) + ' per ' + unit]].forEach(function (r, i) { txt(svg, 360, 70 + i * 50, r[0], { class: 'bv-sub' }); txt(svg, 360, 92 + i * 50, r[1], { class: 'bv-lab' }); }); }
      tb.innerHTML = '';
      if (cmp) { var t = '<table class="a-tbl"><tr><th>side (' + esc(unit) + ')</th><th>surface area</th><th>volume</th><th>SA : V</th></tr>'; cmp.forEach(function (x) { var c = row(x); t += '<tr><td>' + fmt(x, 2) + '</td><td>' + (F.quiet ? '?' : fmt(c.sa, 2)) + '</td><td>' + (F.quiet ? '?' : fmt(c.v, 2)) + '</td><td>' + (F.quiet ? '?' : fmt(c.ratio, 3)) + '</td></tr>'; }); tb.innerHTML = t + '</table>'; }
      F.say(cmp ? 'Each time the side doubles, surface area grows 4 times but volume grows 8 times, so SA : V halves.' : 'A ' + fmt(s, 2) + ' ' + esc(unit) + ' cube has ' + fmt(6 / s, 3) + ' ' + esc(unit) + '² of surface for every ' + esc(unit) + '³ of volume. Make it bigger and the ratio falls.');
    }
    draw();
    if (!cmp && F.inter && !F.quiet) V.slider(F.ctl, { label: 'side s (' + unit + ')', min: 1, max: max, step: 1, value: s, fmt: function (v) { return String(v); }, input: function (v) { s = v; draw(); } });
  });

  /* =========================== apbio-psi =========================== */
  var RB = 0.0831;
  V.register('apbio-psi', function (el, o) {
    var Lf = Object.assign({ name: 'cell', C: 0.3, i: 1, P: 0 }, o.left || {}), Rt = Object.assign({ name: 'solution', C: 0.1, i: 1, P: 0 }, o.right || {}), T = o.T || 295;
    var F = frame(el, o, 'psi', 'Water potential on two sides of a membrane');
    var svg = svgRoot(600, 270, el.getAttribute('aria-label')); wide(F, svg, 500);
    function psi(s) { var ps = -s.i * s.C * RB * T; return { s: ps, t: ps + s.P }; }
    function draw() {
      svg.innerHTML = ''; var a = psi(Lf), b = psi(Rt), mk = head(svg, 'bv-arrowhead-lo');
      [[Lf, 30, a], [Rt, 320, b]].forEach(function (q) {
        var s = q[0], x = q[1]; sv('rect', { x: x, y: 40, width: 250, height: 150, rx: 14, class: 'a-gene', opacity: 0.6 }, svg);
        var rr = rng(Math.round(s.C * 1000) + x), nd = M.round(s.C * s.i * 40); for (var k = 0; k < nd; k++) sv('circle', { cx: x + 14 + rr() * 222, cy: 54 + rr() * 122, r: 4, class: 'a-dot' }, svg);
        txt(svg, x + 125, 30, s.name, { class: 'bv-lab', 'text-anchor': 'middle' });
        txt(svg, x + 8, 212, 'C = ' + fmt(s.C, 3) + ' M, i = ' + s.i + ', Ψp = ' + fmt(s.P, 2) + ' bar', { class: 'bv-sub' });
        if (!F.quiet) { txt(svg, x + 8, 232, 'Ψs = −iCRT = ' + fmt(q[2].s, 2) + ' bar', { class: 'bv-sub' }); txt(svg, x + 8, 256, 'Ψ = ' + fmt(q[2].t, 2) + ' bar', { class: 'bv-lab' }); }
      });
      sv('line', { x1: 300, y1: 36, x2: 300, y2: 196, class: 'a-axis', 'stroke-dasharray': '6 5', 'stroke-width': 3 }, svg);
      var d = a.t - b.t;
      if (!F.quiet) { if (M.abs(d) < 0.005) txt(svg, 300, 120, '⇄', { class: 'bv-lab', 'text-anchor': 'middle' }); else sv('path', { d: d > 0 ? 'M230,115 L370,115' : 'M370,115 L230,115', class: 'bv-ar', 'stroke-width': 6, 'marker-end': mk }, svg); if (M.abs(d) >= 0.005) txt(svg, 300, 98, 'water', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
      F.say(M.abs(d) < 0.005 ? 'The water potentials are equal, so there is no net movement of water.' : 'Water moves from the higher water potential (' + (d > 0 ? Lf.name : Rt.name) + ', ' + fmt(M.max(a.t, b.t), 2) + ' bar) to the lower one (' + (d > 0 ? Rt.name : Lf.name) + ', ' + fmt(M.min(a.t, b.t), 2) + ' bar). More solute means a more negative Ψs.');
    }
    draw();
    if (F.inter && !F.quiet) { V.slider(F.ctl, { label: Lf.name + ' solute (M)', min: 0, max: 1, step: 0.05, value: Lf.C, fmt: function (v) { return fmt(v, 2); }, input: function (v) { Lf.C = v; draw(); } }); V.slider(F.ctl, { label: Rt.name + ' solute (M)', min: 0, max: 1, step: 0.05, value: Rt.C, fmt: function (v) { return fmt(v, 2); }, input: function (v) { Rt.C = v; draw(); } }); V.slider(F.ctl, { label: Lf.name + ' pressure Ψp (bar)', min: 0, max: 10, step: 0.5, value: Lf.P, fmt: function (v) { return fmt(v, 1); }, input: function (v) { Lf.P = v; draw(); } }); }
  });

  /* =========================== apbio-semilog =========================== */
  // ladder bands placed with the kit's gelPos (distance linear in log size); unknown read back by the same line
  V.register('apbio-semilog', function (el, o) {
    var lad = (o.ladder || [5000, 3000, 2000, 1000, 500, 250]).slice().sort(function (a, b) { return b - a; }), len = o.len || 60;
    var dist = function (bp) { return B().gelPos ? B().gelPos(bp) * len : (M.log(10000) - M.log(bp)) / M.log(100) * 0.9 * len + 0.05 * len; };
    var size = function (d) { return B().gelSize ? B().gelSize(d / len) : 0; };
    var unk = o.unknown !== undefined ? o.unknown : dist(700);
    var F = frame(el, o, 'semilog', 'A standard curve: distance moved against fragment size on a log scale');
    var svg = svgRoot(600, 320, el.getAttribute('aria-label')); wide(F, svg, 480);
    var pl = 70, pr = 580, pt = 20, pb = 270, dmax = len, lmin = M.log10(100), lmax = M.log10(10000);
    function X(d) { return pl + d / dmax * (pr - pl); } function Y(bp) { return pb - (M.log10(bp) - lmin) / (lmax - lmin) * (pb - pt); }
    function draw() {
      svg.innerHTML = '';
      [100, 200, 500, 1000, 2000, 5000, 10000].forEach(function (v) { sv('line', { x1: pl, y1: Y(v), x2: pr, y2: Y(v), class: 'a-grid' }, svg); txt(svg, pl - 6, Y(v) + 4, commas(v), { class: 'a-tick', 'text-anchor': 'end' }); });
      for (var d = 0; d <= dmax; d += 10) { sv('line', { x1: X(d), y1: pb, x2: X(d), y2: pb + 5, class: 'a-axis' }, svg); txt(svg, X(d), pb + 20, String(d), { class: 'a-tick', 'text-anchor': 'middle' }); }
      sv('line', { x1: pl, y1: pb, x2: pr, y2: pb, class: 'a-axis' }, svg); sv('line', { x1: pl, y1: pt, x2: pl, y2: pb, class: 'a-axis' }, svg);
      txt(svg, (pl + pr) / 2, 310, 'distance from the well (mm)', { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, 14, 150, 'size (bp, log scale)', { class: 'bv-sub', 'text-anchor': 'middle', transform: 'rotate(-90 14 150)' });
      sv('line', { x1: X(dist(lad[0])), y1: Y(lad[0]), x2: X(dist(lad[lad.length - 1])), y2: Y(lad[lad.length - 1]), class: 'a-fit' }, svg);
      lad.forEach(function (bp) { sv('circle', { cx: X(dist(bp)), cy: Y(bp), r: 5, class: 'a-pt' }, svg); });
      var us = size(unk);
      sv('circle', { cx: X(unk), cy: Y(us), r: 6, class: 'a-unk' }, svg);
      if (!F.quiet) { sv('path', { d: 'M' + X(unk) + ',' + pb + ' L' + X(unk) + ',' + Y(us) + ' L' + pl + ',' + Y(us), class: 'a-guide' }, svg); }
      F.say('The unknown band moved ' + fmt(unk, 1) + ' mm. Reading across on the log scale: about ' + commas(M.round(us / 10) * 10) + ' bp. On a log scale, halfway between 1,000 and 500 is √(1,000 × 500) ≈ 707, not 750.');
    }
    draw();
    if (F.inter && !F.quiet) V.slider(F.ctl, { label: 'unknown band (mm)', min: M.ceil(dist(lad[0])), max: M.floor(dist(lad[lad.length - 1])), step: 0.5, value: unk, fmt: function (v) { return fmt(v, 1) + ' mm'; }, input: function (v) { unk = v; draw(); } });
  });

  /* =========================== apbio-potential =========================== */
  V.register('apbio-potential', function (el, o) {
    var F = frame(el, o, 'potential', 'How a neuron builds its resting membrane potential');
    var svg = svgRoot(600, 300, el.getAttribute('aria-label')); wide(F, svg, 500);
    var SAY = ['Start: if the ions were spread evenly, there would be no gradients and no voltage across the membrane.',
      'The sodium-potassium pump uses ATP to move 3 Na⁺ out and 2 K⁺ in each cycle. Now Na⁺ is concentrated outside and K⁺ inside. The pump by itself makes only a small part of the voltage.',
      'Potassium leak channels let K⁺ flow out, down its gradient. Each K⁺ that leaves takes a positive charge with it, while large negative ions (proteins) stay inside. The inside turns negative.',
      'Balance: the negative inside pulls K⁺ back in as hard as the gradient pushes it out. The resting potential settles near −70 mV, and the pump keeps the gradients from running down.'];
    var MV = ['0 mV', 'slightly negative', 'turning negative', 'about −70 mV'];
    function draw(s) {
      svg.innerHTML = ''; var mk = head(svg, 'bv-arrowhead');
      sv('rect', { x: 0, y: 128, width: 600, height: 44, class: 'a-mem' }, svg);
      txt(svg, 8, 22, 'outside the cell', { class: 'bv-lab bv-lab-sm' }); txt(svg, 8, 292, 'inside the cell', { class: 'bv-lab bv-lab-sm' });
      var slots = [[], []]; [0, 1].forEach(function (sd) { var r0 = rng(11 + sd), a = []; for (var c = 0; c < 8; c++) for (var r = 0; r < 3; r++) a.push([34 + c * 46 + (r % 2) * 18, sd ? 214 + r * 26 : 50 + r * 26]); for (var i = a.length - 1; i > 0; i--) { var j = M.floor(r0() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } slots[sd] = a; });
      var used = [0, 0];
      function ions(n, side, cls, lab) { for (var k = 0; k < n; k++) { var q = slots[side][used[side]++ % 24]; txt(svg, q[0], q[1], lab, { class: cls }); } }
      var naOut = s === 0 ? 5 : 9, naIn = s === 0 ? 5 : 2, kOut = s === 0 ? 5 : s === 1 ? 2 : 4, kIn = s === 0 ? 5 : s === 1 ? 9 : 7;
      ions(naOut, 0, 'a-nat', 'Na⁺'); ions(naIn, 1, 'a-nat', 'Na⁺'); ions(kOut, 0, 'a-kt', 'K⁺'); ions(kIn, 1, 'a-kt', 'K⁺');
      if (s >= 2) { ions(4, 1, 'bv-sub', 'A⁻'); for (var q = 0; q < 6; q++) { txt(svg, 30 + q * 70, 122, '+', { class: 'bv-lab' }); txt(svg, 30 + q * 70, 190, '−', { class: 'bv-lab' }); } }
      if (s >= 1) { sv('rect', { x: 410, y: 116, width: 50, height: 68, rx: 12, class: 'a-e2' }, svg); if (o.ask === 'pump') txt(svg, 435, 158, '?', { class: 'bv-askt', 'text-anchor': 'middle' }); else if (!F.quiet) txt(svg, 404, 160, 'pump', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'end' });
        sv('path', { d: 'M424,196 L424,92', class: 'bv-ar', 'marker-end': mk }, svg); txt(svg, 400, 88, '3 Na⁺', { class: 'a-nat', 'text-anchor': 'end' }); sv('path', { d: 'M446,92 L446,196', class: 'bv-ar', 'marker-end': mk }, svg); txt(svg, 452, 212, '2 K⁺', { class: 'a-kt' }); txt(svg, 470, 152, 'ATP', { class: 'bv-sub' }); }
      if (s >= 2) { sv('rect', { x: 520, y: 120, width: 14, height: 60, rx: 4, class: 'a-e3' }, svg); sv('rect', { x: 546, y: 120, width: 14, height: 60, rx: 4, class: 'a-e3' }, svg); sv('path', { d: 'M540,200 L540,96', class: 'bv-ar', 'marker-end': mk }, svg); txt(svg, 540, 90, 'K⁺', { class: 'a-kt', 'text-anchor': 'middle' }); if (o.ask === 'channel') txt(svg, 540, 232, '?', { class: 'bv-askt', 'text-anchor': 'middle' }); else if (!F.quiet) txt(svg, 540, 228, 'leak channel', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
      if (!F.quiet) { sv('rect', { x: 440, y: 248, width: 150, height: 40, rx: 10, class: 'a-cpx' }, svg); txt(svg, 515, 274, MV[s], { class: 'a-meter', 'text-anchor': 'middle', fill: 'currentColor' }); }
      F.say(SAY[s]);
    }
    var s0 = o.step !== undefined ? M.max(0, M.min(3, o.step | 0)) : (F.inter && !F.quiet ? 0 : 3);
    if (F.inter && !F.quiet) stepper(F.ctl, 4, draw, s0); else draw(s0);
  });

  /* =========================== apbio-bottles =========================== */
  V.register('apbio-bottles', function (el, o) {
    var I = o.initial !== undefined ? o.initial : 8, Lt = o.light !== undefined ? o.light : 9.5, Dk = o.dark !== undefined ? o.dark : 7, hrs = o.hours || 24;
    var F = frame(el, o, 'bottles', 'Light and dark bottles for measuring primary productivity');
    var svg = svgRoot(600, 230, el.getAttribute('aria-label')); F.body.appendChild(svg); var work = h('div'); F.body.appendChild(work);
    function bottle(x, cls, title, val, sun) {
      sv('path', { d: 'M' + (x - 20) + ',40 L' + (x + 20) + ',40 L' + (x + 20) + ',66 Q' + (x + 56) + ',80 ' + (x + 56) + ',112 L' + (x + 56) + ',182 Q' + (x + 56) + ',196 ' + (x + 42) + ',196 L' + (x - 42) + ',196 Q' + (x - 56) + ',196 ' + (x - 56) + ',182 L' + (x - 56) + ',112 Q' + (x - 56) + ',80 ' + (x - 20) + ',66 Z', class: cls }, svg);
      txt(svg, x, 24, title, { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); txt(svg, x, 150, fmt(val, 2), { class: 'a-in', 'text-anchor': 'middle', style: cls === 'a-dnaf' ? 'fill:var(--bv-panel)' : null }); txt(svg, x, 222, 'mg O₂/L', { class: 'bv-sub', 'text-anchor': 'middle' });
      if (sun) { sv('circle', { cx: x + 66, cy: 46, r: 12, fill: '#f6c343' }, svg); }
    }
    bottle(100, 'a-gene', 'start', I); bottle(300, 'a-cpx', 'light, after ' + hrs + ' h', Lt, true); bottle(500, 'a-dnaf', 'dark, after ' + hrs + ' h', Dk);
    var rows = [['npp', 'Net productivity (light − start)', Lt - I], ['r', 'Respiration (start − dark)', I - Dk], ['gpp', 'Gross productivity (light − dark) = NPP + R', Lt - Dk]];
    var t = '<table class="a-tbl"><tr><th>Quantity</th><th>mg O₂/L in ' + hrs + ' h</th></tr>';
    rows.forEach(function (r) { var show = !F.quiet || (o.known || []).indexOf(r[0]) >= 0; t += '<tr><td>' + r[1] + '</td><td>' + (o.ask === r[0] ? '<b class="bv-bad">?</b>' : show ? fmt(r[2], 2) : '') + '</td></tr>'; });
    if (!F.quiet || o.ask) work.innerHTML = '<div class="a-wrap">' + t + '</table></div>';
    F.say('The light bottle shows photosynthesis minus respiration (net). The dark bottle shows respiration alone. Gross = net + respiration.');
  });

  /* =========================== apbio-se =========================== */
  V.register('apbio-se', function (el, o) {
    var mu = o.mean || 50, sd0 = o.sd || 10, n = o.n || 5, seed = o.seed || 11;
    var F = frame(el, o, 'se', 'A sample with its standard deviation and standard error');
    var svg = svgRoot(600, 220, el.getAttribute('aria-label')); F.body.appendChild(svg);
    var pool = (function () { var r = rng(seed), a = []; for (var i = 0; i < 100; i++) { var u = M.max(1e-9, r()), v = r(); a.push(mu + sd0 * M.sqrt(-2 * M.log(u)) * M.cos(2 * M.PI * v)); } return a; })();
    var lo = mu - 4 * sd0, hi = mu + 4 * sd0; function X(v) { return 30 + (M.max(lo, M.min(hi, v)) - lo) / (hi - lo) * 540; }
    function draw() {
      svg.innerHTML = ''; var smp = pool.slice(0, n), m = smp.reduce(function (s, x) { return s + x; }, 0) / n, s = M.sqrt(smp.reduce(function (q, x) { return q + (x - m) * (x - m); }, 0) / (n - 1)), se = s / M.sqrt(n);
      sv('line', { x1: 30, y1: 190, x2: 570, y2: 190, class: 'a-axis' }, svg);
      for (var t = M.ceil(lo / 10) * 10; t <= hi; t += 10) { sv('line', { x1: X(t), y1: 190, x2: X(t), y2: 196, class: 'a-axis' }, svg); txt(svg, X(t), 212, String(t), { class: 'a-tick', 'text-anchor': 'middle' }); }
      var rj = rng(5); smp.forEach(function (x) { sv('circle', { cx: X(x), cy: 46 + rj() * 34, r: 5, class: 'a-dot', opacity: 0.8 }, svg); });
      function bar(y, a, b, cls, label) { sv('line', { x1: X(a), y1: y, x2: X(b), y2: y, class: cls, 'stroke-width': 4 }, svg); sv('line', { x1: X(a), y1: y - 8, x2: X(a), y2: y + 8, class: cls, 'stroke-width': 3 }, svg); sv('line', { x1: X(b), y1: y - 8, x2: X(b), y2: y + 8, class: cls, 'stroke-width': 3 }, svg); txt(svg, X(b) + 8, y + 5, label, { class: 'bv-sub' }); }
      sv('line', { x1: X(m), y1: 100, x2: X(m), y2: 186, class: 'a-guide' }, svg);
      bar(124, m - s, m + s, 'a-hpath', 'mean ± 1 SD (spread of the data)'); bar(160, m - 2 * se, m + 2 * se, 'a-fit', 'mean ± 2 SE (about 95% CI)');
      F.say('n = ' + n + ': mean ' + fmt(m, 1) + ', SD ' + fmt(s, 1) + ', SE = SD/√n = ' + fmt(s, 1) + '/√' + n + ' = ' + fmt(se, 2) + '. Raise n: the SD stays about ' + sd0 + ' (the data are no less spread), but the SE shrinks, so we know the mean more precisely.');
    }
    draw();
    if (F.inter && !F.quiet) V.slider(F.ctl, { label: 'sample size n', min: 3, max: 100, step: 1, value: n, fmt: function (v) { return String(v); }, input: function (v) { n = v; draw(); } });
  });

  /* =========================== apbio-hw =========================== */
  V.register('apbio-hw', function (el, o) {
    var q = o.q !== undefined ? o.q : 0.3;
    var F = frame(el, o, 'hw', 'Hardy-Weinberg genotype frequencies as areas of a square');
    var svg = svgRoot(600, 300, el.getAttribute('aria-label')); F.body.appendChild(svg);
    function draw() {
      svg.innerHTML = ''; var p = 1 - q, S = 240, x0 = 40, y0 = 40, a = p * S;
      function box(x, y, w, hh, cls, lab, key) { if (w < 0.5 || hh < 0.5) return; sv('rect', { x: x, y: y, width: w, height: hh, class: cls }, svg); var asked = o.ask === key; if ((w > 34 && hh > 24) || asked) txt(svg, x + w / 2, y + hh / 2 + 5, asked ? '?' : lab, { class: asked ? 'bv-askt' : 'a-in-sm', 'text-anchor': 'middle' }); }
      box(x0, y0, a, a, 'a-gene', 'AA', 'p2'); box(x0 + a, y0, S - a, a, 'a-cpx', 'Aa', 'pq'); box(x0, y0 + a, a, S - a, 'a-cpx', 'Aa', 'pq'); box(x0 + a, y0 + a, S - a, S - a, 'a-e3', 'aa', 'q2');
      if (!F.quiet) { txt(svg, x0 + a / 2, y0 - 10, 'p = ' + fmt(p, 2), { class: 'bv-sub', 'text-anchor': 'middle' }); txt(svg, x0 + a + (S - a) / 2, y0 - 10, 'q = ' + fmt(q, 2), { class: 'bv-sub', 'text-anchor': 'middle' }); }
      if (!F.quiet) [['p² (AA)', p * p], ['2pq (Aa)', 2 * p * q], ['q² (aa)', q * q]].forEach(function (r, i) { txt(svg, 330, 90 + i * 50, r[0], { class: 'bv-sub' }); txt(svg, 330, 112 + i * 50, fmt(r[1], 4), { class: 'bv-lab' }); });
      if (!F.quiet) txt(svg, 330, 250, 'p² + 2pq + q² = 1', { class: 'bv-lab bv-lab-sm' });
      F.say('Each side is split into p (allele A) and q (allele a). The heterozygotes are the two Aa rectangles together: 2 × p × q = ' + fmt(2 * p * q, 4) + '. The dominant phenotype is p² + 2pq = ' + fmt(1 - q * q, 4) + '.');
    }
    draw();
    if (F.inter && !F.quiet) V.slider(F.ctl, { label: 'q (frequency of a)', min: 0, max: 1, step: 0.01, value: q, fmt: function (v) { return fmt(v, 2); }, input: function (v) { q = v; draw(); } });
  });

  /* =========================== apbio-drift =========================== */
  V.register('apbio-drift', function (el, o) {
    var N = o.N || 20, pops = o.pops || 8, gens = o.gens || 60, p0 = o.p0 !== undefined ? o.p0 : 0.5, seed = o.seed || 1;
    var F = frame(el, o, 'drift', 'Genetic drift: allele frequencies wandering by chance in populations of the same size');
    var c = V.canvas(F.body, { aspect: 1.7, max: 340 }); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', el.getAttribute('aria-label'));
    var P = V.plane(c, { xmin: -gens * 0.06, xmax: gens * 1.03, ymin: -0.1, ymax: 1.08 });
    function sim() { var r = rng(seed * 7919 + N), out = []; for (var k = 0; k < pops; k++) { var p = p0, line = [[0, p]]; for (var g = 1; g <= gens; g++) { var cnt = 0, m = 2 * N; for (var j = 0; j < m; j++) if (r() < p) cnt++; p = cnt / m; line.push([g, p]); } out.push(line); } return out; }
    var data = sim();
    function draw() {
      var k = V.colors(); P.clear(); P.grid(); P.axes({ x: 'generation', y: 'p' });
      var cols = ['green', 'blue', 'red', 'gold', 'purple', 'orange', 'pink', 'teal'];
      data.forEach(function (line, i) { c.ctx.save(); c.ctx.strokeStyle = k[cols[i % 8]]; c.ctx.lineWidth = 2; c.ctx.beginPath(); line.forEach(function (q, j) { c.ctx[j ? 'lineTo' : 'moveTo'](P.X(q[0]), P.Y(q[1])); }); c.ctx.stroke(); c.ctx.restore(); });
      var fixed = data.filter(function (l) { return l[l.length - 1][1] === 1; }).length, lost = data.filter(function (l) { return l[l.length - 1][1] === 0; }).length;
      F.say('N = ' + N + ' individuals per population: after ' + gens + ' generations, the allele was fixed (p = 1) in ' + fixed + ' and lost (p = 0) in ' + lost + ' of ' + pops + ' populations. No selection acts here: every change is chance. Try a larger N.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    if (F.inter && !F.quiet) { V.seg(F.ctl, { label: 'Population size', items: [['10', 'N = 10'], ['50', 'N = 50'], ['500', 'N = 500']], value: String(N), change: function (v) { N = +v; data = sim(); draw(); } }); V.button(F.ctl, 'Run again', function () { seed++; data = sim(); draw(); }); }
  });

  /* =========================== apbio-timeline =========================== */
  function ago(t) { if (t >= 1000) return fmt(t / 1000, 2) + ' billion years ago'; if (t >= 1) return commas(fmt(t, 0)) + ' million years ago'; return 'today'; }
  V.register('apbio-timeline', function (el, o) {
    var ev = (o.events || []).slice().sort(function (a, b) { return b.t - a.t; });
    var F = frame(el, o, 'timeline', 'A timeline of events in the history of life');
    var ol = h('ol', 'a-tl'), from = o.from || (ev.length ? ev[0].t : 4600), px = o.px || 0.09, minGap = 8;
    ev.forEach(function (e, i) {
      var li = h('li'), gap = i ? M.max(minGap, (ev[i - 1].t - e.t) * px) : 0; li.style.marginTop = (gap / 16).toFixed(2) + 'rem';
      var asked = o.ask !== undefined && o.ask === e.key;
      li.innerHTML = '<span class="a-when">' + esc(e.when || ago(e.t)) + '</span><span class="a-what">' + (asked ? '<span class="a-ask">?</span>' : e.text) + '</span>';
      ol.appendChild(li);
    });
    F.body.appendChild(ol);
    if (o.note) F.say(o.note);
  });
})(window, typeof document !== 'undefined' ? document : null);
