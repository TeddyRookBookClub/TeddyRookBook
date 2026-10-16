/* Course visuals for phys2, merged from part files by /tmp/merge_parts.js. */
/* ---- part A ---- */
/* Physics 2 course visuals (part A): schematic diagrams the ph- kit does not draw. Registered with MathLadder.viz.register.
   Static SVG, redrawn on theme change; no animation. Every visual takes label (aria-label) and caption-free use in problems.

   phys2-loops   A circuit made of 2 or 3 vertical branches between a top rail and a bottom rail. Two branches make one loop
                 (for example two batteries in one loop); three make the classic two-loop circuit for Kirchhoff's rules.
                 branches: [[part, …], …]  parts listed from top to bottom; a part is
                   {t: 'bat', v: 12, label: 'ε₁', plus: 'top'|'bottom'}   a battery (long plate = + terminal)
                   {t: 'res', v: 4, label: 'R₁'}                          a resistor (v null shows '?')
                 currents: [{b: 0, dir: 'up'|'down', label: 'I₁'}]        a current arrow beside branch b
                 points: [{b: 0, at: 'top'|'bottom', label: 'a'}]          a labeled point on the rail at branch b
                 units: true (default) shows 'Ω' and 'V' after values.
   phys2-junction  A junction (node) with wires at given angles and a current arrow on each.
                 wires: [{ang: 0, dir: 'in'|'out', label: '3.0 A'}]   angles in degrees from +x, counterclockwise.  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder; if (!ML || !ML.viz || !ML.viz.register) return;
  var V = ML.viz, NS = 'http://www.w3.org/2000/svg';
  if (!D.getElementById('phys2-viz-css')) {
    var st = D.createElement('style'); st.id = 'phys2-viz-css';
    st.textContent = '.p2v{max-width:540px;margin:0 auto}.p2v svg{display:block;width:100%;height:auto;overflow:visible}.p2v text{font:600 17px system-ui,-apple-system,"Segoe UI",sans-serif}.p2v .p2v-lab{font-weight:700}';
    D.head.appendChild(st);
  }
  function svgEl(tag, at, parent) { var e = D.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function text(parent, s, x, y, at) { var t = svgEl('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function fmtv(v) { return v == null ? '?' : V.fmt(v, 3); }
  function arrowHead(parent, x, y, ang, col, size) { // tip at (x, y), pointing along ang (radians, screen coordinates)
    var s = size || 9, a1 = ang + Math.PI - 0.45, a2 = ang + Math.PI + 0.45;
    svgEl('path', { d: 'M' + x + ' ' + y + 'L' + (x + s * Math.cos(a1)) + ' ' + (y + s * Math.sin(a1)) + 'L' + (x + s * Math.cos(a2)) + ' ' + (y + s * Math.sin(a2)) + 'Z', fill: col }, parent);
  }

  V.register('phys2-loops', function (el, o) {
    var box = D.createElement('div'); box.className = 'p2v'; el.appendChild(box);
    var br = (o.branches || [[{ t: 'bat', v: 12, label: 'ε', plus: 'top' }], [{ t: 'res', v: 6, label: 'R' }]]).slice(0, 3);
    var units = o.units !== false;
    function partText(p) { return (p.label || '') + (p.v == null && !p.label ? '?' : p.v == null ? ' = ?' : ' = ' + fmtv(p.v) + (units ? (p.t === 'bat' ? ' V' : ' Ω') : '')); }
    function describe() {
      return 'A circuit with ' + br.length + ' branches between a top and a bottom wire. ' + br.map(function (b, i) {
        return 'Branch ' + (i + 1) + ' (' + (i === 0 ? 'left' : i === br.length - 1 ? 'right' : 'middle') + '), top to bottom: ' + b.map(function (p) { return p.t === 'bat' ? 'battery ' + partText(p) + ' with its positive terminal on the ' + (p.plus === 'bottom' ? 'bottom' : 'top') : 'resistor ' + partText(p); }).join(', ') + '.';
      }).join(' ') + (o.currents || []).map(function (c) { return ' Current ' + (c.label || '') + ' flows ' + (c.dir === 'down' ? 'down' : 'up') + ' branch ' + (c.b + 1) + '.'; }).join('');
    }
    function draw() {
      box.innerHTML = '';
      var k = V.colors(), n = br.length, gap = n === 2 ? 240 : 190, x0 = 96, top = 34, bot = 250, Wd = x0 + gap * (n - 1) + 150, Hd = bot + 30;
      var svg = svgEl('svg', { viewBox: '0 0 ' + Wd + ' ' + Hd, role: 'img', 'aria-label': o.label || describe() }, box);
      var ink = k.ink, wire = { stroke: ink, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' };
      var X = function (i) { return x0 + i * gap; };
      svgEl('line', Object.assign({ x1: X(0), y1: top, x2: X(n - 1), y2: top }, wire), svg);
      svgEl('line', Object.assign({ x1: X(0), y1: bot, x2: X(n - 1), y2: bot }, wire), svg);
      br.forEach(function (parts, i) {
        var x = X(i), m = parts.length, span = bot - top, ys = parts.map(function (_, j) { return top + span * (j + 1) / (m + 1); }), half = 28, y = top;
        parts.forEach(function (p, j) {
          var yc = ys[j], h = p.t === 'bat' ? 12 : half;
          svgEl('line', Object.assign({ x1: x, y1: y, x2: x, y2: yc - h }, wire), svg); y = yc + h;
          if (p.t === 'bat') {
            var plusTop = p.plus !== 'bottom', yl = plusTop ? yc - 5 : yc + 5, ys2 = plusTop ? yc + 5 : yc - 5;
            svgEl('line', { x1: x, y1: yc - h, x2: x, y2: yl, stroke: ink, 'stroke-width': 2.4 }, svg);
            svgEl('line', { x1: x, y1: ys2, x2: x, y2: yc + h, stroke: ink, 'stroke-width': 2.4 }, svg);
            svgEl('line', { x1: x - 20, y1: yl, x2: x + 20, y2: yl, stroke: ink, 'stroke-width': 2.4 }, svg);
            svgEl('line', { x1: x - 10, y1: ys2, x2: x + 10, y2: ys2, stroke: ink, 'stroke-width': 5 }, svg);
            text(svg, '+', x - 30, yl + (plusTop ? -2 : 12), { fill: k.red, 'font-size': 16, 'text-anchor': 'middle' });
            text(svg, '−', x - 30, ys2 + (plusTop ? 12 : -2), { fill: k.blue, 'font-size': 16, 'text-anchor': 'middle' });
          } else {
            var d = 'M' + x + ' ' + (yc - half), segs = 6;
            for (var s = 0; s < segs; s++) d += 'L' + (x + (s % 2 ? -9 : 9)) + ' ' + (yc - half + (2 * half) * (s + 0.5) / segs);
            d += 'L' + x + ' ' + (yc + half);
            svgEl('path', { d: d, stroke: ink, 'stroke-width': 2.4, fill: 'none', 'stroke-linejoin': 'round' }, svg);
          }
          text(svg, partText(p), x + 16, yc + 5, { fill: p.t === 'bat' ? k.red : ink, class: 'p2v-lab' });
        });
        svgEl('line', Object.assign({ x1: x, y1: y, x2: x, y2: bot }, wire), svg);
        [top, bot].forEach(function (yy) { if (i > 0 && i < n - 1) svgEl('circle', { cx: x, cy: yy, r: 4.5, fill: ink }, svg); });
      });
      (o.currents || []).forEach(function (c) {
        var x = X(c.b) - 50, y1 = top + 26, y2 = top + 66, up = c.dir !== 'down', col = k.gold;
        var a = up ? y2 : y1, b2 = up ? y1 : y2;
        if (c.at === 'bottom') { a += bot - top - 92; b2 += bot - top - 92; }
        svgEl('line', { x1: x, y1: a, x2: x, y2: b2 + (up ? 4 : -4), stroke: col, 'stroke-width': 3 }, svg);
        arrowHead(svg, x, b2, up ? -Math.PI / 2 : Math.PI / 2, col, 11);
        text(svg, c.label || 'I', x - 8, (a + b2) / 2 + 5, { fill: col, 'text-anchor': 'end', class: 'p2v-lab' });
      });
      (o.points || []).forEach(function (p) {
        var x = X(p.b), y = p.at === 'bottom' ? bot : top;
        svgEl('circle', { cx: x, cy: y, r: 6, fill: k.bg, stroke: k.purple, 'stroke-width': 3 }, svg);
        text(svg, p.label, x + (p.b === 0 ? -14 : 12), y + (p.at === 'bottom' ? 22 : -10), { fill: k.purple, 'text-anchor': p.b === 0 ? 'end' : 'start', class: 'p2v-lab' });
      });
    }
    draw(); V.onTheme(draw);
    return { update: function (o2) { Object.assign(o, o2 || {}); br = (o.branches || br).slice(0, 3); draw(); } };
  });

  V.register('phys2-junction', function (el, o) {
    var box = D.createElement('div'); box.className = 'p2v'; box.style.maxWidth = '360px'; el.appendChild(box);
    var ws = o.wires || [{ ang: 180, dir: 'in', label: '3.0 A' }, { ang: 30, dir: 'out', label: '1.0 A' }, { ang: -30, dir: 'out', label: '?' }];
    function draw() {
      box.innerHTML = '';
      var k = V.colors(), cx = 180, cy = 130, L = 105;
      var svg = svgEl('svg', { viewBox: '0 0 360 260', role: 'img', 'aria-label': o.label || ('A junction with ' + ws.length + ' wires: ' + ws.map(function (w) { return w.label + ' ' + (w.dir === 'out' ? 'flowing out' : 'flowing in'); }).join(', ') + '.') }, box);
      ws.forEach(function (w) {
        var a = -w.ang * Math.PI / 180, ex = cx + L * Math.cos(a), ey = cy + L * Math.sin(a);
        svgEl('line', { x1: cx, y1: cy, x2: ex, y2: ey, stroke: k.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, svg);
        var mx = cx + 0.55 * L * Math.cos(a), my = cy + 0.55 * L * Math.sin(a), toward = w.dir !== 'out', dirA = toward ? a + Math.PI : a;
        arrowHead(svg, mx + 9 * Math.cos(dirA), my + 9 * Math.sin(dirA), dirA, k.gold, 14);
        var nx = -Math.sin(a), ny = Math.cos(a); if (ny < 0 || (Math.abs(ny) < 0.2 && nx < 0)) { nx = -nx; ny = -ny; } var lx = cx + 0.6 * L * Math.cos(a) + 16 * nx, ly = cy + 0.6 * L * Math.sin(a) + 16 * ny + 6 + (ny > 0.5 ? 6 : 0);
        text(svg, w.label, lx, ly, { fill: w.label === '?' || /\?/.test(w.label) ? k.purple : k.gold, 'text-anchor': nx < -0.3 ? 'end' : nx > 0.3 ? 'start' : 'middle', class: 'p2v-lab' });
      });
      svgEl('circle', { cx: cx, cy: cy, r: 7, fill: k.ink }, svg);
    }
    draw(); V.onTheme(draw);
    return {};
  });
})(window, document);

/* ---- part B ---- */
/* Physics 2 course visual (part B): phys2-rhr, the right-hand rules of magnetism in the plane of the page.
   Axes: +x to the right, +y toward the top of the page, out of the page toward the viewer (⊙), into the page (⊗).
   Directions are written '+x' | '-x' | '+y' | '-y' | 'out' | 'in'.

   <div class="ml-viz" data-viz="phys2-rhr" data-opts='{"mode":"force","v":"+x","B":"in","q":1}'></div>

   OPTIONS
     mode: 'force'   a charge q moving with velocity v through a uniform field B; shows F = q v × B (default)
           'wire'    a straight wire carrying current I (direction in v) through a uniform field B; shows F = I L × B
           'field'   the field of a long straight wire carrying current I (direction in v) at a point P beside it
           'lenz'    a loop in the page in a uniform field B ('out' or 'in') that is growing or shrinking; shows the
                     induced current (clockwise or counterclockwise as seen here) and the induced field
     v      direction of the velocity (force), of the current (wire, field). Default '+x' ('out' in field mode).
     B      direction of the field (force, wire, lenz). Default 'in'.
     q      sign of the charge, 1 or -1 (force mode). Default 1.
     P      where P sits from the wire (field mode): '+x' | '-x' | '+y' | '-y'. Default '+x' (or perpendicular to an
            in-page wire).
     change 'grow' | 'shrink' (lenz mode): the field's strength is increasing or decreasing. Default 'grow'.
     interactive: false   problem mode: no controls (the picture is frozen exactly as described)
     quiet: true          hides the answer: the force arrow (force, wire), the field at P (field), the induced current and
                          field (lenz), and the readout. show: ['answer'] turns the answer back on.
     task, label, height  as in every visual.
   Model (window.MathLadder.phys2rhr): cross(a, b) on direction keys -> a key or null (zero); wireField(I, P);
   lenz(B, change) -> {Bind, sense: 'ccw' | 'cw'}; name(key) -> words. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('phys2 viz: load math/viz/core.js first'); return; }
  var M = Math, PI = M.PI;
  var VEC = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], out: [0, 0, 1], 'in': [0, 0, -1] };
  var WORD = { '+x': 'to the right', '-x': 'to the left', '+y': 'toward the top of the page', '-y': 'toward the bottom of the page', out: 'out of the page', 'in': 'into the page' };
  var SYM = { '+x': '→', '-x': '←', '+y': '↑', '-y': '↓', out: '⊙', 'in': '⊗' };
  function key(v) { for (var k in VEC) { var a = VEC[k]; if (a[0] === v[0] && a[1] === v[1] && a[2] === v[2]) return k; } return null; }
  function neg(k) { var a = VEC[k]; return key([-a[0], -a[1], -a[2]]); }
  function cross(a, b) { var u = VEC[a], w = VEC[b]; if (!u || !w) return null; var c = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; return c[0] || c[1] || c[2] ? key(c) : null; }
  function wireField(I, P) { return cross(I, P); } // B at P is along I × r̂ (r̂ from the wire to P)
  function lenz(B, change) { var Bind = change === 'shrink' ? B : neg(B); return { Bind: Bind, sense: Bind === 'out' ? 'ccw' : 'cw' }; }
  ML.phys2rhr = { cross: cross, wireField: wireField, lenz: lenz, name: function (k) { return WORD[k]; }, neg: neg };

  function pick(v, list, d) { return list.indexOf(v) >= 0 ? v : d; }
  var ALL = ['+x', '-x', '+y', '-y', 'out', 'in'];
  function css() {
    if (D.getElementById('phys2b-css')) return;
    var s = D.createElement('style'); s.id = 'phys2b-css';
    s.textContent = '.p2r .ml-ctl{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}.p2r-task{margin:0 0 6px;font-size:.95em}.p2r .ml-cv{display:block;width:100%;border-radius:8px}.p2r-grp{display:flex;flex-direction:column;gap:3px}.p2r-lab{font:600 .78rem system-ui,sans-serif;opacity:.8}';
    D.head.appendChild(s);
  }
  function colors() {
    var k = V.colors(), d = D.documentElement.getAttribute('data-theme') === 'dark';
    k.bf = d ? '#91a7ff' : '#3b4fc4'; k.vel = k.green; k.force = d ? '#74c0fc' : '#1c6fd6'; k.cur = d ? '#ffd479' : '#b8860b'; k.pos = k.red; k.negc = d ? '#74c0fc' : '#1c6fd6';
    return k;
  }
  function rgba(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function font(sz, w) { return (w || 600) + ' ' + sz + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }
  function text(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o.size || 13, o.weight || 700); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
    var w = ctx.measureText(s).width, cw = ctx.canvas.width / (ctx.getTransform ? ctx.getTransform().a : 1);
    var lft = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; if (lft < 3) x += 3 - lft; else if (lft + w > cw - 3) x -= lft + w - (cw - 3);
    if (o.halo !== false) { ctx.strokeStyle = o.haloc; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color; ctx.fillText(s, x, y); ctx.restore();
  }
  function arrow(ctx, x1, y1, x2, y2, col, w, dash) {
    var L = M.hypot(x2 - x1, y2 - y1); if (L < 1) return; var a = M.atan2(y2 - y1, x2 - x1), hs = M.min(8 + w * 2, L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(a), y2 - hs * 0.6 * M.sin(a)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function sym(ctx, x, y, r, dir, col, bg, w) { // ⊙ or ⊗
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.8; ctx.stroke();
    if (dir === 'out') { ctx.beginPath(); ctx.arc(x, y, M.max(1.6, r * 0.28), 0, 2 * PI); ctx.fillStyle = col; ctx.fill(); }
    else { var d = r * 0.62; ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x - d, y + d); ctx.lineTo(x + d, y - d); ctx.stroke(); }
    ctx.restore();
  }
  function dirArrow(ctx, k, x, y, len, dir, col, w, label, K, lab2) { // an in-page arrow from (x, y), or a ⊙/⊗ beside the point
    var u = VEC[dir];
    if (u[2]) { var ox = x + len * 0.55, oy = y - len * 0.55; sym(ctx, ox, oy, 13, dir, col, K.bg, 2.6); text(ctx, label + (lab2 ? '' : ''), ox + 18, oy, { color: col, haloc: K.halo, size: 14 }); return [ox, oy]; }
    var x2 = x + u[0] * len, y2 = y - u[1] * len; arrow(ctx, x, y, x2, y2, col, w); text(ctx, label, x2 + u[0] * 14 + (u[1] ? 12 : 0), y2 - u[1] * 14, { color: col, haloc: K.halo, size: 14, align: u[0] < 0 ? 'right' : u[0] > 0 ? 'left' : 'left' }); return [x2, y2];
  }
  function field(ctx, K, w, h, B, faint, clear) { // a uniform field filling the canvas; clear: [x, y, r] left empty
    var u = VEC[B], col = rgba(K.bf, faint ? 0.35 : 0.5);
    if (u[2]) { for (var gx = 26; gx < w; gx += 46) for (var gy = 24; gy < h; gy += 46) { if (clear && M.hypot(gx - clear[0], gy - clear[1]) < clear[2]) continue; sym(ctx, gx, gy, 6, B, col, K.bg, 1.5); } }
    else {
      if (u[0]) for (var y = 24; y < h; y += 40) for (var x = 14; x < w - 30; x += 70) arrow(ctx, x + (u[0] < 0 ? 40 : 0), y, x + (u[0] < 0 ? 0 : 40), y, col, 1.6);
      else for (var x2 = 24; x2 < w; x2 += 46) for (var y2 = 14; y2 < h - 30; y2 += 64) arrow(ctx, x2, y2 + (u[1] > 0 ? 40 : 0), x2, y2 + (u[1] > 0 ? 0 : 40), col, 1.6);
    }
  }

  V.register('phys2-rhr', function (el, o) {
    o = o || {}; css();
    var mode = pick(o.mode, ['force', 'wire', 'field', 'lenz'], 'force');
    var S = { v: pick(o.v, ALL, mode === 'field' ? 'out' : '+x'), B: pick(o.B, mode === 'lenz' ? ['out', 'in'] : ALL, 'in'), q: +o.q < 0 ? -1 : 1, P: pick(o.P, ['+x', '-x', '+y', '-y'], '+x'), change: o.change === 'shrink' ? 'shrink' : 'grow' };
    var live = o.interactive !== false, show = [].concat(o.show || []), quiet = !!(o.quiet || o.readout === false), ans = !quiet || show.indexOf('answer') >= 0;
    function fixP() { var u = VEC[S.v]; if (mode === 'field' && !u[2]) { var pu = VEC[S.P]; if ((u[0] && pu[0]) || (u[1] && pu[1])) S.P = u[0] ? '+y' : '+x'; } }
    fixP();
    el.classList.add('p2r'); el.setAttribute('role', 'group');
    var lab = { force: 'A charge moving through a magnetic field', wire: 'A current-carrying wire in a magnetic field', field: 'The magnetic field beside a long straight wire', lenz: 'A loop in a changing magnetic field' }[mode];
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || lab);
    if (o.task && live) { var tk = D.createElement('p'); tk.className = 'p2r-task'; tk.innerHTML = o.task; el.appendChild(tk); try { if (ML.typeset) ML.typeset(tk); } catch (e) { } }
    var box = D.createElement('div'); el.appendChild(box);
    var copts = { aspect: 1.7, max: o.height || 330, min: o.height || 220, height: o.height }, c = V.canvas(box, copts);
    function adapt() { if (o.height) return; var narrow = (box.clientWidth || 600) < 520, a = narrow ? 1.2 : 1.7; if (copts.aspect !== a) { copts.aspect = a; copts.max = narrow ? 380 : 330; c.fit(); } }
    adapt();
    c.cv.setAttribute('role', 'img');
    var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl); if (!live) ctl.hidden = true;
    var out = V.readout(el); if (!ans || !live) out.el.hidden = !ans;
    function items(list) { return list.map(function (k) { return [k, SYM[k]]; }); }
    function group(label, list, value, change, texts) { // a labeled segmented control; buttons get spoken names
      var gw = D.createElement('div'); gw.className = 'p2r-grp'; var lb = D.createElement('span'); lb.className = 'p2r-lab'; lb.textContent = label; gw.appendChild(lb); ctl.appendChild(gw);
      var sg = V.seg(gw, { label: label, items: texts || items(list), value: value, change: change });
      [].forEach.call(sg.el.querySelectorAll('button'), function (b) { var k = b.dataset.v; if (WORD[k]) { b.setAttribute('aria-label', label + ': ' + WORD[k]); b.title = WORD[k]; } });
      return sg;
    }
    if (live) {
      if (mode === 'force' || mode === 'wire') {
        group(mode === 'force' ? 'Velocity v' : 'Current I', ALL, S.v, function (v) { S.v = v; draw(); });
        group('Field B', ALL, S.B, function (v) { S.B = v; draw(); });
        if (mode === 'force') group('Charge', null, String(S.q), function (v) { S.q = +v; draw(); }, [['1', '+'], ['-1', '−']]);
      } else if (mode === 'field') {
        var sp = null;
        group('Current I', ALL, S.v, function (v) { S.v = v; fixP(); if (sp) sp.set(S.P); draw(); });
        sp = group('Point P', ['+x', '-x', '+y', '-y'], S.P, function (v) { S.P = v; fixP(); if (sp && sp.get() !== S.P) sp.set(S.P); draw(); });
      } else {
        group('Field B', null, S.B, function (v) { S.B = v; draw(); }, [['out', '⊙ out'], ['in', '⊗ in']]);
        group('Field strength', null, S.change, function (v) { S.change = v; draw(); }, [['grow', 'growing'], ['shrink', 'shrinking']]);
      }
    }
    function draw() {
      var ctx = c.ctx, w = c.w, h = c.h, K = colors(); K.halo = D.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(20,33,26,0.9)' : 'rgba(255,255,255,0.92)';
      ctx.fillStyle = K.bg; ctx.fillRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, L = M.min(w, h) * 0.3, desc = '', read = '';
      if (mode === 'force' || mode === 'wire') {
        field(ctx, K, w, h, S.B, false, [cx, cy, 30]);
        text(ctx, 'B ' + WORD[S.B], w - 8, 12, { align: 'right', color: K.bf, haloc: K.halo, size: 12.5 });
        var Fd = cross(S.v, S.B); if (Fd && mode === 'force' && S.q < 0) Fd = neg(Fd);
        if (mode === 'force') {
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 2 * PI); ctx.fillStyle = S.q > 0 ? K.pos : K.negc; ctx.fill(); ctx.restore();
          text(ctx, S.q > 0 ? '+' : '−', cx, cy + 0.5, { align: 'center', color: '#fff', halo: false, size: 17, weight: 800 });
          var vu = VEC[S.v]; if (vu[2]) { sym(ctx, cx - L * 0.6, cy + L * 0.55, 13, S.v, K.vel, K.bg, 2.6); text(ctx, 'v ' + WORD[S.v], cx - L * 0.6 + 18, cy + L * 0.55, { color: K.vel, haloc: K.halo, size: 13 }); }
          else { var x0 = cx + vu[0] * 18, y0 = cy - vu[1] * 18; dirArrow(ctx, null, x0, y0, L, S.v, K.vel, 3.2, 'v', K); }
          desc = 'A ' + (S.q > 0 ? 'positive' : 'negative') + ' charge moving ' + WORD[S.v] + ' through a magnetic field that points ' + WORD[S.B] + '.';
        } else {
          var iu = VEC[S.v];
          if (iu[2]) { sym(ctx, cx, cy, 15, S.v, K.cur, K.bg, 3); text(ctx, 'I ' + WORD[S.v], cx + 22, cy + 26, { color: K.cur, haloc: K.halo, size: 13 }); }
          else { ctx.save(); ctx.strokeStyle = K.cur; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - iu[0] * L * 1.6, cy + iu[1] * L * 1.2); ctx.lineTo(cx + iu[0] * L * 1.6, cy - iu[1] * L * 1.2); ctx.stroke(); ctx.restore(); arrow(ctx, cx - iu[0] * 30 + (iu[1] ? 18 : 0), cy + iu[1] * 30 + (iu[0] ? 18 : 0), cx + iu[0] * 30 + (iu[1] ? 18 : 0), cy - iu[1] * 30 + (iu[0] ? 18 : 0), K.cur, 3); text(ctx, 'I', cx + iu[0] * 30 + (iu[1] ? 30 : 0), cy - iu[1] * 30 + (iu[0] ? 32 : 0), { color: K.cur, haloc: K.halo, size: 14 }); }
          desc = 'A straight wire carrying current ' + WORD[S.v] + ' in a magnetic field that points ' + WORD[S.B] + '.';
        }
        if (ans) {
          if (!Fd) text(ctx, 'F = 0', cx + 24, cy - 26, { color: K.force, haloc: K.halo, size: 15 });
          else { var fu = VEC[Fd]; if (fu[2]) { sym(ctx, cx + L * 0.75, cy - L * 0.6, 15, Fd, K.force, K.bg, 3); text(ctx, 'F ' + WORD[Fd], cx + L * 0.75 + 20, cy - L * 0.6, { color: K.force, haloc: K.halo, size: 13.5 }); } else { var off = mode === 'wire' && !VEC[S.v][2] ? 0 : 18; dirArrow(ctx, null, cx + fu[0] * off, cy - fu[1] * off, L * 1.05, Fd, K.force, 4.2, 'F', K); } }
          if (mode === 'force') read = !Fd ? 'The velocity is along the field, so sin θ = 0 and there is <b>no magnetic force</b>.' : 'F = qv × B. Point your right hand\'s fingers along v and curl them toward B: your thumb points ' + WORD[S.q > 0 ? Fd : neg(Fd)] + (S.q > 0 ? '. For this positive charge, <b>F points ' + WORD[Fd] + '</b>.' : '. This charge is negative, so flip it: <b>F points ' + WORD[Fd] + '</b>.') + ' F is always at right angles to both v and B.';
          else read = !Fd ? 'The current runs along the field, so <b>F = 0</b>.' : 'F = IL × B. Fingers along the current I (conventional current, the way positive charge flows), curl toward B: your thumb gives <b>F ' + WORD[Fd] + '</b>, at right angles to both the wire and the field.';
          desc += Fd ? ' The force points ' + WORD[Fd] + '.' : ' There is no force.';
        }
      } else if (mode === 'field') {
        var u = VEC[S.v], pu = VEC[S.P], Bp = wireField(S.v, S.P), px, py;
        if (u[2]) {
          for (var r = 1; r <= 4; r++) { var rr = r * L * 0.38; ctx.save(); ctx.strokeStyle = rgba(K.bf, 0.5); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 2 * PI); ctx.stroke(); ctx.restore();
            if (ans) { var ccw = S.v === 'out', a0 = -PI / 4 + r * 0.5; var ax = cx + rr * M.cos(a0), ay = cy - rr * M.sin(a0), tx = (ccw ? -1 : 1) * M.sin(a0), ty = (ccw ? -1 : 1) * M.cos(a0); arrow(ctx, ax - tx * 8, ay - ty * 8, ax + tx * 8, ay + ty * 8, rgba(K.bf, 0.75), 1.6); } }
          sym(ctx, cx, cy, 15, S.v, K.cur, K.bg, 3); text(ctx, 'I ' + WORD[S.v], cx, pu[1] < 0 ? cy - 30 : cy + 30, { align: 'center', color: K.cur, haloc: K.halo, size: 12.5 });
          px = cx + pu[0] * L * 1.15; py = cy - pu[1] * L * 1.15;
        } else {
          ctx.save(); ctx.strokeStyle = K.cur; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - u[0] * w * 0.45, cy + u[1] * h * 0.45); ctx.lineTo(cx + u[0] * w * 0.45, cy - u[1] * h * 0.45); ctx.stroke(); ctx.restore();
          arrow(ctx, cx - u[0] * 30, cy + u[1] * 30, cx + u[0] * 30, cy - u[1] * 30, K.cur, 3); text(ctx, 'I', cx + u[0] * 40 + (u[1] ? 12 : 0), cy - u[1] * 40 - (u[0] ? 14 : 0), { color: K.cur, haloc: K.halo, size: 14 });
          if (ans) { [1, -1].forEach(function (sd) { var side = u[0] ? (sd > 0 ? '+y' : '-y') : (sd > 0 ? '+x' : '-x'), bd = wireField(S.v, side), su = VEC[side]; for (var j = -2; j <= 2; j++) { if (j === 0) continue; var gx = cx + su[0] * L * 0.75 + (u[0] ? j * 46 : 0), gy = cy - su[1] * L * 0.75 + (u[1] ? j * 40 : 0); sym(ctx, gx, gy, 6, bd, rgba(K.bf, 0.6), K.bg, 1.5); } }); }
          px = cx + pu[0] * L * 1.25; py = cy - pu[1] * L * 1.25;
        }
        ctx.save(); ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * PI); ctx.fillStyle = K.gold; ctx.fill(); ctx.restore(); text(ctx, 'P', px + (pu[0] < 0 ? -12 : 10), py + (pu[1] ? -14 : 14), { color: K.ink, haloc: K.halo, size: 14, align: pu[0] < 0 ? 'right' : 'left' });
        if (ans) { var bu = VEC[Bp]; if (bu[2]) { sym(ctx, px + 28, py, 12, Bp, K.bf, K.bg, 2.6); text(ctx, 'B', px + 46, py, { color: K.bf, haloc: K.halo, size: 14 }); } else { arrow(ctx, px, py, px + bu[0] * L * 0.7, py - bu[1] * L * 0.7, K.bf, 3.4); text(ctx, 'B', px + bu[0] * (L * 0.7 + 14) + (bu[1] ? 12 : 0), py - bu[1] * (L * 0.7 + 12), { color: K.bf, haloc: K.halo, size: 14 }); } }
        desc = 'A long straight wire carrying current ' + WORD[S.v] + ', and a point P ' + WORD[S.P].replace('toward the ', 'toward the ') + ' of it.' + (ans ? ' The field at P points ' + WORD[Bp] + '.' : '');
        read = 'Right-hand rule for a wire: thumb along the current, and your fingers curl the way the field circles the wire. The field lines are closed circles; they never start or stop. At P the field points <b>' + WORD[Bp] + '</b>, and its strength is B = μ₀I/(2πr).';
      } else { // lenz
        var grow = S.change === 'grow', res = lenz(S.B, S.change), R = M.min(w, h) * 0.32;
        field(ctx, K, w, h, S.B, !grow);
        text(ctx, 'B ' + WORD[S.B] + ', ' + (grow ? 'growing' : 'shrinking'), w - 8, 12, { align: 'right', color: K.bf, haloc: K.halo, size: 12.5 });
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fillStyle = K.bg; ctx.fill(); ctx.strokeStyle = K.cur; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
        for (var gx2 = cx - R + 26; gx2 < cx + R; gx2 += 40) for (var gy2 = cy - R + 26; gy2 < cy + R; gy2 += 40) if (M.hypot(gx2 - cx, gy2 - cy) < R - 14) sym(ctx, gx2, gy2, grow ? 7 : 5, S.B, rgba(K.bf, grow ? 0.7 : 0.35), K.bg, 1.5);
        if (ans) {
          var ccw2 = res.sense === 'ccw';
          [0, 1, 2, 3].forEach(function (i) { var a = i * PI / 2 + PI / 4, x = cx + R * M.cos(a), y = cy - R * M.sin(a), tx = (ccw2 ? -1 : 1) * M.sin(a), ty = (ccw2 ? -1 : 1) * M.cos(a); arrow(ctx, x - tx * 12, y - ty * 12, x + tx * 14, y + ty * 14, K.cur, 3.4); });
          sym(ctx, cx, cy, 20, res.Bind, K.force, K.bg, 3); text(ctx, 'induced B', cx, cy + 34, { align: 'center', color: K.force, haloc: K.halo, size: 13 });
          text(ctx, 'induced current: ' + (ccw2 ? 'counterclockwise' : 'clockwise'), cx, cy - R - 14 < 18 ? cy + R + 16 : cy - R - 14, { align: 'center', color: K.cur, haloc: K.halo, size: 13 });
        } else text(ctx, '?', cx, cy, { align: 'center', color: K.ink, haloc: K.halo, size: 22, weight: 800 });
        desc = 'A loop lying in the page, in a magnetic field pointing ' + WORD[S.B] + ' that is ' + (grow ? 'growing stronger' : 'getting weaker') + '.' + (ans ? ' The induced current flows ' + (res.sense === 'ccw' ? 'counterclockwise' : 'clockwise') + '.' : '');
        read = 'The flux ' + WORD[S.B] + ' is <b>' + (grow ? 'increasing' : 'decreasing') + '</b>, so the induced current makes its own field <b>' + WORD[res.Bind] + '</b> inside the loop, ' + (grow ? 'against the growth' : 'to make up for the loss') + '. Curl your right hand\'s fingers so your thumb points ' + WORD[res.Bind] + ': the current flows <b>' + (res.sense === 'ccw' ? 'counterclockwise' : 'clockwise') + '</b>. Lenz\'s law opposes the <b>change</b>, not the field.';
      }
      c.cv.setAttribute('aria-label', desc); c.cv.textContent = desc;
      if (ans) out.set(read);
    }
    c.onResize(function () { adapt(); draw(); }); V.onTheme(draw); draw();
    return { update: function (no) { Object.assign(S, no || {}); draw(); } };
  });
})(window, document);
