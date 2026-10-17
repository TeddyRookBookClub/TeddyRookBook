/* Earth & Space Ladder, Earth Science (earthsci): two course visuals. Needs math/viz/core.js (window.MathLadder.viz).
 * Built by /tmp/work_earthsci/build.js from src/viz.js. Both are SVG, follow the light and dark themes, fit a 360-px phone,
 * and carry an aria-label that says what they show.
 *
 * earthsci-contours: a topographic map of one hill, with contour lines a learner can read exactly (made for problems).
 *     opts:
 *     base: elevation of the lowest (outermost) contour (default 100); interval: contour interval (default 20); n: number of
 *           contour lines (default 8); units: 'm' | 'ft' (default 'm')
 *     steep: 'E' | 'W' | 'N' | 'S' (the side of the hill where the lines crowd together; default 'E')
 *     index: every index-th line is drawn bold (default 5; 0 = none); labels: list of line numbers (0 = outermost) that carry
 *           their elevation (default: the bold index lines, or lines 0 and n-1 when there are none)
 *     points: [{c: line number, ang: degrees (0 = east, 90 = north), label, mid: true (halfway out to the next line down)}]
 *           points sit on line c (mid: between line c and line c − 1, on the outside)
 *     summit: true (mark the top with ×; default true); scale: map width in km for the scale bar (default 2)
 *     quiet: hides each point's elevation (lessons show it); lock: no slider (lessons get an interval slider unless lock)
 *     The elevation of line c is base + c × interval, so a generator knows every reading.
 *
 * earthsci-impact: total use as the area of a rectangle: width = number of people, height = use per person.
 *     opts:
 *     people (default 8), use (default 5): the two sides; pUnit (default 'billion people'), uUnit (default 'units per person'),
 *     tUnit (default 'billion units'); pMax, uMax: slider ranges (default twice the start values)
 *     compare: true (keep the starting rectangle as a dashed outline to compare with); quiet: hide the totals; lock: no sliders
 */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, NS = 'http://www.w3.org/2000/svg';
  function num(v, d) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) ? x : d; }
  function svg(tag, at, parent) { var e = D.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function fmt(v) { var s = String(M.round(v * 100) / 100); if (M.abs(v) >= 1000) s = M.round(v).toLocaleString('en-US'); return s.replace('-', '−'); }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  // text and markers are sized in viewBox units; on a narrow screen the whole picture shrinks, so grow them back
  function kOf(box, VW) { var w = box.clientWidth || VW; return M.max(1, M.min(1.9, 0.8 * VW / w)); }
  function onResize(box, fn) { if (W.ResizeObserver) { var last = 0, ro = new W.ResizeObserver(function () { var w = box.clientWidth; if (M.abs(w - last) > 8) { last = w; fn(); } }); ro.observe(box); return ro; } return null; }

  // ---------------------------------------------------------------- earthsci-contours
  V.register('earthsci-contours', function (el, o) {
    var base = num(o.base, 100), iv = num(o.interval, 20), n = M.max(2, M.min(14, M.round(num(o.n, 8)))), unit = o.units === 'ft' ? 'ft' : 'm';
    var steep = /^[EWNS]$/.test(o.steep) ? o.steep : 'E', idx = o.index == null ? 5 : M.max(0, M.round(num(o.index, 5)));
    var labels = Array.isArray(o.labels) ? o.labels.map(Number) : null;
    var pts = Array.isArray(o.points) ? o.points : [], quiet = !!o.quiet, lock = !!o.lock, Wkm = num(o.scale, 2);
    var VW = 600, VH = 380, cx = 300, cy = 196, RX = 255, RY = 160;
    var dir = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }[steep];
    var box = D.createElement('div'); el.appendChild(box);
    var root = svg('svg', { viewBox: '0 0 ' + VW + ' ' + VH, width: '100%', role: 'img', focusable: 'false' }, box);
    root.style.display = 'block'; root.style.maxWidth = '100%'; root.style.height = 'auto'; root.style.borderRadius = '10px';
    var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
    var out = V.readout(el);
    if (!lock && !quiet) V.slider(ctl, { label: 'Contour interval', min: 5, max: 50, step: 5, value: iv, fmt: function (v) { return v + ' ' + unit; }, input: function (v) { iv = v; draw(); } });
    function wob(t) { return 1 + 0.07 * M.sin(3 * t + 0.6) + 0.04 * M.sin(5 * t + 2.1) + 0.03 * M.cos(2 * t + 1.3); }
    function shape(c) { // the c-th line: center and radii
      var f = 1 - 0.9 * c / n, sh = (1 - f) * 0.62;
      return { x: cx + dir[0] * sh * RX, y: cy + dir[1] * sh * RY, rx: RX * f, ry: RY * f };
    }
    function at(c, deg) { var s = shape(c), t = deg * M.PI / 180, w = wob(t); return [s.x + s.rx * w * M.cos(t), s.y - s.ry * w * M.sin(t)]; }
    function elev(c) { return base + c * iv; }
    function isIdx(c) { return idx > 0 && M.abs(elev(c) % (idx * iv)) < 1e-9; }
    function draw() {
      while (root.firstChild) root.removeChild(root.firstChild);
      var k = kOf(box, VW);
      var dk = dark(), ink = dk ? '#e6ece8' : '#1d2320', paper = dk ? '#1f2e22' : '#f6f2e3', line = dk ? '#d9a877' : '#9c5a2b', lab = dk ? '#f6d2a8' : '#6e3510', halo = dk ? '#1f2e22' : '#f6f2e3';
      svg('rect', { x: 0, y: 0, width: VW, height: VH, fill: paper, rx: 10 }, root);
      // soft tint rising with height
      for (var c = 0; c < n; c++) {
        var d = '', s = shape(c);
        for (var a = 0; a <= 360; a += 4) { var p = at(c, a); d += (a ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
        svg('path', { d: d + 'Z', fill: dk ? 'rgba(201,168,118,' + (0.05 + 0.05 * c / n).toFixed(3) + ')' : 'rgba(170,140,80,' + (0.04 + 0.05 * c / n).toFixed(3) + ')', stroke: line, 'stroke-width': isIdx(c) ? 2.6 : 1.3 }, root);
      }
      // labels on lines
      var want = labels || (function () { var L = []; for (var c2 = 0; c2 < n; c2++) if (isIdx(c2)) L.push(c2); return L.length ? L : [0, n - 1]; })();
      want.forEach(function (c3, j) {
        if (c3 < 0 || c3 >= n) return; var ang = 215 + (j % 2) * 30, p = at(c3, ang), t = fmt(elev(c3));
        svg('rect', { x: p[0] - (4 + t.length * 4.1) * k, y: p[1] - 9 * k, width: (t.length * 8.2 + 8) * k, height: 17 * k, fill: halo, rx: 4 }, root);
        var tx = svg('text', { x: p[0], y: p[1] + 4.5 * k, 'text-anchor': 'middle', 'font-size': 13 * k, 'font-weight': 700, fill: lab, 'font-family': 'system-ui, sans-serif' }, root); tx.textContent = t;
      });
      // summit
      if (o.summit !== false) { var top = shape(n - 1); svg('path', { d: 'M' + (top.x - 6) + ' ' + (top.y - 6) + 'L' + (top.x + 6) + ' ' + (top.y + 6) + 'M' + (top.x + 6) + ' ' + (top.y - 6) + 'L' + (top.x - 6) + ' ' + (top.y + 6), stroke: ink, 'stroke-width': 2.4 }, root); }
      // points
      var said = [];
      pts.forEach(function (q, i) {
        var c4 = M.max(0, M.min(n - 1, M.round(num(q.c, 0)))), ang = num(q.ang, 90 * i), p = at(c4, ang), e = elev(c4);
        if (q.mid && c4 > 0) { var p0 = at(c4 - 1, ang); p = [(p[0] + p0[0]) / 2, (p[1] + p0[1]) / 2]; e = elev(c4) - iv / 2; }
        var L = q.label != null ? String(q.label) : 'ABCDEFGH'.charAt(i);
        svg('circle', { cx: p[0], cy: p[1], r: 5 * k, fill: dk ? '#ffd479' : '#b8963e', stroke: ink, 'stroke-width': 1.5 }, root);
        var ox = p[0] + (p[0] > cx ? 14 : -14) * k, oy = p[1] - 12 * k;
        svg('circle', { cx: ox, cy: oy, r: 11 * k, fill: dk ? '#14211a' : '#ffffff', stroke: ink, 'stroke-width': 1.5 }, root);
        var tb = svg('text', { x: ox, y: oy + 4.5 * k, 'text-anchor': 'middle', 'font-size': 13 * k, 'font-weight': 700, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); tb.textContent = L;
        if (!quiet) { var te = svg('text', { x: ox + (p[0] > cx ? 14 : -14) * k, y: oy + 4.5 * k, 'text-anchor': p[0] > cx ? 'start' : 'end', 'font-size': 12 * k, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); te.textContent = fmt(e) + ' ' + unit; }
        said.push(L + (quiet ? '' : ' at ' + fmt(e) + ' ' + unit));
      });
      // north arrow, scale bar, interval
      svg('path', { d: 'M28 58 L36 34 L44 58 L36 52 Z', fill: ink }, root);
      var tn = svg('text', { x: 36, y: 28, 'text-anchor': 'middle', 'font-size': 13 * k, 'font-weight': 700, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); tn.textContent = 'N';
      var sb = Wkm >= 2 ? 1 : 0.5, px = sb / Wkm * VW;
      svg('path', { d: 'M20 ' + (VH - 18) + ' h' + px.toFixed(1), stroke: ink, 'stroke-width': 4 }, root);
      var ts = svg('text', { x: 24 + px, y: VH - 13, 'font-size': 12 * k, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); ts.textContent = sb + ' km';
      var ti = svg('text', { x: VW - 14, y: VH - 13, 'text-anchor': 'end', 'font-size': 12 * k, 'font-weight': 700, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); ti.textContent = (k > 1.3 ? 'Interval ' : 'Contour interval ') + fmt(iv) + ' ' + unit;
      root.setAttribute('aria-label', 'A topographic map of one hill with ' + n + ' contour lines, ' + fmt(iv) + ' ' + unit + ' apart, crowded together on the ' + { E: 'east', W: 'west', N: 'north', S: 'south' }[steep] + ' side.' + (said.length ? ' Marked points: ' + said.join(', ') + '.' : ''));
      out.set(quiet ? 'Each line joins points of equal height. Count the lines between two points and multiply by the interval.' : 'Lines are ' + fmt(iv) + ' ' + unit + ' apart in height. The lowest line is ' + fmt(base) + ' ' + unit + ' and the highest is ' + fmt(elev(n - 1)) + ' ' + unit + '. Where lines crowd together (the ' + { E: 'east', W: 'west', N: 'north', S: 'south' }[steep] + ' side) the slope is steep.');
    }
    draw();
    if (V.onTheme) V.onTheme(draw);
    var ro = onResize(box, draw);
    return { destroy: function () { if (ro) ro.disconnect(); el.innerHTML = ''; } };
  });

  // ---------------------------------------------------------------- earthsci-impact
  V.register('earthsci-impact', function (el, o) {
    var p0 = num(o.people, 8), u0 = num(o.use, 5), p = p0, u = u0, quiet = !!o.quiet, lock = !!o.lock;
    var pU = o.pUnit || 'billion people', uU = o.uUnit || 'units per person', tU = o.tUnit || 'billion units';
    var pMax = num(o.pMax, p0 * 2), uMax = num(o.uMax, u0 * 2);
    var VW = 600, VH = 320;
    var box = D.createElement('div'); el.appendChild(box);
    var root = svg('svg', { viewBox: '0 0 ' + VW + ' ' + VH, width: '100%', role: 'img', focusable: 'false' }, box);
    root.style.display = 'block'; root.style.maxWidth = '100%'; root.style.height = 'auto'; root.style.borderRadius = '10px';
    var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
    var out = V.readout(el);
    if (!lock) {
      V.slider(ctl, { label: 'People', min: pMax / 20, max: pMax, step: pMax / 40, value: p0, fmt: function (v) { return fmt(v) + ' ' + pU.split(' ')[0]; }, input: function (v) { p = v; draw(); } });
      V.slider(ctl, { label: 'Use each', min: uMax / 20, max: uMax, step: uMax / 40, value: u0, fmt: function (v) { return fmt(v) + ' ' + uU.split(' ')[0]; }, input: function (v) { u = v; draw(); } });
    }
    function draw() {
      while (root.firstChild) root.removeChild(root.firstChild);
      var k = kOf(box, VW);
      var dk = dark(), ink = dk ? '#e6ece8' : '#1d2320', muted = dk ? '#a9b8af' : '#5d6862', paper = dk ? '#14211a' : '#ffffff', fill = dk ? 'rgba(108,199,154,0.35)' : 'rgba(0,112,60,0.22)', edge = dk ? '#6cc79a' : '#00703c';
      svg('rect', { x: 0, y: 0, width: VW, height: VH, fill: paper, rx: 10 }, root);
      var x0 = 40 + 30 * k, y0 = VH - 30 - 20 * k, sx = (VW - 110) / pMax, sy = (VH - 90) / uMax;
      // axes
      svg('path', { d: 'M' + x0 + ' ' + (y0 - uMax * sy - 6) + 'V' + y0 + 'H' + (x0 + pMax * sx + 6), stroke: muted, 'stroke-width': 1.5, fill: 'none' }, root);
      if (o.compare) svg('rect', { x: x0, y: y0 - u0 * sy, width: p0 * sx, height: u0 * sy, fill: 'none', stroke: muted, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, root);
      svg('rect', { x: x0, y: y0 - u * sy, width: p * sx, height: u * sy, fill: fill, stroke: edge, 'stroke-width': 2.5 }, root);
      var t1 = svg('text', { x: x0 + p * sx / 2, y: y0 + 20 * k, 'text-anchor': 'middle', 'font-size': 14 * k, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); t1.textContent = fmt(p) + ' ' + pU;
      var t2 = svg('text', { x: x0 - 10 * k, y: y0 - u * sy / 2, 'text-anchor': 'middle', 'font-size': 14 * k, fill: ink, 'font-family': 'system-ui, sans-serif', transform: 'rotate(-90 ' + (x0 - 10 * k) + ' ' + (y0 - u * sy / 2) + ')' }, root); t2.textContent = fmt(u) + ' each';
      var tot = p * u;
      if (!quiet) { var t3 = svg('text', { x: x0 + p * sx / 2, y: y0 - u * sy / 2 + 6 * k, 'text-anchor': 'middle', 'font-size': 17 * k, 'font-weight': 700, fill: ink, 'font-family': 'system-ui, sans-serif' }, root); t3.textContent = 'total ' + fmt(tot); }
      root.setAttribute('aria-label', 'Total use drawn as a rectangle: ' + fmt(p) + ' ' + pU + ' wide and ' + fmt(u) + ' ' + uU + ' tall' + (quiet ? '.' : ', an area of ' + fmt(tot) + ' ' + tU + '.') + (o.compare ? ' A dashed outline shows the start, ' + fmt(p0) + ' by ' + fmt(u0) + '.' : ''));
      out.set(quiet ? 'Total use is the area: people times use per person.' : 'Total = ' + fmt(p) + ' × ' + fmt(u) + ' = <b>' + fmt(tot) + ' ' + tU + '</b>' + (o.compare ? (M.abs(tot - p0 * u0) < 1e-9 ? '. Move a slider to compare with this start.' : ' (' + (tot > p0 * u0 ? 'up ' : 'down ') + fmt(M.abs(tot / (p0 * u0) - 1) * 100) + '% from the dashed start, ' + fmt(p0 * u0) + ').') : '.'));
    }
    draw();
    if (V.onTheme) V.onTheme(draw);
    var ro = onResize(box, draw);
    return { destroy: function () { if (ro) ro.disconnect(); el.innerHTML = ''; } };
  });
})(window, document);
