/* Course visuals for humangeo, merged from part files by /tmp/merge_parts.js. */
/* ---- part A ---- */
/* Human Geography (humangeo), part A: course visuals, built on the Geography kit's helpers (MathLadder.geog.vis).
   All take quiet: true (no names or readouts that could give an answer away) and interactive: false.

   humangeo-pattern  dots in squares: show: ['clustered', 'dispersed', 'random', 'linear'] (default the first two);
                     n: dots per square (24); areas: [numbers] (each square's area, written under it with unit);
                     unit: 'sq mi'; things: 'houses'; titles: false hides the pattern names; seed. Quiet: letters A, B, C only.
   humangeo-decay    distance decay as bars: share of trips (or what: 'migrants' | 'phone calls' | 'shoppers') by distance band;
                     compress: 0-1 (time-space compression flattens the curve); slider: false; max: km (default 400).
   humangeo-density  a made-up country of 100 squares, some farmland: land (km²), arable (0-1), people, farmers;
                     show: 'arithmetic' | 'physiological' | 'agricultural' (what is highlighted); buttons: false; name.
                     Quiet: the picture and the numbers given, no densities.
   humangeo-scale    one made-up country seen at three scales of analysis: scale: 'national' | 'regional' | 'local';
                     buttons: false; what: 'income' (default) | 'internet'. Shows that an average hides differences.
   humangeo-choro    the same made-up regions shaded by total or by rate: by: 'total' | 'rate'; buttons: false.
   humangeo-tree     language families and branches as cards: tree: 'ie' (Indo-European branches, default) | 'families';
                     highlight: branch or family name; ask: name (shown as '?' when quiet); hide: [names]. */
