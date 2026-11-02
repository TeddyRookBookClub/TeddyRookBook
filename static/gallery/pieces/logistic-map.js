/* Math Gallery: the logistic map x -> r x (1 - x). Left: the cobweb diagram for the chosen r (the path of x bouncing
   between the curve and the line y = x). Right: the bifurcation diagram (where x ends up, for every r), computed in
   strips across frames. Click or drag on the diagram, or use the slider, to choose r. Play sweeps r slowly upward. */
Gallery.piece('logistic-map', function (g) {
  var split = g.el('div', 'gx-split'); g.stage.appendChild(split);
  var pa = g.el('div'), pb = g.el('div'); split.appendChild(pa); split.appendChild(pb);
  var a = g.canvas({ parent: pa, aspect: 0.9, max: 400, label: 'Cobweb diagram for the chosen r' });
  var b = g.canvas({ parent: pb, aspect: 0.9, max: 400, hd: false, label: 'Bifurcation diagram: long-run values of x for each r. Click to choose r.' });
  pa.appendChild(g.el('span', 'gx-cap', 'Cobweb for one r')); pb.appendChild(g.el('span', 'gx-cap', 'Where x ends up, for every r'));
  var r = 3.2, x0 = 0.2, RG = [2.5, 4], job = 0, bif = null;
  var RANGES = [['all', 'r from 2.5 to 4', 2.5, 4], ['top', 'r from 3.4 to 4', 3.4, 4], ['win', 'the window near 3.83', 3.82, 3.86], ['one', 'r from 1 to 4', 1, 4]];

  function longRun(rr) { var x = 0.5, i, s = []; for (i = 0; i < 600; i++) x = rr * x * (1 - x); for (i = 0; i < 128; i++) { x = rr * x * (1 - x); s.push(x); } return s; }
  function period(rr) { var s = longRun(rr); for (var p = 1; p <= 64; p++) { var ok = true; for (var i = 0; i < 32; i++) if (Math.abs(s[i] - s[i + p]) > 1e-6) { ok = false; break; } if (ok) return p; } return 0; }

  function buildBif() {
    var my = ++job, W = b.w, H = b.h, col = g.colors(), ctx = b.ctx, cx = 0, top = 6, bot = H - 22;
    var im = ctx.createImageData(W, H), D = im.data, bg = hx(col.bg), ink = hx(col.dark ? '#cfe9da' : '#123d27');
    for (var i = 0; i < D.length; i += 4) { D[i] = bg[0]; D[i + 1] = bg[1]; D[i + 2] = bg[2]; D[i + 3] = 255; }
    bif = { im: im, done: false };
    function chunk() {
      if (my !== job) return;
      var t0 = performance.now();
      while (cx < W && performance.now() - t0 < 12) {
        for (var sub = 0; sub < 3; sub++) {
          var rr = RG[0] + (cx + sub / 3) / W * (RG[1] - RG[0]), x = 0.5, k;
          for (k = 0; k < 400; k++) x = rr * x * (1 - x);
          for (k = 0; k < 250; k++) {
            x = rr * x * (1 - x); var py = Math.round(bot - x * (bot - top)), o = (py * W + cx) * 4;
            if (py >= 0 && py < H) { D[o] += (ink[0] - D[o]) * 0.35; D[o + 1] += (ink[1] - D[o + 1]) * 0.35; D[o + 2] += (ink[2] - D[o + 2]) * 0.35; }
          }
        }
        cx++;
      }
      paintB();
      if (cx < W) requestAnimationFrame(chunk); else bif.done = true;
    }
    chunk();
  }
  function hx(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function paintB() {
    if (!bif) return;
    var x = b.ctx, col = g.colors(), W = b.w, H = b.h, bot = H - 22;
    x.putImageData(bif.im, 0, 0);
    x.fillStyle = col.bg; x.fillRect(0, bot + 2, W, H - bot);
    var px = (r - RG[0]) / (RG[1] - RG[0]) * W;
    if (px >= 0 && px <= W) { x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, bot); x.stroke(); }
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textBaseline = 'alphabetic';
    x.textAlign = 'left'; x.fillText('r = ' + RG[0], 4, H - 6); x.textAlign = 'right'; x.fillText(String(RG[1]), W - 4, H - 6);
    x.textAlign = 'center'; if (px > 40 && px < W - 40) { x.fillStyle = col.red; x.fillText(r.toFixed(3), px, H - 6); }
    x.textAlign = 'left';
  }
  function paintA(col) {
    var x = a.ctx, W = a.w, H = a.h, m = 26, s = Math.min(W, H) - m - 8, ox = (W - s) / 2 + 8, oy = H - m + 4;
    function X(v) { return ox + v * s; } function Y(v) { return oy - v * s; }
    a.clear(col.bg);
    x.strokeStyle = col.grid; x.lineWidth = 1; x.strokeRect(X(0), Y(1), s, s);
    x.strokeStyle = col.muted; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X(0), Y(0)); x.lineTo(X(1), Y(1)); x.stroke(); x.setLineDash([]);
    x.strokeStyle = col.accent; x.lineWidth = 2.5; x.beginPath();
    for (var i = 0; i <= 100; i++) { var u = i / 100, v = r * u * (1 - u); if (i) x.lineTo(X(u), Y(v)); else x.moveTo(X(u), Y(v)); } x.stroke();
    var z = x0; x.strokeStyle = col.a(col.orange, 0.85); x.lineWidth = 1.3; x.beginPath(); x.moveTo(X(z), Y(0));
    for (i = 0; i < 120; i++) { var nz = r * z * (1 - z); x.lineTo(X(z), Y(nz)); x.lineTo(X(nz), Y(nz)); z = nz; } x.stroke();
    x.fillStyle = col.orange; x.beginPath(); x.arc(X(x0), Y(0), 4, 0, 7); x.fill();
    x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'center';
    x.fillText('x', X(0.5), oy + 16); x.fillText('0', X(0), oy + 16); x.fillText('1', X(1), oy + 16); x.textAlign = 'left';
  }
  var st = g.out();
  function info() {
    var p = period(r), s = r < 1 ? 'x dies out to 0' : p === 1 ? 'x settles on one value, ' + longRun(r)[0].toFixed(4) : p ? 'x settles into a cycle of ' + p + ' values' : 'no cycle found: chaos';
    st.innerHTML = 'r = <b>' + r.toFixed(3) + '</b> · ' + s; return 'r is ' + r.toFixed(3) + ': ' + s + '.';
  }
  function setR(v, say) { r = Math.max(RG[0], Math.min(RG[1], v)); sl.set(r); paintA(g.colors()); paintB(); var t = info(); if (say) g.say(t); }
  g.drag(b.el, { down: function (x) { L.pause(); setR(RG[0] + x / b.w * (RG[1] - RG[0])); }, move: function (x) { setR(RG[0] + x / b.w * (RG[1] - RG[0])); }, up: function () { g.say(info()); } });
  var L = g.loop(function (dt) { var nr = r + dt * (RG[1] - RG[0]) / 40; if (nr >= RG[1]) { setR(RG[1]); return false; } setR(nr); }, { auto: false, stepSize: 0.25 });
  var sl = g.slider({ label: 'r', min: 1, max: 4, step: 0.001, value: r, fmt: function (v) { return v.toFixed(3); }, input: function (v) { if (v < RG[0] || v > RG[1]) { RG = [1, 4]; rs.value = 'one'; buildBif(); } setR(v, true); } });
  var rs = g.select({ label: 'Show', options: RANGES.map(function (q) { return [q[0], q[1]]; }), value: 'all', change: function (v) {
    RANGES.forEach(function (q) { if (q[0] === v) RG = [q[2], q[3]]; }); if (r < RG[0] || r > RG[1]) r = (RG[0] + RG[1]) / 2; if (v === 'win') r = 3.835; buildBif(); setR(r, true); } });
  g.slider({ label: 'Start x₀', min: 0.01, max: 0.99, step: 0.01, value: x0, fmt: function (v) { return v.toFixed(2); }, input: function (v) { x0 = v; paintA(g.colors()); } });
  g.draw(function (col) { paintA(col); buildBif(); info(); });
});
