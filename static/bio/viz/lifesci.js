/* Course visuals for lifesci, merged from part files by /tmp/merge_parts.js. */
/* ---- part A ---- */
/* Life Science (lifesci), part A: two course visuals on top of the Biology kit (static/bio/viz/bio.js + bio.css).
   They reuse the kit's look (.bv classes and colors) and follow the site's light and dark theme.

   lifesci-cubes   cubes drawn with their unit cubes, and a table of surface area, volume and surface area : volume.
                   sides: [1, 2, 4] (the cubes shown, in µm; up to 3); unit ('µm'); slider: true (default when interactive)
                   adds a "Cube side" slider for the last cube (1–8); table: false hides the table; quiet: no table, no
                   readout (only "side = s µm" under each cube); ask: index (that cube's side becomes "?").
   lifesci-scale   sizes drawn to scale. view 'cell' (an animal cell about 20 µm across with bacteria about 2 µm long) |
                   'virus' (one bacterium about 2 µm long with viruses about 0.1 µm = 100 nm across) | 'both' (default:
                   a switch between the two views); quiet hides the size labels.                                         */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, V = ML && ML.viz; if (!D || !V || !V.register) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math;
  if (!D.getElementById('lifesci-a-css')) {
    var st = D.createElement('style'); st.id = 'lifesci-a-css';
    st.textContent = '.bv-lsc .lsc-top{fill:#cfe8d8}.bv-lsc .lsc-left{fill:#a9d3b8}.bv-lsc .lsc-right{fill:#86bf9c}.bv-lsc .lsc-edge{stroke:#2e6b46;stroke-width:1.6;fill:none}' +
      '.bv-lsc .lsc-grid{stroke:#2e6b46;stroke-width:.8;opacity:.55}' +
      'html[data-theme="dark"] .bv-lsc .lsc-top{fill:#3f7a58}html[data-theme="dark"] .bv-lsc .lsc-left{fill:#2f6347}html[data-theme="dark"] .bv-lsc .lsc-right{fill:#244f39}html[data-theme="dark"] .bv-lsc .lsc-edge,html[data-theme="dark"] .bv-lsc .lsc-grid{stroke:#9fe0bd}' +
      '.bv-lsc table.lsc-tab{border-collapse:collapse;margin:.6rem auto 0;font-size:.9rem;min-width:min(100%,420px)}.bv-lsc .lsc-tab th,.bv-lsc .lsc-tab td{border:1px solid var(--bv-grid);padding:.3rem .55rem;text-align:center}' +
      '.bv-lsc .lsc-tab th{background:var(--bv-accs)}.bv-lsc .lsc-tab td.lsc-r{font-weight:700;color:var(--bv-acc)}.bv-lsc .lsc-wrap{overflow-x:auto}' +
      '.bv-lsz .lsz-cell{fill:#fbe3e3;stroke:#c96a7a;stroke-width:3}.bv-lsz .lsz-nuc{fill:#c8b8e8}.bv-lsz .lsz-bac{fill:#e9cf94;stroke:#a8803a;stroke-width:2}.bv-lsz .lsz-dna{fill:none;stroke:#7a5ab8;stroke-width:3}' +
      '.bv-lsz .lsz-vir{fill:#e8925a;stroke:#9a4a1e;stroke-width:1.5}.bv-lsz .lsz-core{fill:#7a5ab8}.bv-lsz .lsz-bar{stroke:var(--bv-lab);stroke-width:3}.bv-lsz .lsz-bg{fill:var(--bv-tile2)}' +
      'html[data-theme="dark"] .bv-lsz .lsz-cell{fill:#4a2f36;stroke:#e08a9a}html[data-theme="dark"] .bv-lsz .lsz-nuc{fill:#5a4a80}html[data-theme="dark"] .bv-lsz .lsz-bac{fill:#6e5a30;stroke:#e0c070}html[data-theme="dark"] .bv-lsz .lsz-dna{stroke:#c7a2ff}html[data-theme="dark"] .bv-lsz .lsz-vir{fill:#a85a2a;stroke:#ffb080}html[data-theme="dark"] .bv-lsz .lsz-core{fill:#c7a2ff}';
    D.head.appendChild(st);
  }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); for (var k in at) if (at[k] !== undefined) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function root(w, hh, label) { var s = sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'bv-svg', role: 'img', 'aria-label': label }); return s; }
  function fmt(v) { return V.fmt ? V.fmt(v, 3) : String(+v.toFixed(3)); }
  function frame(el, o, cls, label) {
    el.classList.add('bv', cls); var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    el.setAttribute('aria-label', o.label || label);
    if (o.task) el.appendChild(h('p', 'bv-task', o.task));
    F.body = h('div', 'bv-body'); el.appendChild(F.body); F.ctl = h('div', 'ml-ctl bv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout bv-out'); F.out.setAttribute('aria-live', 'polite'); F.out.hidden = true; el.appendChild(F.out);
    F.say = function (s) { F.out.innerHTML = s || ''; F.out.hidden = !s; };
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }

  /* ---------------- lifesci-cubes ---------------- */
  V.register('lifesci-cubes', function (el, o) {
    var sides = (o.sides || [1, 2, 4]).slice(0, 3), unit = o.unit || 'µm', F = frame(el, o, 'bv-lsc', 'Cubes of different sizes with their surface area and volume');
    var useSlider = F.interactive && !F.quiet && o.slider !== false, showTab = !F.quiet && o.table !== false;
    var svg = root(600, 280, el.getAttribute('aria-label')); svg.setAttribute('viewBox', '0 30 600 250'); F.body.appendChild(svg);
    var wrap = h('div', 'lsc-wrap'); F.body.appendChild(wrap);
    function cube(g, x0, y0, s, px) { // isometric cube with its unit-cube grid; x0, y0 = bottom front corner
      var c = M.cos(M.PI / 6), a = px * s;
      function P(x, y, z) { return [x0 + (x - y) * c * px, y0 - z * px - (x + y) * 0.5 * px]; }
      function poly(pts, cls) { sv('polygon', { points: pts.map(function (p) { return p.join(','); }).join(' '), class: cls }, g); }
      poly([P(0, 0, s), P(s, 0, s), P(s, s, s), P(0, s, s)], 'lsc-top');
      poly([P(0, 0, 0), P(0, s, 0), P(0, s, s), P(0, 0, s)], 'lsc-left');
      poly([P(0, 0, 0), P(s, 0, 0), P(s, 0, s), P(0, 0, s)], 'lsc-right');
      function line(p, q, cls) { sv('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: cls }, g); }
      if (s > 1 && s <= 8) for (var i = 1; i < s; i++) {
        line(P(i, 0, 0), P(i, 0, s), 'lsc-grid'); line(P(0, 0, i), P(s, 0, i), 'lsc-grid');
        line(P(0, i, 0), P(0, i, s), 'lsc-grid'); line(P(0, 0, i), P(0, s, i), 'lsc-grid');
        line(P(i, 0, s), P(i, s, s), 'lsc-grid'); line(P(0, i, s), P(s, i, s), 'lsc-grid');
      }
      [[P(0, 0, 0), P(s, 0, 0)], [P(0, 0, 0), P(0, s, 0)], [P(0, 0, 0), P(0, 0, s)], [P(s, 0, 0), P(s, 0, s)], [P(0, s, 0), P(0, s, s)], [P(0, 0, s), P(s, 0, s)], [P(0, 0, s), P(0, s, s)], [P(s, 0, s), P(s, s, s)], [P(0, s, s), P(s, s, s)]].forEach(function (e) { line(e[0], e[1], 'lsc-edge'); });
      return a;
    }
    function draw() {
      svg.innerHTML = ''; var n = sides.length, colW = 600 / n, maxS = M.max.apply(null, sides);
      var px = M.min(150 / (maxS * 1.6), (colW - 30) / (maxS * 2 * M.cos(M.PI / 6)));
      sides.forEach(function (s, i) {
        var g = sv('g', {}, svg), cx = colW * (i + 0.5);
        cube(g, cx, 232, s, px);
        var lab = o.ask === i ? 'side = ? ' + unit : 'side = ' + s + ' ' + unit;
        txt(svg, cx, 264, lab, { class: 'bv-lab' + (o.ask === i ? ' bv-asklab' : ''), 'text-anchor': 'middle', style: 'font-size:' + (n > 2 ? 20 : 22) + 'px' });
      });
      wrap.innerHTML = '';
      if (showTab) {
        var rows = sides.map(function (s) { return '<tr><td>' + s + ' ' + unit + '</td><td>6 × ' + s + ' × ' + s + ' = ' + 6 * s * s + ' ' + unit + '²</td><td>' + s + ' × ' + s + ' × ' + s + ' = ' + s * s * s + ' ' + unit + '³</td><td class="lsc-r">' + fmt(6 / s) + ' : 1</td></tr>'; }).join('');
        wrap.innerHTML = '<table class="lsc-tab"><thead><tr><th>Side</th><th>Surface area</th><th>Volume</th><th>Surface : volume</th></tr></thead><tbody>' + rows + '</tbody></table>';
      }
      if (!F.quiet && n > 1) { var a = sides[0], b = sides[n - 1], k = b / a; F.say('From side ' + a + ' to side ' + b + ' (' + fmt(k) + ' times as wide): surface area grows <b>' + fmt(k * k) + '×</b>, volume grows <b>' + fmt(k * k * k) + '×</b>, so each unit of volume has <b>' + fmt(1 / k) + '</b> as much surface.'); }
    }
    draw();
    if (useSlider && V.slider) V.slider(F.ctl, { label: 'Cube side (' + unit + ')', min: 1, max: 8, step: 1, value: sides[sides.length - 1], fmt: function (v) { return v + ' ' + unit; }, input: function (v) { sides[sides.length - 1] = +v; draw(); } });
    V.onTheme && V.onTheme(function () { });
  });

  /* ---------------- lifesci-scale ---------------- */
  V.register('lifesci-scale', function (el, o) {
    var view = o.view || 'both', F = frame(el, o, 'bv-lsz', 'Sizes drawn to scale: a cell, bacteria and viruses');
    var cur = view === 'both' ? 'cell' : view, svg = root(600, 320, el.getAttribute('aria-label')); F.body.appendChild(svg);
    function virus(g, x, y, r) {
      for (var k = 0; k < 10; k++) { var a = k * M.PI / 5; sv('line', { x1: x + M.cos(a) * r, y1: y + M.sin(a) * r, x2: x + M.cos(a) * (r + 5), y2: y + M.sin(a) * (r + 5), class: 'lsz-vir' }, g); sv('circle', { cx: x + M.cos(a) * (r + 6), cy: y + M.sin(a) * (r + 6), r: 2, class: 'lsz-vir' }, g); }
      sv('circle', { cx: x, cy: y, r: r, class: 'lsz-vir' }, g); sv('circle', { cx: x, cy: y, r: r * 0.45, class: 'lsz-core' }, g);
    }
    function bac(g, x, y, L, Wd, dna) { sv('rect', { x: x - L / 2, y: y - Wd / 2, width: L, height: Wd, rx: Wd / 2, class: 'lsz-bac' }, g); if (dna) sv('path', { d: 'M' + (x - L * 0.25) + ',' + y + ' q' + L * 0.06 + ',-' + Wd * 0.3 + ' ' + L * 0.12 + ',0 t' + L * 0.12 + ',0 t' + L * 0.12 + ',0 t' + L * 0.12 + ',0', class: 'lsz-dna' }, g); }
    function bar(x, y, len, s) { sv('line', { x1: x, y1: y, x2: x + len, y2: y, class: 'lsz-bar' }, svg); sv('line', { x1: x, y1: y - 6, x2: x, y2: y + 6, class: 'lsz-bar' }, svg); sv('line', { x1: x + len, y1: y - 6, x2: x + len, y2: y + 6, class: 'lsz-bar' }, svg); txt(svg, x + len / 2, y - 10, s, { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); }
    function draw() {
      svg.innerHTML = ''; sv('rect', { x: 0, y: 0, width: 600, height: 320, rx: 12, class: 'lsz-bg' }, svg); var g = sv('g', {}, svg);
      if (cur === 'cell') { // 15 px per µm: cell 20 µm = 300 px across; bacteria 2 µm × 0.8 µm = 30 × 12 px
        sv('ellipse', { cx: 210, cy: 176, rx: 150, ry: 136, class: 'lsz-cell' }, g); sv('circle', { cx: 200, cy: 172, r: 42, class: 'lsz-nuc' }, g);
        [[430, 90], [470, 120], [450, 170], [500, 200], [420, 230], [520, 140]].forEach(function (p, i) { bac(g, p[0], p[1], 30, 12, false); });
        if (!F.quiet) { txt(svg, 210, 24, 'Animal cell: about 20 µm across', { class: 'bv-lab', 'text-anchor': 'middle' }); txt(svg, 470, 60, 'Bacteria: about 2 µm long', { class: 'bv-lab bv-lab-sm', 'text-anchor': 'middle' }); bar(400, 290, 75, '5 µm'); }
        F.say(F.quiet ? '' : 'Drawn to the same scale. A virus would be about 1.5 px here: too small to see.');
      } else { // 200 px per µm: bacterium 2 µm × 0.8 µm = 400 × 160 px; viruses 0.1 µm = 20 px
        bac(g, 270, 165, 400, 160, true);
        [[500, 75], [530, 130], [515, 205], [545, 260], [80, 275], [490, 290], [60, 70]].forEach(function (p) { virus(g, p[0], p[1], 10); });
        if (!F.quiet) { txt(svg, 300, 30, 'Bacterium: about 2 µm long. Viruses: about 0.1 µm.', { class: 'bv-lab', 'text-anchor': 'middle' }); bar(150, 300, 100, '0.5 µm'); }
        F.say(F.quiet ? '' : 'Zoomed in 13 times more than the cell view. About 20 of these viruses would fit along the bacterium.');
      }
    }
    draw();
    if (view === 'both' && F.interactive && !F.quiet && V.seg) V.seg(F.ctl, { label: 'View', items: [['cell', 'A cell and bacteria'], ['virus', 'A bacterium and viruses']], value: cur, change: function (v) { cur = v; draw(); } });
  });
})(window, typeof document !== 'undefined' ? document : null);

/* ---- part B ---- */
/* Life Science (lifesci) course visuals, part B. Names prefixed lifesci-. They use the Biology kit's look (class "bv", its CSS
   variables) and register with MathLadder.viz. Original SVG; light and dark themes; mouse, touch and keyboard; quiet mode.

   lifesci-quadrat  a field split into square quadrats with plants scattered in clumps (seeded). Tap squares (or Enter/Space on a
                    focused square) to sample them; the readout shows the counts, the average and the estimate for the field.
                    cols (10), rows (6), n (plants, 180), seed, side (quadrat side in m, default 1), sample: [indexes] (sampled at
                    start), reveal: false hides the "Count every plant" button. quiet: only the given sampled squares show counts.
   lifesci-strata   rock layers with the fossils found in each, listed from the BOTTOM (oldest) up: layers: [{ fossils: ['trilobite'],
                    name: 'A' }]; ask: index (that layer's fossils become "?"); ages: false hides the oldest/youngest arrow.
                    Tap a layer to read how its age compares. quiet: no arrow, no readout.
   lifesci-limbs    homologous forelimbs drawn as bones in four colors (upper arm: humerus; forearm: radius and ulna; wrist; finger
                    bones). limbs: ['human', 'cat', 'whale', 'bat', 'bird'] (any of these, plus 'insect': an insect wing, which has
                    no bones). Tap a bone group or a legend chip to highlight that bone in every limb. names: false hides the
                    animal names (quiet letters the limbs A, B, C …).                                                            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder; if (!ML || !ML.viz || !ML.viz.register) return;
  var V = ML.viz, M = Math, NS = 'http://www.w3.org/2000/svg';
  if (!D.getElementById('lifesci-viz-css')) {
    var st = D.createElement('style'); st.id = 'lifesci-viz-css';
    st.textContent = '.lsv svg{display:block;width:100%;height:auto;max-width:640px;margin:0 auto}' +
      '.lsv .lsv-q{fill:transparent;stroke:var(--bv-grid,#e2e8e3);stroke-width:1.5;cursor:pointer}.lsv .lsv-q:focus{outline:none;stroke:var(--bv-acc,#0f7d5c);stroke-width:3}' +
      '.lsv .lsv-q.on{fill:var(--bv-accs,rgba(15,125,92,.11));stroke:var(--bv-acc,#0f7d5c);stroke-width:2.5}' +
      '.lsv .lsv-field{fill:#cfe6b4}html[data-theme="dark"] .lsv .lsv-field{fill:#2c4a2c}.lsv .lsv-plant{fill:#e0b400;stroke:#7a6100;stroke-width:.8}html[data-theme="dark"] .lsv .lsv-plant{fill:#ffd94a}' +
      '.lsv .lsv-stem{stroke:#3f7d2a;stroke-width:1.4}html[data-theme="dark"] .lsv .lsv-stem{stroke:#8fd06a}' +
      '.lsv .lsv-cnt{fill:var(--bv-lab,#1d2320);font:800 15px system-ui,sans-serif;paint-order:stroke;stroke:var(--bv-panel,#fff);stroke-width:3.5px;stroke-linejoin:round;pointer-events:none}' +
      '.lsv .lsv-t{fill:var(--bv-lab,#1d2320);font:600 14px system-ui,sans-serif}.lsv .lsv-ts{fill:var(--bv-sub,#55605a);font:600 12px system-ui,sans-serif}' +
      '.lsv .lsv-chip,.lsv .lsv-ct,.lsv .lsv-lt,.lsv .lsv-ask{pointer-events:none}.lsv .lsv-chip{fill:#fffaf0;stroke:#6b5a48;stroke-width:1}.lsv .lsv-ct{fill:#2b2420;font:600 12.5px system-ui,sans-serif}.lsv .lsv-lt{fill:#2b2420;font:800 16px system-ui,sans-serif}.lsv .lsv-ln{fill:var(--bv-lab,#1d2320);font:700 19px system-ui,sans-serif}.lsv .lsv-ln2{fill:var(--bv-sub,#55605a);font:600 16px system-ui,sans-serif}'+
      '.lsv .lsv-ask{fill:var(--bv-ask,#c2410c);font:800 22px system-ui,sans-serif}' +
      '.lsv .lsv-layer{stroke:rgba(0,0,0,.25);stroke-width:1;cursor:pointer}.lsv .lsv-layer.sel{stroke:var(--bv-gold,#b8860b);stroke-width:4}' +
      '.lsv .lsv-arrow{stroke:var(--bv-ink2,#33403a);stroke-width:2.5;fill:none}.lsv .lsv-ah{fill:var(--bv-ink2,#33403a)}' +
      '.lsv .lsv-limbrow{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 6px}.lsv .lsv-limbrow svg{width:150px;max-width:31%;min-width:104px;margin:0}' +
      '.lsv .lsv-bone{stroke-linecap:round;cursor:pointer;transition:opacity .2s}.lsv .lsv-dim{opacity:.18}.lsv .lsv-mem{fill:rgba(120,120,140,.18);stroke:rgba(120,120,140,.5)}' +
      '.lsv .lsv-legend{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin:.4rem 0 0;padding:0;list-style:none}' +
      '.lsv .lsv-legend button{display:inline-flex;align-items:center;gap:.35rem;min-height:36px;padding:.2rem .6rem;border-radius:18px;border:1px solid var(--bv-line,#7a857f);background:var(--bv-panel,#fff);color:var(--bv-lab,#1d2320);font:600 .85rem system-ui,sans-serif;cursor:pointer}' +
      '.lsv .lsv-legend button[aria-pressed="true"]{border-color:var(--bv-acc,#0f7d5c);box-shadow:0 0 0 2px var(--bv-accs,rgba(15,125,92,.2))}.lsv .lsv-sw{width:14px;height:14px;border-radius:4px;display:inline-block}';
    D.head.appendChild(st);
  }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); for (var k in at || {}) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function rng(seed) { var s = 0; String(seed).split('').forEach(function (c) { s = (s * 31 + c.charCodeAt(0)) >>> 0; }); s = s || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function frame(host, o, label) {
    host.classList.add('bv', 'lsv');
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (!host.getAttribute('aria-label') || F.quiet) host.setAttribute('aria-label', o.label || label);
    if (o.task) host.appendChild(el('p', 'bv-task', o.task));
    F.body = el('div', 'bv-body'); host.appendChild(F.body);
    F.ctl = el('div', 'ml-ctl bv-ctl'); host.appendChild(F.ctl);
    F.out = el('p', 'ml-readout bv-out'); F.out.setAttribute('aria-live', 'polite'); host.appendChild(F.out);
    F.say = function (h) { F.out.innerHTML = h || ''; F.out.hidden = !h; }; F.say('');
    if (o.caption) host.appendChild(el('p', 'ml-cap', o.caption));
    return F;
  }
  function button(parent, label, fn, cls) { if (V.button) return V.button(parent, label, fn, cls); var b = el('button', 'ml-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmt(v) { return V.fmt ? V.fmt(v, 2) : String(M.round(v * 100) / 100); }

  /* ------------------------------------------------------------------ lifesci-quadrat */
  V.register('lifesci-quadrat', function (host, o) {
    var cols = o.cols || 10, rows = o.rows || 6, n = o.n || 180, side = o.side || 1, F = frame(host, o, 'A field divided into ' + cols * rows + ' square quadrats with plants scattered in clumps');
    var R = rng(o.seed || 'quad'), cs = 56, Wd = cols * cs, Ht = rows * cs, pts = [], centers = [];
    for (var c = 0; c < 5; c++) centers.push([R() * Wd, R() * Ht, 30 + R() * 70]);
    for (var i = 0; i < n; i++) { var p; if (R() < 0.7) { var ce = centers[M.floor(R() * centers.length)], a = R() * 6.283, r = M.sqrt(R()) * ce[2]; p = [ce[0] + M.cos(a) * r, ce[1] + M.sin(a) * r]; } else p = [R() * Wd, R() * Ht]; if (p[0] < 4 || p[0] > Wd - 4 || p[1] < 4 || p[1] > Ht - 4) p = [4 + R() * (Wd - 8), 4 + R() * (Ht - 8)]; pts.push(p); }
    var count = []; for (var q = 0; q < cols * rows; q++) count.push(0);
    pts.forEach(function (p) { count[M.min(rows - 1, M.floor(p[1] / cs)) * cols + M.min(cols - 1, M.floor(p[0] / cs))]++; });
    var svg = sv('svg', { viewBox: '-2 -2 ' + (Wd + 4) + ' ' + (Ht + 4), role: 'img', 'aria-label': host.getAttribute('aria-label') }, F.body);
    sv('rect', { x: 0, y: 0, width: Wd, height: Ht, rx: 6, class: 'lsv-field' }, svg);
    pts.forEach(function (p) { sv('line', { x1: p[0], y1: p[1], x2: p[0], y2: p[1] + 6, class: 'lsv-stem' }, svg); sv('circle', { cx: p[0], cy: p[1], r: 3.4, class: 'lsv-plant' }, svg); });
    var sel = {}, cells = [], labs = [];
    (o.sample || []).forEach(function (k) { if (k >= 0 && k < cols * rows) sel[k] = true; });
    for (var k = 0; k < cols * rows; k++) (function (k) {
      var x = (k % cols) * cs, y = M.floor(k / cols) * cs, rc = sv('rect', { x: x, y: y, width: cs, height: cs, class: 'lsv-q' }, svg);
      var lb = txt(svg, x + cs / 2, y + cs / 2 + 5, '', { class: 'lsv-cnt', 'text-anchor': 'middle' }); cells.push(rc); labs.push(lb);
      if (F.interactive && !F.quiet) {
        rc.setAttribute('tabindex', '0'); rc.setAttribute('role', 'button'); rc.setAttribute('aria-label', 'Quadrat in row ' + (M.floor(k / cols) + 1) + ', column ' + (k % cols + 1));
        var tog = function () { if (sel[k]) delete sel[k]; else sel[k] = true; draw(); };
        rc.addEventListener('click', tog); rc.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      }
    })(k);
    var revealed = false;
    function draw() {
      var ks = Object.keys(sel).map(Number).sort(function (a, b) { return a - b; });
      cells.forEach(function (rc, k) { rc.classList.toggle('on', !!sel[k]); labs[k].textContent = sel[k] ? String(count[k]) : ''; rc.setAttribute('aria-pressed', sel[k] ? 'true' : 'false'); });
      if (F.quiet) return;
      var area = side * side, total = cols * rows * area;
      if (!ks.length) { F.say('Each square is ' + fmt(side) + ' m × ' + fmt(side) + ' m = ' + fmt(area) + ' m². The field is ' + fmt(total) + ' m². Tap a few squares to sample them.' + (revealed ? ' True count: <b>' + n + '</b>.' : '')); return; }
      var sum = ks.reduce(function (s, k) { return s + count[k]; }, 0), mean = sum / ks.length, est = mean * total / area;
      F.say('Sampled ' + ks.length + ' square' + (ks.length > 1 ? 's' : '') + ': ' + ks.map(function (k) { return count[k]; }).join(', ') + '. Average ' + fmt(mean) + ' per quadrat × ' + (cols * rows) + ' quadrats = estimate <b>' + M.round(est) + '</b> plants.' + (revealed ? ' True count: <b>' + n + '</b>.' : ''));
    }
    if (F.interactive && !F.quiet) {
      button(F.ctl, 'Sample 5 at random', function () { sel = {}; var pool = []; for (var k = 0; k < cols * rows; k++) pool.push(k); for (var j = 0; j < 5; j++) { var t = M.floor(M.random() * pool.length); sel[pool.splice(t, 1)[0]] = true; } draw(); }, 'pri');
      button(F.ctl, 'Clear', function () { sel = {}; draw(); });
      if (o.reveal !== false) button(F.ctl, 'Count every plant', function () { revealed = true; draw(); });
    }
    draw();
  });

  /* ------------------------------------------------------------------ lifesci-strata */
  var LAYER_FILL = ['#b98b5e', '#d3b27a', '#a7a08c', '#c9a27c', '#8f8270', '#dcc49a', '#b4936e'];
  V.register('lifesci-strata', function (host, o) {
    var layers = o.layers || [{ fossils: ['trilobite'] }, { fossils: ['fish'] }, { fossils: ['fern'] }], nL = layers.length;
    var F = frame(host, o, 'Rock layers, oldest at the bottom, with the fossils found in each layer');
    var lh = 56, Wd = 440, top = 30, ax = 70, Ht = top + nL * lh + 16, showAges = o.ages !== false && !F.quiet;
    var svg = sv('svg', { viewBox: '0 0 ' + Wd + ' ' + Ht, role: 'img', 'aria-label': host.getAttribute('aria-label') }, F.body), sel = -1, rects = [];
    function nameOf(i) { return layers[i].name || String.fromCharCode(65 + (nL - 1 - i)); } // default: A at the top
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild); rects = [];
      for (var i = 0; i < nL; i++) {
        var y = top + (nL - 1 - i) * lh, L = layers[i], x0 = showAges ? ax : 10;
        var r = sv('path', { d: 'M' + x0 + ',' + (y + (i % 2 ? 4 : 0)) + ' Q' + (Wd / 2) + ',' + (y - 6 + (i % 3) * 4) + ' ' + (Wd - 10) + ',' + (y + 2) + ' L' + (Wd - 10) + ',' + (y + lh) + ' L' + x0 + ',' + (y + lh) + ' Z', fill: LAYER_FILL[i % LAYER_FILL.length], class: 'lsv-layer' + (sel === i ? ' sel' : '') }, svg);
        rects.push(r);
        txt(svg, x0 + 10, y + lh / 2 + 6, nameOf(i), { class: 'lsv-lt' });
        var fx = x0 + 34;
        if (o.ask === i) txt(svg, fx + 10, y + lh / 2 + 8, '?', { class: 'lsv-ask' });
        else (L.fossils || []).forEach(function (f) { var w = 18 + f.length * 7.6; sv('rect', { x: fx, y: y + lh / 2 - 13, width: w, height: 24, rx: 12, class: 'lsv-chip' }, svg); txt(svg, fx + w / 2, y + lh / 2 + 4, f, { class: 'lsv-ct', 'text-anchor': 'middle' }); fx += w + 8; });
        (function (i) { if (F.interactive && !F.quiet) { r.setAttribute('tabindex', '0'); r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Layer ' + nameOf(i)); var go = function () { sel = i; draw(); var ab = nL - 1 - i; F.say('<b>Layer ' + nameOf(i) + '</b> is ' + (ab ? 'older than the ' + ab + ' layer' + (ab > 1 ? 's' : '') + ' above it' : 'the youngest layer here') + ' and ' + (i ? 'younger than the ' + i + ' below it' : 'the oldest layer here') + '.' + ((layers[i].fossils || []).length ? ' Fossils: ' + layers[i].fossils.join(', ') + '.' : ' No fossils found here.')); }; r.addEventListener('click', go); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); } })(i);
      }
      if (showAges) {
        var y1 = top + nL * lh - 4, y0 = top + 4; sv('line', { x1: 30, y1: y1, x2: 30, y2: y0 + 10, class: 'lsv-arrow' }, svg); sv('path', { d: 'M22,' + (y0 + 12) + ' L30,' + (y0 - 2) + ' L38,' + (y0 + 12) + ' Z', class: 'lsv-ah' }, svg);
        txt(svg, 30, Ht - 2, 'oldest', { class: 'lsv-ts', 'text-anchor': 'middle' }); txt(svg, 30, top - 14, 'youngest', { class: 'lsv-ts', 'text-anchor': 'middle' });
      }
    }
    draw();
    if (F.interactive && !F.quiet) F.say('Layers settle on top of older layers, so the deepest layer is the oldest. Tap a layer.');
  });

  /* ------------------------------------------------------------------ lifesci-limbs */
  var BONES = [['humerus', 'Upper arm (humerus)', '#d9480f'], ['forearm', 'Forearm (radius and ulna)', '#1c7ed6'], ['wrist', 'Wrist bones', '#2b8a3e'], ['digits', 'Finger bones', '#9c36b5']];
  // each limb: h = humerus length, f = forearm length, w = wrist size, d = [[angle (deg from straight down), length]], thick, mem: draw a membrane
  var LIMBS = {
    human: { name: 'human arm', h: 70, f: 62, w: 10, d: [[-28, 22], [-10, 34], [0, 37], [10, 34], [22, 27]], thick: 8 },
    cat: { name: 'cat leg', h: 58, f: 58, w: 9, d: [[-16, 16], [-6, 18], [3, 18], [12, 16], [-34, 9]], thick: 7 },
    whale: { name: 'whale flipper', h: 30, f: 32, w: 12, d: [[-20, 40], [-8, 62], [2, 70], [12, 52], [22, 26]], thick: 11, mem: 'flipper' },
    bat: { name: 'bat wing', h: 48, f: 78, w: 8, d: [[-70, 16], [-50, 92], [-28, 100], [-6, 84], [14, 66]], thick: 5, mem: 'wing' },
    bird: { name: 'bird wing', h: 52, f: 60, w: 8, d: [[-22, 12], [-4, 40], [8, 22]], thick: 6, mem: 'feathers' },
    insect: { name: 'insect wing', insect: true }
  };
  V.register('lifesci-limbs', function (host, o) {
    var keys = (o.limbs || ['human', 'cat', 'whale', 'bat', 'bird']).filter(function (k) { return LIMBS[k]; }), F = frame(host, o, 'Forelimbs of ' + keys.map(function (k) { return LIMBS[k].name; }).join(', ') + ', with the same bones in the same colors');
    var Ht = 300, row = el('div', 'lsv-limbrow'), hi = null, showNames = o.names !== false;
    var groups = { humerus: [], forearm: [], wrist: [], digits: [] };
    function bone(g, part, x1, y1, x2, y2, w) { var col = BONES.filter(function (b) { return b[0] === part; })[0][2]; var l = sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': w, class: 'lsv-bone' }, g); l.dataset.part = part; groups[part].push(l); return l; }
    keys.forEach(function (k, idx) {
      var L = LIMBS[k], label = showNames && !F.quiet ? L.name : String.fromCharCode(65 + idx);
      var one = sv('svg', { viewBox: '0 0 150 ' + Ht, role: 'img', 'aria-label': showNames && !F.quiet ? cap(L.name) + (L.insect ? ', with no bones' : ', bones colored by type') : 'Limb ' + label }, row), g = sv('g', { transform: 'translate(75,30)' }, one);
      txt(g, 0, Ht - 56, label, { class: 'lsv-ln', 'text-anchor': 'middle' });
      if (L.insect) { sv('path', { d: 'M-6,10 C40,30 50,150 10,210 C-10,190 -30,90 -6,10 Z', class: 'lsv-mem' }, g); sv('path', { d: 'M-4,14 C20,60 22,140 10,205 M-2,20 C-14,80 -16,130 -4,190 M2,40 C24,90 30,120 30,150', fill: 'none', stroke: 'rgba(120,120,140,.7)', 'stroke-width': 1.5 }, g); txt(g, 0, Ht - 38, showNames && !F.quiet ? 'no bones' : '', { class: 'lsv-ln2', 'text-anchor': 'middle' }); return; }
      var y0 = 4, yE = y0 + L.h, yW = yE + L.f, t = L.thick;
      if (L.mem) {
        var tips = L.d.map(function (d) { var a = d[0] * M.PI / 180; return [M.sin(a) * d[1], yW + L.w + M.cos(a) * d[1]]; });
        if (L.mem === 'wing') sv('path', { d: 'M0,' + y0 + ' L' + tips.slice(1).map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + ' L30,' + (yE + 10) + ' Z', class: 'lsv-mem' }, g);
        if (L.mem === 'flipper') sv('path', { d: 'M-14,' + y0 + ' Q-40,' + (yW + 40) + ' ' + (tips[2][0]).toFixed(1) + ',' + (tips[2][1] + 10).toFixed(1) + ' Q36,' + (yW + 30) + ' 16,' + y0 + ' Z', class: 'lsv-mem' }, g);
        if (L.mem === 'feathers') sv('path', { d: 'M0,' + (yE - 10) + ' L-58,' + (yW + 70) + ' L-20,' + (yW + 88) + ' L' + tips[1][0].toFixed(1) + ',' + (tips[1][1] + 6).toFixed(1) + ' L18,' + (yW - 6) + ' Z', class: 'lsv-mem' }, g);
      }
      bone(g, 'humerus', 0, y0, 0, yE, t + 2);
      bone(g, 'forearm', -t * 0.55, yE + 3, -t * 0.4, yW, t * 0.7); bone(g, 'forearm', t * 0.55, yE + 3, t * 0.45, yW, t * 0.6);
      [[-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(function (q) { var c = sv('circle', { cx: q[0] * L.w * 0.45, cy: yW + 4 + q[1] * L.w * 0.6, r: L.w * 0.42, fill: '#2b8a3e', class: 'lsv-bone' }, g); c.dataset.part = 'wrist'; groups.wrist.push(c); });
      L.d.forEach(function (d) { var a = d[0] * M.PI / 180, sx = M.sin(a), cy = M.cos(a), bx = sx * L.w * 0.6, by = yW + L.w + cy * 2, segs = 3, len = d[1]; for (var s = 0; s < segs; s++) { var f0 = s / segs, f1 = (s + 0.86) / segs; bone(g, 'digits', bx + sx * len * f0, by + cy * len * f0, bx + sx * len * f1, by + cy * len * f1, M.max(2.5, t * 0.45)); } });
    });
    F.body.appendChild(row);
    var leg = el('ul', 'lsv-legend'), chips = {};
    BONES.forEach(function (b) { var li = el('li'), bt = el('button', '', '<span class="lsv-sw" style="background:' + b[2] + '"></span>' + b[1]); bt.type = 'button'; bt.setAttribute('aria-pressed', 'false'); li.appendChild(bt); leg.appendChild(li); chips[b[0]] = bt; if (F.interactive) bt.addEventListener('click', function () { setHi(hi === b[0] ? null : b[0]); }); else bt.disabled = true; });
    F.body.appendChild(leg);
    function setHi(p) {
      hi = p; Object.keys(groups).forEach(function (k) { groups[k].forEach(function (e) { e.classList.toggle('lsv-dim', !!p && k !== p); }); chips[k].setAttribute('aria-pressed', k === p ? 'true' : 'false'); });
      if (F.quiet) return;
      F.say(p ? 'The <b>' + BONES.filter(function (b) { return b[0] === p; })[0][1].toLowerCase() + '</b> is in every one of these limbs, in the same place, though its size and shape differ.' + (keys.indexOf('insect') >= 0 ? ' The insect wing has none: it is built a different way.' : '') : 'Tap a bone or a color to find it in every limb.');
    }
    if (F.interactive) Object.keys(groups).forEach(function (k) { groups[k].forEach(function (e) { e.addEventListener('click', function () { setHi(hi === k ? null : k); }); }); });
    setHi(null);
  });
})(window, document);