(function (W) {
  'use strict';
  var ML = W.MathLadder; if (!ML || !ML.viz || !ML.geog || !ML.geog.vis) return;
  var V = ML.viz, GV = ML.geog.vis, h = GV.h, s = GV.s, svgRoot = GV.svgRoot, text = GV.text, btn = GV.btn, esc = GV.esc, frame = GV.frame, L = GV.LETTERS, M = Math;
  var D = W.document;
  if (D && !D.getElementById('humangeo-css')) {
    var st = D.createElement('style'); st.id = 'humangeo-css';
    st.textContent = [
      '.ggv .hg-sq{fill:var(--gg-paper,#fffdf6);stroke:var(--gg-border,#7d7468);stroke-width:1.2}',
      '.ggv .hg-dot{fill:var(--gg-acc,#c25700)}.ggv .hg-road{stroke:var(--gg-road,#d8d2c6);stroke-width:7;fill:none}',
      '.ggv text.hg-ax{font:500 13px system-ui,sans-serif;fill:var(--gg-muted,#6b6458)}.ggv text.hg-axt{font-weight:700;fill:var(--gg-ink,#1d2320)}',
      '.ggv text.hg-lab{font:700 12.5px system-ui,sans-serif;fill:var(--gg-ink,#1d2320);paint-order:stroke;stroke:var(--gg-halo,rgba(255,255,255,.92));stroke-width:3.5px;stroke-linejoin:round}.ggv text.hg-lab2{font-weight:500}',
      '.ggv .hg-edge{stroke:var(--gg-ink,#1d2320);stroke-width:2.2;fill:none;stroke-linecap:square}',
      '.ggv .hg-bar{fill:var(--gg-k0,#4e79a7)}.ggv .hg-bar0{fill:var(--gg-acc,#c25700)}',
      '.ggv .hg-land{fill:var(--gg-desert,rgba(232,186,80,.5));stroke:var(--gg-paper,#fff);stroke-width:1}.ggv .hg-farm{fill:var(--gg-grass,#b9dc95);stroke:var(--gg-paper,#fff);stroke-width:1}',
      '.ggv .hg-dim{opacity:.28}.ggv .hg-out{stroke:var(--gg-acc,#c25700);stroke-width:3;fill:none}',
      '.ggv .hg-person{fill:var(--gg-k6,#b07aa1)}.ggv .hg-farmer{fill:var(--gg-k2,#59a14f);stroke:var(--gg-ink,#1d2320);stroke-width:.6}',
      '.ggv .hg-q0{fill:var(--gg-q0)}.ggv .hg-q1{fill:var(--gg-q1)}.ggv .hg-q2{fill:var(--gg-q2)}.ggv .hg-q3{fill:var(--gg-q3)}.ggv .hg-q4{fill:var(--gg-q4)}',
      '.ggv .hg-cell{stroke:var(--gg-paper,#fff);stroke-width:1}.ggv .hg-reg{fill:none;stroke:var(--gg-ink,#1d2320);stroke-width:2.2}',
      '.ggv .hg-legend{display:flex;flex-wrap:wrap;gap:.3rem .8rem;justify-content:center;font-size:.85rem;margin:.3rem 0 0}',
      '.ggv .hg-legend i{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:.25rem;border:1px solid var(--mv-line,#ccc)}',
      '.ggv .hg-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.4rem;margin:.5rem 0 0;font-size:.9rem}',
      '.ggv .hg-nums div{padding:.35rem .5rem;border:1px solid var(--mv-line,#ddd);border-radius:8px;background:var(--mv-card,transparent)}',
      '.ggv .hg-tree{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem}',
      '.ggv .hg-root{text-align:center;font-weight:700;margin:0 0 .5rem;padding:.4rem;border-radius:10px;border:2px solid var(--gg-acc,#c25700)}',
      '.ggv .hg-br{border:1px solid var(--mv-line,#ddd);border-top:4px solid var(--gg-k0,#4e79a7);border-radius:10px;padding:.4rem .55rem;background:var(--mv-card,transparent);min-width:0}',
      '.ggv .hg-br.hi{border-top-color:var(--gg-acc,#c25700);box-shadow:0 0 0 2px var(--gg-accs,rgba(194,87,0,.15))}',
      '.ggv .hg-br b{display:block;font-size:.95rem;margin-bottom:.15rem}.ggv .hg-br span{font-size:.86rem;line-height:1.35;display:block;overflow-wrap:anywhere}'
    ].join('\n');
    D.head.appendChild(st);
  }
  function rng(seed) { var x = (seed || 7) >>> 0; return function () { x = (x + 0x6D2B79F5) >>> 0; var t = x; t = M.imul(t ^ (t >>> 15), t | 1); t ^= t + M.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function fmt(n) { return M.round(n).toLocaleString('en-US'); }

  /* ---------------------------------------------------------------- humangeo-pattern */
  var PNAME = { clustered: 'Clustered', dispersed: 'Dispersed', random: 'Random', linear: 'Linear' };
  function patternDots(kind, n, R) {
    var pts = [], i;
    if (kind === 'clustered') { var cs = [[0.28 + R() * 0.1, 0.3 + R() * 0.1], [0.68 + R() * 0.08, 0.66 + R() * 0.08]]; for (i = 0; i < n; i++) { var c = cs[i % 2], a = R() * 6.283, r = 0.03 + R() * 0.1; pts.push([c[0] + r * M.cos(a), c[1] + r * M.sin(a)]); } }
    else if (kind === 'dispersed') { var k = M.ceil(M.sqrt(n)); for (i = 0; i < n; i++) pts.push([(i % k + 0.5) / k + (R() - 0.5) * 0.04, (M.floor(i / k) + 0.5) / M.ceil(n / k) + (R() - 0.5) * 0.04]); }
    else if (kind === 'linear') { for (i = 0; i < n; i++) { var t = (i + 0.5) / n; pts.push([0.06 + t * 0.88, 0.2 + t * 0.6 + (i % 2 ? 0.045 : -0.045)]); } }
    else { for (i = 0; i < n; i++) pts.push([0.06 + R() * 0.88, 0.06 + R() * 0.88]); }
    return pts.map(function (p) { return [M.max(0.04, M.min(0.96, p[0])), M.max(0.04, M.min(0.96, p[1]))]; });
  }
  V.register('humangeo-pattern', function (el, o) {
    var F = frame(el, o, 'hgpattern'), list = o.show || ['clustered', 'dispersed'], n = o.n || 24, row = h('div', 'ggx-row'); F.body.appendChild(row);
    list.forEach(function (kind, i) {
      var R = rng((o.seed || 5) * 31 + i * 7), fig = h('figure', 'ggx-cell'), svg = svgRoot(220, 220); fig.style.maxWidth = '240px'; fig.style.flexBasis = '150px';
      s('rect', { x: 4, y: 4, width: 212, height: 212, rx: 8, class: 'hg-sq' }, svg);
      if (kind === 'linear') s('path', { d: 'M17 46 L203 178', class: 'hg-road' }, svg);
      patternDots(kind, n, R).forEach(function (p) { s('rect', { x: 4 + p[0] * 212 - 4, y: 4 + p[1] * 212 - 4, width: 8, height: 8, rx: 1.5, class: 'hg-dot' }, svg); });
      fig.appendChild(svg); row.appendChild(fig);
      var cap = (list.length > 1 ? '<b>' + L[i] + '</b> ' : '') + (F.quiet || o.titles === false ? '' : PNAME[kind] || kind);
      if (o.areas) cap += (cap ? '<br>' : '') + n + ' ' + esc(o.things || 'houses') + ' in ' + fmt(o.areas[i]) + ' ' + esc(o.unit || 'sq mi');
      if (cap) fig.appendChild(h('figcaption', 'ggx-cap', cap));
      F.alt(svg, (list.length > 1 ? 'Square ' + L[i] + ': ' : '') + n + ' dots' + (F.quiet ? '' : ', ' + (PNAME[kind] || kind).toLowerCase()) + '.');
    });
    return {};
  });

  /* ---------------------------------------------------------------- humangeo-decay */
  V.register('humangeo-decay', function (el, o) {
    var F = frame(el, o, 'hgdecay'), what = o.what || 'trips', comp = o.compress || 0, max = o.max || 400, bands = 8, box = h('div'); F.body.appendChild(box);
    function shares(c) { var Ld = max * (0.12 + 0.3 * c), v = [], tot = 0; for (var i = 0; i < bands; i++) { var x = (i + 0.5) * max / bands; v.push(M.exp(-x / Ld)); tot += v[i]; } return v.map(function (q) { return q / tot * 100; }); }
    function draw() {
      box.innerHTML = ''; var Wv = 440, Hv = 280, x0 = 46, x1 = Wv - 8, y0 = 34, y1 = Hv - 46, svg = svgRoot(Wv, Hv, 'ggx-svg'); box.appendChild(svg); box.style.maxWidth = '560px'; box.style.margin = '0 auto';
      var v = shares(comp), top = 70, bw = (x1 - x0) / bands;
      for (var g = 0; g <= top; g += 10) { var yy = y1 - g / top * (y1 - y0); s('line', { x1: x0, y1: yy, x2: x1, y2: yy, class: 'ggx-grid' }, svg); text(svg, x0 - 5, yy + 4, g + '%', 'hg-ax', { 'text-anchor': 'end' }); }
      v.forEach(function (q, i) { var hh = M.min(q, top) / top * (y1 - y0); s('rect', { x: x0 + i * bw + 4, y: y1 - hh, width: bw - 8, height: hh, rx: 3, class: i ? 'hg-bar' : 'hg-bar0' }, svg); text(svg, x0 + i * bw + bw / 2, y1 + 17, String(M.round((i + 1) * max / bands)), 'hg-ax', { 'text-anchor': 'middle' }); });
      text(svg, (x0 + x1) / 2, Hv - 8, 'Distance from home, km (each bar ends at the number)', 'hg-ax', { 'text-anchor': 'middle' });
      text(svg, 6, 16, 'Share of ' + what, 'hg-ax hg-axt');
      F.alt(svg, 'A bar chart: the share of ' + what + ' falls as distance grows' + (F.quiet ? '.' : '; ' + M.round(v[0]) + ' percent go less than ' + M.round(max / bands) + ' km.'));
      if (!F.quiet) F.say('<b>' + M.round(v[0]) + '%</b> of ' + esc(what) + ' are under ' + M.round(max / bands) + ' km; <b>' + M.round(v[0] + v[1] + v[2]) + '%</b> are under ' + M.round(3 * max / bands) + ' km.' + (comp > 0.5 ? ' Faster travel flattens the curve, but nearby places still get the most.' : ''));
    }
    draw();
    if (F.interactive && !F.quiet && o.slider !== false) V.slider(F.ctl, { label: 'Faster, cheaper travel and communication', min: 0, max: 1, step: 0.05, value: comp, fmt: function (q) { return q < 0.2 ? 'horse and wagon' : q < 0.5 ? 'railroads' : q < 0.8 ? 'cars and phones' : 'jets and the internet'; }, input: function (q) { comp = q; draw(); } });
    return {};
  });

  /* ---------------------------------------------------------------- humangeo-density */
  V.register('humangeo-density', function (el, o) {
    var F = frame(el, o, 'hgdensity'), land = o.land || 100000, ar = o.arable == null ? 0.2 : o.arable, people = o.people || 5000000, farmers = o.farmers || 1000000, show = o.show || null;
    var box = h('div'); F.body.appendChild(box); var nums = h('div', 'hg-nums'); F.body.appendChild(nums);
    var nFarm = M.max(1, M.round(ar * 100)), R = rng(o.seed || 3), order = []; for (var i = 0; i < 100; i++) order.push(i);
    // farmland: a band along a river through the middle columns, then outward
    var key = {}; order.forEach(function (k) { var r = M.floor(k / 10), c = k % 10, mid = 4.5 + M.sin(r * 0.7) * 1.2; key[k] = M.abs(c - mid) + 0.08 * M.abs(r - 4.5) + R() * 0.05; });
    order.sort(function (a, b) { return key[a] - key[b]; });
    var farm = {}; order.slice(0, nFarm).forEach(function (k) { farm[k] = 1; });
    function draw() {
      box.innerHTML = ''; var svg = svgRoot(300, 300); box.appendChild(svg); box.style.maxWidth = '340px'; box.style.margin = '0 auto';
      for (var k = 0; k < 100; k++) {
        var x = 10 + (k % 10) * 28, y = 10 + M.floor(k / 10) * 28, isF = !!farm[k], dim = show && show !== 'arithmetic' && !isF;
        s('rect', { x: x, y: y, width: 28, height: 28, class: (isF ? 'hg-farm' : 'hg-land') + (dim ? ' hg-dim' : '') }, svg);
        var nd = isF ? 3 : 1; for (var d = 0; d < nd; d++) { var cls = show === 'agricultural' ? (isF && d === 0 ? 'hg-farmer' : 'hg-person hg-dim') : (isF && d === 0 ? 'hg-farmer' : 'hg-person'); s('circle', { cx: x + 7 + (d * 7) % 18 + (k * 3) % 5, cy: y + 8 + (d * 9) % 16 + (k * 5) % 4, r: 2.6, class: cls }, svg); }
      }
      s('rect', { x: 10, y: 10, width: 280, height: 280, class: 'hg-out' }, svg);
      F.alt(svg, 'A made-up country of 100 squares; ' + nFarm + ' squares are farmland (green), the rest is dry land.');
      var arable = land * ar, rows = [['Land area', fmt(land) + ' km²'], ['Farmland (arable)', fmt(arable) + ' km² (' + M.round(ar * 100) + '%)'], ['People', fmt(people)], ['Farmers', fmt(farmers)]];
      if (!F.quiet) rows.push(['Arithmetic density', fmt(people / land) + ' people per km² of all land'], ['Physiological density', fmt(people / arable) + ' people per km² of farmland'], ['Agricultural density', fmt(farmers / arable) + ' farmers per km² of farmland']);
      nums.innerHTML = rows.map(function (r) { var hi = show && ((show === 'arithmetic' && /^Arith/.test(r[0])) || (show === 'physiological' && /^Physio/.test(r[0])) || (show === 'agricultural' && /^Agri/.test(r[0]))); return '<div' + (hi ? ' style="border-color:var(--gg-acc);border-width:2px"' : '') + '><b>' + r[0] + '</b><br>' + r[1] + '</div>'; }).join('');
      if (!F.quiet && show) F.say({ arithmetic: 'Arithmetic density divides <b>all the people</b> by <b>all the land</b>.', physiological: 'Physiological density divides <b>all the people</b> by <b>only the farmland</b> (the green squares).', agricultural: 'Agricultural density divides <b>only the farmers</b> (green dots) by <b>only the farmland</b>.' }[show]);
    }
    draw();
    if (F.interactive && !F.quiet && o.buttons !== false) V.seg(F.ctl, { label: 'Show', items: [['arithmetic', 'Arithmetic'], ['physiological', 'Physiological'], ['agricultural', 'Agricultural']], value: show, change: function (v) { show = v; draw(); } });
    return {};
  });

  /* ---------------------------------------------------------------- humangeo-scale and humangeo-choro */
  // a made-up country on a 6 x 6 grid: four regions of nine districts; values per district
  var SCALE = { income: { t: 'Average yearly income (thousand dollars)', v: [62, 70, 55, 30, 28, 34, 58, 81, 64, 26, 31, 29, 49, 60, 52, 35, 24, 27, 22, 30, 25, 44, 51, 47, 19, 27, 33, 58, 66, 40, 24, 21, 28, 39, 49, 45] },
    internet: { t: 'Share of homes with internet (%)', v: [92, 95, 88, 61, 55, 66, 90, 97, 91, 52, 60, 58, 85, 89, 87, 64, 50, 57, 48, 62, 54, 80, 86, 78, 45, 58, 60, 90, 93, 70, 50, 47, 55, 72, 84, 76] } };
  function regionOf(k) { var r = M.floor(k / 6), c = k % 6; return (r < 3 ? 0 : 2) + (c < 3 ? 0 : 1); }
  function classOf(v, lo, hi) { return 'hg-q' + M.max(0, M.min(4, M.floor((v - lo) / (hi - lo) * 5))); }
  V.register('humangeo-scale', function (el, o) {
    var F = frame(el, o, 'hgscale'), what = SCALE[o.what] || SCALE.income, sc = o.scale || 'national', box = h('div'), leg = h('div', 'hg-legend'); box.style.maxWidth = '360px'; box.style.margin = '0 auto';
    F.body.appendChild(box); F.body.appendChild(leg);
    var v = what.v, lo = M.min.apply(M, v), hi = M.max.apply(M, v) + 0.01;
    function avg(ks) { return ks.reduce(function (a, k) { return a + v[k]; }, 0) / ks.length; }
    function draw() {
      box.innerHTML = ''; var svg = svgRoot(300, 300); box.appendChild(svg);
      var all = []; for (var k = 0; k < 36; k++) all.push(k);
      var reg = [0, 1, 2, 3].map(function (r) { return avg(all.filter(function (k) { return regionOf(k) === r; })); }), nat = avg(all);
      all.forEach(function (k) { var val = sc === 'national' ? nat : sc === 'regional' ? reg[regionOf(k)] : v[k]; s('rect', { x: 10 + (k % 6) * 46.7, y: 10 + M.floor(k / 6) * 46.7, width: 46.7, height: 46.7, class: 'hg-cell ' + classOf(val, lo, hi) }, svg); if (sc === 'local' && !F.quiet) text(svg, 10 + (k % 6) * 46.7 + 23, 10 + M.floor(k / 6) * 46.7 + 28, String(v[k]), 'hg-lab hg-lab2', { 'text-anchor': 'middle' }); });
      if (sc !== 'national') { s('path', { d: 'M150 10 V290 M10 150 H290', class: 'hg-reg' }, svg); if (sc === 'regional') reg.forEach(function (q, r) { text(svg, 80 + (r % 2) * 140, 85 + M.floor(r / 2) * 140, String(M.round(q)), 'hg-lab', { 'text-anchor': 'middle', style: 'font-size:20px' }); }); }
      else text(svg, 150, 157, String(M.round(nat)), 'hg-lab', { 'text-anchor': 'middle', style: 'font-size:24px' });
      s('rect', { x: 10, y: 10, width: 280, height: 280, class: 'hg-reg' }, svg);
      F.alt(svg, 'A made-up country shaded by ' + what.t.toLowerCase() + ' at the ' + sc + ' scale.');
      leg.innerHTML = '<span><b>' + esc(what.t) + '</b></span><span><i style="background:var(--gg-q0)"></i>low</span><span><i style="background:var(--gg-q2)"></i>middle</span><span><i style="background:var(--gg-q4)"></i>high</span>';
      if (!F.quiet) F.say({ national: 'National scale: one number for the whole country (' + M.round(nat) + '). It hides every difference inside.', regional: 'Regional scale: four regions, from ' + M.round(M.min.apply(M, reg)) + ' to ' + M.round(M.max.apply(M, reg)) + '. The northwest stands out.', local: 'Local scale: 36 districts, from ' + lo + ' to ' + M.round(hi) + '. Even rich regions have poorer districts.' }[sc]);
    }
    draw();
    if (F.interactive && !F.quiet && o.buttons !== false) V.seg(F.ctl, { label: 'Scale of analysis', items: [['national', 'National'], ['regional', 'Regional'], ['local', 'Local']], value: sc, change: function (q) { sc = q; draw(); } });
    return {};
  });
  // regions of very different sizes: [cells], people (thousands)
  var CHORO = [{ n: 'North', cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], pop: 2100 }, { n: 'Coast', cells: [14, 15, 20, 21], pop: 1000 },
    { n: 'Hills', cells: [16, 17, 22, 23, 28, 29, 34, 35], pop: 400 }, { n: 'Capital', cells: [26, 27], pop: 1200 }, { n: 'South', cells: [18, 19, 24, 25, 30, 31, 32, 33], pop: 900 }];
  V.register('humangeo-choro', function (el, o) {
    var F = frame(el, o, 'hgchoro'), by = o.by || 'total', box = h('div'), leg = h('div', 'hg-legend'); box.style.maxWidth = '360px'; box.style.margin = '0 auto';
    F.body.appendChild(box); F.body.appendChild(leg);
    var cellKm = 1000;
    function draw() {
      box.innerHTML = ''; var svg = svgRoot(300, 300); box.appendChild(svg);
      var vals = CHORO.map(function (r) { return by === 'total' ? r.pop : r.pop * 1000 / (r.cells.length * cellKm); }), lo = M.min.apply(M, vals), hi = M.max.apply(M, vals) + 0.01;
      CHORO.forEach(function (r, i) { r.cells.forEach(function (k) { s('rect', { x: 10 + (k % 6) * 46.7, y: 10 + M.floor(k / 6) * 46.7, width: 46.7, height: 46.7, class: 'hg-cell ' + classOf(vals[i], lo, hi) }, svg); }); });
      var regOf = {}; CHORO.forEach(function (r, i) { r.cells.forEach(function (k) { regOf[k] = i; }); });
      for (var k = 0; k < 36; k++) { var x = 10 + (k % 6) * 46.7, y = 10 + M.floor(k / 6) * 46.7;
        if (k % 6 < 5 && regOf[k + 1] !== regOf[k]) s('line', { x1: x + 46.7, y1: y, x2: x + 46.7, y2: y + 46.7, class: 'hg-edge' }, svg);
        if (k < 30 && regOf[k + 6] !== regOf[k]) s('line', { x1: x, y1: y + 46.7, x2: x + 46.7, y2: y + 46.7, class: 'hg-edge' }, svg); }
      var LBL = { North: [150, 66], Coast: [150, 152], Hills: [243, 200], Capital: [150, 243], South: [57, 220] };
      CHORO.forEach(function (r, i) { var c = LBL[r.n]; text(svg, c[0], c[1] - 4, r.n, 'hg-lab', { 'text-anchor': 'middle' }); text(svg, c[0], c[1] + 12, by === 'total' ? fmt(r.pop * 1000) : fmt(vals[i]) + '/km²', 'hg-lab hg-lab2', { 'text-anchor': 'middle' }); });
      s('rect', { x: 10, y: 10, width: 280, height: 280, class: 'hg-reg' }, svg);
      F.alt(svg, 'Five made-up regions shaded by ' + (by === 'total' ? 'total people' : 'people per square kilometer') + '.');
      leg.innerHTML = '<span><b>' + (by === 'total' ? 'Total people' : 'People per km² (a rate)') + '</b></span><span><i style="background:var(--gg-q0)"></i>low</span><span><i style="background:var(--gg-q2)"></i>middle</span><span><i style="background:var(--gg-q4)"></i>high</span>';
      if (!F.quiet) F.say(by === 'total' ? 'Shaded by totals, the North looks most important, but it has the most people mostly because it is the largest region.' : 'Shaded by a rate, the small Capital and Coast stand out: they are the most crowded places. The North drops to the low end.');
    }
    draw();
    if (F.interactive && !F.quiet && o.buttons !== false) V.seg(F.ctl, { label: 'Shade by', items: [['total', 'Total people'], ['rate', 'People per km²']], value: by, change: function (q) { by = q; draw(); } });
    return {};
  });

  /* ---------------------------------------------------------------- humangeo-tree */
  var TREES = {
    ie: { root: 'Indo-European', items: [['Germanic', 'English, German, Dutch, Swedish, Norwegian, Danish'], ['Romance (from Latin)', 'Spanish, Portuguese, French, Italian, Romanian'], ['Balto-Slavic', 'Russian, Polish, Ukrainian, Czech, Serbian, Lithuanian'], ['Indo-Iranian', 'Hindi, Urdu, Bengali, Punjabi, Persian (Farsi), Pashto'], ['Celtic', 'Irish, Welsh, Scottish Gaelic, Breton'], ['Hellenic', 'Greek'], ['Albanian', 'Albanian'], ['Armenian', 'Armenian']] },
    families: { root: 'Some of the world\'s language families', items: [['Indo-European', 'English, Spanish, Hindi, Russian, Persian'], ['Sino-Tibetan', 'Mandarin and other Chinese languages, Tibetan, Burmese'], ['Afro-Asiatic', 'Arabic, Hebrew, Amharic, Hausa, Somali'], ['Niger-Congo', 'Swahili, Yoruba, Igbo, Zulu, Wolof'], ['Austronesian', 'Malay and Indonesian, Filipino (Tagalog), Malagasy, Hawaiian, Māori'], ['Dravidian', 'Tamil, Telugu, Kannada, Malayalam'], ['Turkic', 'Turkish, Uzbek, Kazakh, Azerbaijani'], ['Uralic', 'Finnish, Estonian, Hungarian'], ['Austroasiatic', 'Vietnamese, Khmer'], ['Japonic and Koreanic', 'Japanese; Korean']] } };
  V.register('humangeo-tree', function (el, o) {
    var F = frame(el, o, 'hgtree'), T = TREES[o.tree] || TREES.ie, hide = o.hide || [];
    F.body.appendChild(h('p', 'hg-root', esc(T.root)));
    var g = h('div', 'hg-tree'); F.body.appendChild(g);
    T.items.forEach(function (it) {
      var asked = o.ask && it[0].indexOf(o.ask) === 0, name = (F.quiet && asked) ? '?' : it[0];
      if (hide.indexOf(it[0]) >= 0) return;
      g.appendChild(h('div', 'hg-br' + (o.highlight && it[0].indexOf(o.highlight) === 0 ? ' hi' : ''), '<b>' + esc(name) + '</b><span>' + esc(it[1]) + '</span>'));
    });
    return {};
  });
})(typeof window !== 'undefined' ? window : globalThis);
