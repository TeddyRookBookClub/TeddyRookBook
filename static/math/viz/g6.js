/* Math Ladder visuals made for Grade 6 (static/math/viz/g6.js), registered on window.MathLadder.viz.
   Most are still pictures for practice problems: they show the numbers a problem needs and never print the answer.
   Two are interactive for lessons (g6-ineq with controls, g6-histogram with data). All follow the light/dark theme,
   redraw on resize, fit at 360 px, and carry an aria-label (opts.label or a sensible default).

   g6-shape      Labeled figures for area and nets.
                 polys:  [{ pts: [[x, y], …], fill: "blue" | "green" | "gold" | "none" }]   (math units, y up)
                 labels: [{ a: [x, y], b: [x, y], text: "8 cm", side: 1 | -1 }]   a length written beside the segment a→b,
                         outside the figure (side forces the left (1) or right (-1) of a→b)
                 dashes: [{ a, b, text?, side? }]   dashed segments (heights, split lines), optionally labeled
                 right:  [[corner, toward1, toward2]]   right-angle marks
                 grid: false (unit squares behind), max: 320 (largest height in px)
   g6-plane      A coordinate plane. xmin, xmax, ymin, ymax (whole numbers); points: [{ x, y, label, color }];
                 poly: [[x, y], …] (a shaded polygon); segs: [[x1, y1, x2, y2], …]; line: [[x1, y1], [x2, y2]] (a ray from the
                 first point through the second); coords: false (write "(x, y)" beside each point); quads: false (name the
                 quadrants); xlabel, ylabel
   g6-line       A number line with lettered points and no values (for "what number is at A?"). min, max, step: 1 (labeled
                 ticks), sub: 0 (small parts between labeled ticks), points: [{ v: "-9/4", label: "A", color }],
                 values: false (also write each point's value), labels: true,
                 arcs: [{ from: 0, to: -5, label: "5 units", color }] (distance arcs above the line),
                 hops: [{ from: 0, by: 4, n: 9, color: "blue", below: false, label: "count by 4" }] (equal jumps, above or
                 below the line, e.g. to show common multiples); a point with ring: true is drawn as a ring
   g6-ineq       An inequality graphed on a number line: op "<" | ">" | "<=" | ">=", v (boundary, "7/2" is fine), min, max,
                 var: "x". controls: true adds sign buttons, a boundary stepper and a "test a number" slider with a readout
                 that says whether the test number is a solution; controls: false is a still picture with no text.
   g6-dots       A still dot plot. data, min, max, step: 1, label (what the numbers measure)
   g6-box        A still box plot. five: [min, q1, median, q3, max] or data (quartiles = medians of the lower and upper halves,
                 the middle value left out when the count is odd); min, max (axis); label; dots: false (show data as dots);
                 plots: [{ five | data, name }] to compare several on one scale
   g6-histogram  A histogram whose bars touch. Either start, width, counts: [3, 5, …] (bins start, start+width, …) or
                 data: [ … ], start, width, widths: [5, 10] (buttons to change the interval width; the readout lists the
                 intervals). label (the x-axis words), whole: true (intervals written 10–19; false writes 10 to 20)        */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;

  function boot() {
    var V = ML.viz; if (!V || boot.done) return; boot.done = true;
    css();
    // ------------------------------------------------------------ helpers
    function C() { var k = V.colors(); k.dark = D.documentElement.getAttribute('data-theme') === 'dark'; return k; }
    function soft(hex, a) { var v = parseInt(String(hex).slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
    function txt(ctx, s, x, y, o) {
      o = o || {}; ctx.save();
      ctx.font = (o.wt || 600) + ' ' + (o.size || 13) + 'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
      ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
      if (o.halo) { ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeStyle = o.halo; ctx.strokeText(s, x, y); }
      ctx.fillStyle = o.col; ctx.fillText(s, x, y); ctx.restore();
    }
    function tw(ctx, s, size, wt) { ctx.save(); ctx.font = (wt || 600) + ' ' + (size || 13) + 'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'; var w = ctx.measureText(s).width; ctx.restore(); return w; }
    function minus(s) { return String(s).replace(/-/g, '−'); }
    function num(v, d) { if (typeof v === 'number') return v; var s = String(v == null ? '' : v).trim(), m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s); if (m) { var r = +m[2] + m[3] / m[4]; return m[1] ? -r : r; } m = /^(-?\d+(?:\.\d+)?)\/(\d+)$/.exec(s); if (m) return m[1] / m[2]; var x = parseFloat(s); return isFinite(x) ? x : d; }
    function fmt(v) { var s = (M.round(v * 1000) / 1000).toString(); return minus(s); }
    function niceStep(range, px, minPx) { var raw = range / M.max(1, px / (minPx || 40)), cand = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]; for (var i = 0; i < cand.length; i++) if (cand[i] >= raw) return cand[i]; return 1000; }
    function setup(el, o, name, h, label) {
      el.classList.add('g6v', 'g6v-' + name); el.setAttribute('role', 'group');
      var al = el.getAttribute('aria-label'); if (!al || al === name) el.setAttribute('aria-label', o.label || label);
      var stage = V.el('div', 'g6v-stage'); el.appendChild(stage);
      var co = { height: h }, c = V.canvas(stage, co); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || label);
      return { el: el, c: c, co: co, ctx: c.ctx, height: function (hh) { hh = M.round(hh); if (co.height !== hh) { co.height = hh; c.fit(); } } };
    }
    function live(S, draw) { S.c.onResize(draw); V.onTheme(draw); draw(); }
    function dash(ctx, x1, y1, x2, y2, col, lw) { ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
    function line(ctx, x1, y1, x2, y2, col, lw) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
    function arrowHead(ctx, x, y, dir, col, s) { s = s || 9; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * s, y - s * 0.6); ctx.lineTo(x - dir * s, y + s * 0.6); ctx.closePath(); ctx.fill(); ctx.restore(); }

    // ------------------------------------------------------------ g6-shape
    V.register('g6-shape', function (el, o) {
      var S = setup(el, o, 'shape', 220, 'A labeled figure');
      var polys = (o.polys || []).map(function (p) { return { pts: (p.pts || []).map(function (q) { return [num(q[0], 0), num(q[1], 0)]; }), fill: p.fill || 'blue' }; });
      var all = []; polys.forEach(function (p) { all = all.concat(p.pts); }); (o.dashes || []).forEach(function (d) { all.push(d.a, d.b); });
      if (!all.length) all = [[0, 0], [1, 1]];
      var x0 = M.min.apply(null, all.map(function (p) { return p[0]; })), x1 = M.max.apply(null, all.map(function (p) { return p[0]; }));
      var y0 = M.min.apply(null, all.map(function (p) { return p[1]; })), y1 = M.max.apply(null, all.map(function (p) { return p[1]; }));
      var vs = []; polys.forEach(function (p) { vs = vs.concat(p.pts); }); if (!vs.length) vs = all;
      var cx = vs.reduce(function (t, p) { return t + p[0]; }, 0) / vs.length, cy = vs.reduce(function (t, p) { return t + p[1]; }, 0) / vs.length;
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, mx = M.min(70, M.max(46, w * 0.12)), my = 34, maxH = num(o.max, 320);
        var bw = M.max(1e-6, x1 - x0), bh = M.max(1e-6, y1 - y0), s = M.min((w - 2 * mx) / bw, (maxH - 2 * my) / bh);
        S.height(bh * s + 2 * my);
        var h = S.c.h, ox = (w - bw * s) / 2 - x0 * s, oy = h - my + y0 * s;
        function X(x) { return ox + x * s; } function Y(y) { return oy - y * s; }
        ctx.clearRect(0, 0, w, h);
        if (o.grid) { ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); for (var gx = M.ceil(x0); gx <= x1; gx++) { ctx.moveTo(X(gx), Y(y0)); ctx.lineTo(X(gx), Y(y1)); } for (var gy = M.ceil(y0); gy <= y1; gy++) { ctx.moveTo(X(x0), Y(gy)); ctx.lineTo(X(x1), Y(gy)); } ctx.stroke(); ctx.restore(); }
        polys.forEach(function (p) {
          ctx.save(); ctx.beginPath(); p.pts.forEach(function (q, i) { ctx[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1])); }); ctx.closePath();
          if (p.fill !== 'none') { ctx.fillStyle = soft(k[p.fill] || k.blue, k.dark ? 0.3 : 0.2); ctx.fill(); }
          ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
        });
        (o.right || []).forEach(function (r) {
          var c0 = r[0], a = r[1], b = r[2], ua = [a[0] - c0[0], a[1] - c0[1]], ub = [b[0] - c0[0], b[1] - c0[1]], la = M.hypot(ua[0], ua[1]) || 1, lb = M.hypot(ub[0], ub[1]) || 1, q = 11 / s;
          ua = [ua[0] / la * q, ua[1] / la * q]; ub = [ub[0] / lb * q, ub[1] / lb * q];
          ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(c0[0] + ua[0]), Y(c0[1] + ua[1])); ctx.lineTo(X(c0[0] + ua[0] + ub[0]), Y(c0[1] + ua[1] + ub[1])); ctx.lineTo(X(c0[0] + ub[0]), Y(c0[1] + ub[1])); ctx.stroke(); ctx.restore();
        });
        function label(a, b, text, side, col) {
          var dx = b[0] - a[0], dy = b[1] - a[1], L = M.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, mx2 = (a[0] + b[0]) / 2, my2 = (a[1] + b[1]) / 2;
          if (side === -1 || (!side && (mx2 - cx) * nx + (my2 - cy) * ny < 0)) { nx = -nx; ny = -ny; }
          var t = minus(text), wd = tw(ctx, t, 13, 700), off = 9 + M.abs(nx) * wd / 2 + M.abs(ny) * 8;
          txt(ctx, t, X(mx2) + nx * off, Y(my2) - ny * off, { wt: 700, col: col || k.ink, halo: k.bg });
        }
        (o.dashes || []).forEach(function (d) { dash(ctx, X(d.a[0]), Y(d.a[1]), X(d.b[0]), Y(d.b[1]), k.red, 2); if (d.text) label(d.a, d.b, d.text, d.side || 1, k.red); });
        (o.labels || []).forEach(function (L) { label(L.a, L.b, L.text, L.side); });
      }
      live(S, draw);
    });

    // ------------------------------------------------------------ g6-plane
    V.register('g6-plane', function (el, o) {
      var S = setup(el, o, 'plane', 300, 'A coordinate plane');
      var xa = M.floor(num(o.xmin, -10)), xb = M.ceil(num(o.xmax, 10)), ya = M.floor(num(o.ymin, -10)), yb = M.ceil(num(o.ymax, 10));
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, m = 26, xr = xb - xa, yr = yb - ya, maxH = M.min(460, M.max(260, w * 0.95));
        var sx = (w - 2 * m) / xr, sy = (maxH - 2 * m) / yr, eq = M.max(xr, yr) / M.min(xr, yr) <= 2.5;
        if (eq) { sx = sy = M.min(sx, sy); }
        S.height(yr * sy + 2 * m);
        var h = S.c.h, ox = (w - xr * sx) / 2 - xa * sx, oy = m + yb * sy;
        function X(x) { return ox + x * sx; } function Y(y) { return oy - y * sy; }
        ctx.clearRect(0, 0, w, h);
        var gxs = sx >= 9 ? 1 : 5, gys = sy >= 9 ? 1 : 5;
        ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
        for (var gx = M.ceil(xa / gxs) * gxs; gx <= xb; gx += gxs) { ctx.moveTo(M.round(X(gx)) + 0.5, Y(ya)); ctx.lineTo(M.round(X(gx)) + 0.5, Y(yb)); }
        for (var gy = M.ceil(ya / gys) * gys; gy <= yb; gy += gys) { ctx.moveTo(X(xa), M.round(Y(gy)) + 0.5); ctx.lineTo(X(xb), M.round(Y(gy)) + 0.5); }
        ctx.stroke(); ctx.restore();
        var axY = ya <= 0 && yb >= 0 ? Y(0) : Y(ya), axX = xa <= 0 && xb >= 0 ? X(0) : X(xa);
        line(ctx, X(xa) - 6, axY, X(xb) + 8, axY, k.axis, 1.6); line(ctx, axX, Y(ya) + 6, axX, Y(yb) - 8, k.axis, 1.6);
        arrowHead(ctx, X(xb) + 12, axY, 1, k.axis, 8);
        ctx.save(); ctx.translate(axX, Y(yb) - 12); ctx.rotate(-M.PI / 2); arrowHead(ctx, 0, 0, 1, k.axis, 8); ctx.restore();
        var lx = niceStep(xr, xr * sx, 26), ly = niceStep(yr, yr * sy, 22);
        for (var tx = M.ceil(xa / lx) * lx; tx <= xb; tx += lx) if (tx !== 0 || axX !== X(0)) txt(ctx, minus(tx), X(tx), axY + 12, { size: 11, wt: 500, col: k.muted, halo: k.bg });
        for (var ty = M.ceil(ya / ly) * ly; ty <= yb; ty += ly) if (ty !== 0 || axY !== Y(0)) txt(ctx, minus(ty), axX - 6, Y(ty), { size: 11, wt: 500, col: k.muted, al: 'right', halo: k.bg });
        if (axX === X(0) && axY === Y(0)) txt(ctx, '0', X(0) - 6, Y(0) + 11, { size: 11, wt: 500, col: k.muted, al: 'right' });
        txt(ctx, o.xlabel || 'x', X(xb) + 4, axY - 12, { size: 13, wt: 700, col: k.muted, al: 'right' });
        txt(ctx, o.ylabel || 'y', axX + 10, Y(yb) + 2, { size: 13, wt: 700, col: k.muted, al: 'left' });
        if (o.quads) [['I', 1, 1], ['II', -1, 1], ['III', -1, -1], ['IV', 1, -1]].forEach(function (q) { txt(ctx, q[0], X(q[1] * (q[1] > 0 ? xb : -xa) * 0.72), Y(q[2] * (q[2] > 0 ? yb : -ya) * 0.78), { size: 22, wt: 700, col: soft(k.green, 0.55) }); });
        if (o.poly && o.poly.length) { ctx.save(); ctx.beginPath(); o.poly.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); }); ctx.closePath(); ctx.fillStyle = soft(k.blue, k.dark ? 0.28 : 0.16); ctx.fill(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
        (o.segs || []).forEach(function (sg) { line(ctx, X(sg[0]), Y(sg[1]), X(sg[2]), Y(sg[3]), k.green, 3); });
        if (o.line) { var a = o.line[0], b = o.line[1], dx = b[0] - a[0], dy = b[1] - a[1], t = 1e9; if (dx > 0) t = M.min(t, (xb - a[0]) / dx); if (dx < 0) t = M.min(t, (xa - a[0]) / dx); if (dy > 0) t = M.min(t, (yb - a[1]) / dy); if (dy < 0) t = M.min(t, (ya - a[1]) / dy); if (t < 1e9) line(ctx, X(a[0]), Y(a[1]), X(a[0] + dx * t), Y(a[1] + dy * t), k.blue, 2.5); }
        (o.points || []).forEach(function (p) {
          var col = k[p.color] || k.red, px = X(num(p.x, 0)), py = Y(num(p.y, 0));
          ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 5.5, 0, 2 * M.PI); ctx.fill(); ctx.restore();
          var s = (p.label || '') + (o.coords ? ' (' + minus(p.x) + ', ' + minus(p.y) + ')' : '');
          if (s) { var right = px + tw(ctx, s, 14, 700) + 14 < w; txt(ctx, s, px + (right ? 9 : -9), py - 13, { size: 14, wt: 700, col: k.ink, al: right ? 'left' : 'right', halo: k.bg }); }
        });
      }
      live(S, draw);
    });

    // ------------------------------------------------------------ number lines
    function lineGeom(w, mn, mx) { var m = 22, s = (w - 2 * m) / (mx - mn); return { X: function (v) { return m + (v - mn) * s; }, s: s, m: m }; }
    function axisLine(ctx, k, G, w, y, mn, mx, step, sub, labels) {
      line(ctx, 6, y, w - 6, y, k.ink, 2); arrowHead(ctx, w - 2, y, 1, k.ink, 8); arrowHead(ctx, 2, y, -1, k.ink, 8);
      var minor = sub > 1 ? step / sub : 0;
      if (minor && G.s * minor >= 5) for (var v = mn; v <= mx + 1e-9; v += minor) line(ctx, G.X(v), y - 5, G.X(v), y + 5, k.muted, 1.2);
      var lstep = step; while (G.s * lstep < 22) lstep *= 2;
      for (var t = M.ceil(mn / step - 1e-9) * step; t <= mx + 1e-9; t += step) {
        var big = M.abs(M.round(t / lstep) * lstep - t) < 1e-9;
        line(ctx, G.X(t), y - 9, G.X(t), y + 9, k.ink, 2);
        if (labels !== false && big) txt(ctx, fmt(t), G.X(t), y + 22, { size: 13, wt: t === 0 ? 800 : 600, col: k.ink });
      }
    }
    V.register('g6-line', function (el, o) {
      var hops = (o.hops || []).map(function (h) { return { from: num(h.from, 0), by: num(h.by, 1), n: M.max(1, M.min(40, num(h.n, 1))), color: h.color, below: !!h.below, label: h.label }; });
      var up = (o.arcs && o.arcs.length) || hops.some(function (h) { return !h.below; }), down = hops.some(function (h) { return h.below; });
      var y0 = up ? 78 : 52, H = y0 + 40 + (down ? 58 : 0);
      var S = setup(el, o, 'line', H, 'A number line');
      var mn = num(o.min, -5), mx = num(o.max, 5), step = num(o.step, 1), sub = num(o.sub, 0);
      function arc(ctx, xa, xb, y, dir, col, lw) { var mid = (xa + xb) / 2, hh = M.min(30, M.abs(xb - xa) / 2); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 2.2; ctx.beginPath(); ctx.moveTo(xa, y); ctx.quadraticCurveTo(mid, y + dir * 2 * hh, xb, y); ctx.stroke(); ctx.restore(); return hh; }
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, G = lineGeom(w, mn, mx), y = y0; ctx.clearRect(0, 0, w, S.c.h);
        axisLine(ctx, k, G, w, y, mn, mx, step, sub, o.labels);
        var cols = ['red', 'blue', 'purple', 'orange', 'teal', 'green'];
        (o.arcs || []).forEach(function (a) {
          var xa = G.X(num(a.from, 0)), xb = G.X(num(a.to, 0)), col = k[a.color] || k.purple, hh = arc(ctx, xa, xb, y - 4, -1, col);
          if (a.label) txt(ctx, a.label, (xa + xb) / 2, y - 10 - hh, { size: 12, wt: 700, col: col, halo: k.bg });
        });
        hops.forEach(function (h, hi) {
          var col = k[h.color] || k[['blue', 'orange', 'purple'][hi % 3]], dir = h.below ? 1 : -1, yy = h.below ? y + 32 : y - 4;
          for (var i = 0; i < h.n; i++) { var a = h.from + i * h.by, b = a + h.by; if (b > mx + 1e-9 || b < mn - 1e-9) break; arc(ctx, G.X(a), G.X(b), yy, dir, col, 2); ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(G.X(b), yy, 3.5, 0, 2 * M.PI); ctx.fill(); ctx.restore(); }
          if (h.label) txt(ctx, h.label, 8, h.below ? y + 78 : y - 50, { size: 12, wt: 700, col: col, al: 'left', halo: k.bg });
        });
        (o.points || []).forEach(function (p, i) {
          var v = num(p.v, 0), px = G.X(v), col = k[p.color] || k[cols[i % cols.length]];
          ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, y, p.ring ? 9 : 7, 0, 2 * M.PI); if (p.ring) { ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); } else ctx.fill(); ctx.restore();
          var s = (p.label || '') + (o.values ? (p.label ? ' = ' : '') + minus(p.show || p.v) : '');
          if (s) txt(ctx, s, px, y - 22, { size: 15, wt: 800, col: col, halo: k.bg });
        });
      }
      live(S, draw);
    });

    V.register('g6-ineq', function (el, o) {
      var still = o.controls === false, ops = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
      var S = setup(el, o, 'ineq', 92, 'An inequality on a number line');
      var st = { op: ops[o.op] ? o.op : '>', v: num(o.v, 3), t: o.test == null ? null : num(o.test, 0) }, mn = num(o.min, M.floor(st.v) - 5), mx = num(o.max, mn + 10), vr = o['var'] || 'x';
      var ro, seg, slT;
      if (!still) {
        ro = V.el('p', 'ml-readout g6v-ro'); ro.setAttribute('aria-live', 'polite'); el.appendChild(ro);
        var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
        seg = V.seg(ctl, { label: 'Inequality sign', items: [['<', vr + ' <'], ['<=', vr + ' ≤'], ['>', vr + ' >'], ['>=', vr + ' ≥']], value: st.op, change: function (v) { st.op = v; draw(); } });
        var stp = V.el('div', 'g6v-step'); ctl.appendChild(stp);
        stp.appendChild(V.el('span', 'g6v-step-lab', 'Boundary'));
        var bm = V.button(stp, '−', function () { st.v = M.max(mn + 1, st.v - 0.5); draw(); }); bm.setAttribute('aria-label', 'Move the boundary left');
        var bv = V.el('span', 'g6v-step-val'); stp.appendChild(bv);
        var bp = V.button(stp, '+', function () { st.v = M.min(mx - 1, st.v + 0.5); draw(); }); bp.setAttribute('aria-label', 'Move the boundary right');
        slT = V.slider(ctl, { label: 'Test a number', min: mn, max: mx, step: 0.5, value: st.t == null ? M.min(mx, st.v + 2) : st.t, fmt: fmt, input: function (v) { st.t = v; draw(); } });
        if (st.t == null) st.t = slT.get();
        S.el.__bv = bv;
      }
      function holds(t) { return st.op === '<' ? t < st.v : st.op === '>' ? t > st.v : st.op === '<=' ? t <= st.v : t >= st.v; }
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, G = lineGeom(w, mn, mx), y = 52, col = k.blue; ctx.clearRect(0, 0, w, S.c.h);
        axisLine(ctx, k, G, w, y, mn, mx, 1, 0, true);
        var right = st.op === '>' || st.op === '>=', bx = G.X(st.v), ex = right ? w - 4 : 4;
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(ex - (right ? 10 : -10), y); ctx.stroke(); ctx.restore();
        arrowHead(ctx, ex, y, right ? 1 : -1, col, 13);
        var closed = st.op === '<=' || st.op === '>=';
        ctx.save(); ctx.beginPath(); ctx.arc(bx, y, 8, 0, 2 * M.PI); ctx.fillStyle = closed ? col : k.bg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
        if (!still && st.t != null) {
          var tx = G.X(st.t), ok = holds(st.t), tc = ok ? k.green : k.red;
          ctx.save(); ctx.fillStyle = tc; ctx.beginPath(); ctx.moveTo(tx, y - 12); ctx.lineTo(tx - 8, y - 26); ctx.lineTo(tx + 8, y - 26); ctx.closePath(); ctx.fill(); ctx.restore();
          var sym = ops[st.op], vt = fmt(st.v), tt = fmt(st.t);
          ro.innerHTML = '<b>' + vr + ' ' + sym + ' ' + vt + '</b>: ' + (right ? 'numbers greater than ' : 'numbers less than ') + vt + (closed ? ', and ' + vt + ' itself (closed circle).' : '; ' + vt + ' itself is not included (open circle).') +
            '<br>Test ' + tt + ': is ' + tt + ' ' + sym + ' ' + vt + '? <b>' + (ok ? 'Yes' : 'No') + '</b>, so ' + tt + (ok ? ' is a solution.' : ' is not a solution.');
          if (seg) seg.set(st.op); if (S.el.__bv) S.el.__bv.textContent = vt;
        }
      }
      if (!still) {
        V.drag(S.c.cv, { hit: function (px, py) { return py > 10 ? 1 : null; }, start: function (h, px) { move(px); }, move: function (h, px) { move(px); } });
        S.c.cv.style.touchAction = 'pan-y';
      }
      function move(px) { var G = lineGeom(S.c.w, mn, mx), v = mn + (px - G.m) / G.s; st.t = M.max(mn, M.min(mx, M.round(v * 2) / 2)); if (slT) slT.set(st.t); draw(); }
      live(S, draw);
    });

    // ------------------------------------------------------------ data pictures
    V.register('g6-dots', function (el, o) {
      var data = (o.data || []).map(function (x) { return num(x, 0); }), step = num(o.step, 1);
      var mn = num(o.min, M.min.apply(null, data.concat([0]))), mx = num(o.max, M.max.apply(null, data.concat([mn + 5])));
      var S = setup(el, o, 'dots', 160, 'A dot plot' + (o.label ? ' of ' + String(o.label).toLowerCase() : ''));
      var counts = {}; data.forEach(function (x) { var key = M.round(x / step); counts[key] = (counts[key] || 0) + 1; });
      var most = M.max.apply(null, Object.keys(counts).map(function (key) { return counts[key]; }).concat([1]));
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, G = lineGeom(w, mn - step / 2, mx + step / 2), r = M.max(4, M.min(9, G.s * step * 0.36)), gap = 2 * r + 3;
        S.height(most * gap + 34 + (o.label ? 22 : 4)); var h = S.c.h, y = h - 30 - (o.label ? 20 : 0); ctx.clearRect(0, 0, w, h);
        line(ctx, G.X(mn - step / 2), y, G.X(mx + step / 2), y, k.ink, 2);
        var ls = step; while (G.s * ls < 24) ls *= 2;
        for (var t = mn; t <= mx + 1e-9; t += step) { line(ctx, G.X(t), y, G.X(t), y + 6, k.ink, 1.5); if (M.abs(M.round((t - mn) / ls) * ls - (t - mn)) < 1e-9) txt(ctx, fmt(t), G.X(t), y + 17, { size: 12, wt: 600, col: k.ink }); }
        Object.keys(counts).forEach(function (key) { var v = key * step; for (var i = 0; i < counts[key]; i++) { ctx.save(); ctx.fillStyle = k.blue; ctx.beginPath(); ctx.arc(G.X(v), y - r - 3 - i * gap, r, 0, 2 * M.PI); ctx.fill(); ctx.restore(); } });
        if (o.label) txt(ctx, o.label, w / 2, h - 10, { size: 13, wt: 600, col: k.muted });
      }
      live(S, draw);
    });

    function median(a) { var n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; }
    function fiveOf(p) { if (p.five) return p.five.map(function (x) { return num(x, 0); }); var s = (p.data || []).map(function (x) { return num(x, 0); }).sort(function (a, b) { return a - b; }), n = s.length, h = M.floor(n / 2); return [s[0], median(s.slice(0, h)), median(s), median(s.slice(n % 2 ? h + 1 : h)), s[n - 1]]; }
    V.register('g6-box', function (el, o) {
      var plots = (o.plots || [{ five: o.five, data: o.data, name: o.name }]).map(function (p) { return { f: fiveOf(p), name: p.name || '', data: (p.data || []).map(function (x) { return num(x, 0); }) }; });
      var lo = num(o.min, M.floor(M.min.apply(null, plots.map(function (p) { return p.f[0]; })))), hi = num(o.max, M.ceil(M.max.apply(null, plots.map(function (p) { return p.f[4]; }))));
      var S = setup(el, o, 'box', 120, 'A box plot' + (o.label ? ' of ' + String(o.label).toLowerCase() : ''));
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, named = plots.some(function (p) { return p.name; }), left = named ? 56 : 0, G = lineGeom(w - left, lo, hi), X = function (v) { return left + G.X(v); };
        var rowH = o.dots ? 76 : 52; S.height(plots.length * rowH + 40 + (o.label ? 20 : 0)); var h = S.c.h; ctx.clearRect(0, 0, w, h);
        plots.forEach(function (p, i) {
          var cy = 14 + i * rowH + 20, f = p.f, bh = 30;
          if (p.name) txt(ctx, p.name, left - 8, cy, { size: 13, wt: 700, col: k.muted, al: 'right' });
          line(ctx, X(f[0]), cy, X(f[1]), cy, k.ink, 2); line(ctx, X(f[3]), cy, X(f[4]), cy, k.ink, 2);
          line(ctx, X(f[0]), cy - 9, X(f[0]), cy + 9, k.ink, 2); line(ctx, X(f[4]), cy - 9, X(f[4]), cy + 9, k.ink, 2);
          ctx.save(); ctx.fillStyle = soft(k.green, k.dark ? 0.32 : 0.2); ctx.fillRect(X(f[1]), cy - bh / 2, X(f[3]) - X(f[1]), bh); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.strokeRect(X(f[1]), cy - bh / 2, X(f[3]) - X(f[1]), bh); ctx.restore();
          line(ctx, X(f[2]), cy - bh / 2, X(f[2]), cy + bh / 2, k.red, 3);
          if (o.dots && p.data.length) { var seen = {}; p.data.forEach(function (v) { var n = seen[v] = (seen[v] || 0) + 1; ctx.save(); ctx.fillStyle = k.blue; ctx.beginPath(); ctx.arc(X(v), cy + 26 + (n - 1) * 0, 4, 0, 2 * M.PI); ctx.globalAlpha = n > 1 ? 0.6 : 1; ctx.fill(); ctx.restore(); }); }
        });
        var ay = h - 26 - (o.label ? 20 : 0), st = niceStep(hi - lo, w - left, 34);
        line(ctx, X(lo), ay, X(hi), ay, k.ink, 1.6);
        for (var t = M.ceil(lo / st) * st; t <= hi + 1e-9; t += st) { line(ctx, X(t), ay, X(t), ay + 6, k.ink, 1.5); txt(ctx, fmt(t), X(t), ay + 16, { size: 12, wt: 600, col: k.ink }); }
        if (st > 1) for (var t2 = M.ceil(lo); t2 <= hi; t2++) if (t2 % st) line(ctx, X(t2), ay, X(t2), ay + (t2 % 5 ? 3 : 6), t2 % 5 ? k.muted : k.ink, t2 % 5 ? 1 : 1.5);
        if (o.label) txt(ctx, o.label, left + (w - left) / 2, h - 9, { size: 13, wt: 600, col: k.muted });
      }
      live(S, draw);
    });

    V.register('g6-histogram', function (el, o) {
      var data = o.data ? o.data.map(function (x) { return num(x, 0); }) : null, st = { w: num(o.width, 10), start: num(o.start, 0) }, whole = o.whole !== false;
      var S = setup(el, o, 'hist', 230, 'A histogram' + (o.label ? ' of ' + String(o.label).toLowerCase() : ''));
      var ro = null;
      if (data && o.controls !== false) {
        ro = V.el('p', 'ml-readout g6v-ro'); ro.setAttribute('aria-live', 'polite'); el.appendChild(ro);
        var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
        V.seg(ctl, { label: 'Interval width', items: (o.widths || [5, 10, 20]).map(function (x) { return [String(x), 'Width ' + x]; }), value: String(st.w), change: function (v) { st.w = +v; draw(); } });
      }
      function bins() {
        if (!data) return (o.counts || []).map(function (c, i) { return { lo: st.start + i * st.w, n: num(c, 0) }; });
        var mx = M.max.apply(null, data), out = []; for (var lo = st.start; lo <= mx; lo += st.w) out.push({ lo: lo, n: data.filter(function (x) { return x >= lo && x < lo + st.w; }).length }); return out;
      }
      function name(b) { return whole ? fmt(b.lo) + '–' + fmt(b.lo + st.w - 1) : fmt(b.lo) + ' to ' + fmt(b.lo + st.w); }
      function draw() {
        var k = C(), w = S.c.w, ctx = S.ctx, B = bins(), top = M.max.apply(null, B.map(function (b) { return b.n; }).concat([1])), left = 34, right = 10, base;
        var bw = (w - left - right) / M.max(1, B.length), small = bw < 46;
        S.height(230 + (small ? 18 : 0) + (o.label ? 18 : 0)); var h = S.c.h; base = h - 30 - (small ? 18 : 0) - (o.label ? 18 : 0); ctx.clearRect(0, 0, w, h);
        var ys = top <= 10 ? 1 : top <= 20 ? 2 : 5, hu = (base - 22) / (M.ceil(top / ys) * ys);
        for (var t = 0; t <= top + 1e-9; t += ys) { line(ctx, left, base - t * hu, w - right, base - t * hu, t ? k.grid : k.ink, t ? 1 : 2); txt(ctx, String(t), left - 6, base - t * hu, { size: 11, wt: 500, col: k.muted, al: 'right' }); }
        B.forEach(function (b, i) {
          var x = left + i * bw, bh = b.n * hu;
          ctx.save(); ctx.fillStyle = soft(k.blue, k.dark ? 0.55 : 0.4); ctx.fillRect(x, base - bh, bw, bh); ctx.strokeStyle = k.blue; ctx.lineWidth = 2; ctx.strokeRect(x, base - bh, bw, bh); ctx.restore();
          if (b.n) txt(ctx, String(b.n), x + bw / 2, base - bh - 10, { size: 12, wt: 700, col: k.ink });
          var nm = name(b); txt(ctx, nm, x + bw / 2, base + 14 + (small && i % 2 ? 16 : 0), { size: small ? 11 : 12, wt: 600, col: k.ink });
        });
        if (o.label) txt(ctx, o.label, left + (w - left - right) / 2, h - 9, { size: 13, wt: 600, col: k.muted });
        if (ro) ro.innerHTML = 'Intervals of ' + st.w + ': ' + B.map(function (b) { return name(b) + ' (' + b.n + ')'; }).join(', ') + '. Every interval has the same width, and the bars touch because the intervals meet with no gaps.';
      }
      live(S, draw);
    });
  }
  function css() {
    if (D.getElementById('g6v-css')) return;
    var s = D.createElement('style'); s.id = 'g6v-css';
    s.textContent = '.g6v .g6v-stage{position:relative;max-width:100%}' +
      '.g6v .g6v-ro{margin:.55rem .1rem 0;font-size:.95rem;line-height:1.55;overflow-wrap:anywhere}' +
      '.g6v .g6v-step{display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .25rem .15rem .65rem;border:1px solid var(--mv-line);border-radius:999px;background:var(--mv-card)}' +
      '.g6v .g6v-step-lab{font-size:.85rem;color:var(--mv-muted)}.g6v .g6v-step-val{min-width:2.2em;text-align:center;font-weight:700;font-variant-numeric:tabular-nums}' +
      '.g6v .g6v-step .ml-btn{min-width:36px;min-height:36px;padding:0;font-size:1.1rem;line-height:1;border-radius:50%}' +
      '.g6v-ineq .ml-seg button{min-width:52px}';
    D.head.appendChild(s);
  }
  if (ML.viz) boot(); else D.addEventListener('DOMContentLoaded', boot);
})(window, document);
