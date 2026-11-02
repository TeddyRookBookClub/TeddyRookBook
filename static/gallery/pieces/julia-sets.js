/* Math Gallery: Julia sets, linked to the Mandelbrot set. Left: a map of the Mandelbrot set with a handle for c (drag it,
   or use the arrow keys). Right: the filled Julia set for that c. Play sends c on a slow loop around the main cardioid. */
Gallery.piece('julia-sets', function (g) {
  var split = g.el('div', 'gx-split'); g.stage.appendChild(split);
  var pa = g.el('div'), pb = g.el('div'); split.appendChild(pa); split.appendChild(pb);
  var m = g.canvas({ parent: pa, aspect: 0.8, max: 420, hd: false, label: 'Map of the Mandelbrot set with a movable point c. Arrow keys move it.' });
  var j = g.canvas({ parent: pb, aspect: 0.8, max: 420, hd: false, label: 'The Julia set for the chosen c' });
  pa.appendChild(g.el('span', 'gx-cap', 'Pick c on the Mandelbrot set')); pb.appendChild(g.el('span', 'gx-cap', 'Its Julia set'));
  var C = [-0.123, 0.745], MV = { x: -0.6, y: 0, w: 3.2 }, JV = { x: 0, y: 0, w: 3.4 }, mapImg = null, job = 0, ang = 0;
  var m0 = /c=(-?[\d.]+),(-?[\d.]+)/.exec(location.hash); if (m0) C = [clamp(+m0[1], -2.2, 1), clamp(+m0[2], -1.4, 1.4)];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function inM(cr, ci, n) { var zr = 0, zi = 0, k = 0, t; for (; k < n; k++) { t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; if (zr * zr + zi * zi > 4) return false; } return true; }

  function drawMap() {
    var W = m.w, H = m.h, col = g.colors(), x = m.ctx;
    if (!mapImg || mapImg.width !== W || mapImg.height !== H || mapImg.dark !== col.dark) {
      var im = x.createImageData(W, H), D = im.data, sc = MV.w / W, bg = hex(col.bg), ins = hex(col.dark ? '#3e9d70' : '#00562f'), edge = hex(col.dark ? '#e2c072' : '#b8963e');
      for (var py = 0, o = 0; py < H; py++) for (var px = 0; px < W; px++, o += 4) {
        var cr = MV.x + (px - W / 2) * sc, ci = MV.y - (py - H / 2) * sc, zr = 0, zi = 0, n = 0, t;
        for (; n < 60; n++) { t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; if (zr * zr + zi * zi > 4) break; }
        var c3 = n >= 60 ? ins : mix(bg, edge, Math.pow(n / 60, 0.6));
        D[o] = c3[0]; D[o + 1] = c3[1]; D[o + 2] = c3[2]; D[o + 3] = 255;
      }
      mapImg = im; mapImg.dark = col.dark;
    }
    x.putImageData(mapImg, 0, 0);
    var p = toPx(C), r = 7;
    x.lineWidth = 2.5; x.strokeStyle = col.dark ? '#ffffff' : '#000000'; x.fillStyle = col.red;
    x.beginPath(); x.arc(p[0], p[1], r, 0, 7); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(p[0] - 14, p[1]); x.lineTo(p[0] - r - 2, p[1]); x.moveTo(p[0] + r + 2, p[1]); x.lineTo(p[0] + 14, p[1]); x.stroke();
  }
  function toPx(c) { var sc = m.w / MV.w; return [m.w / 2 + (c[0] - MV.x) * sc, m.h / 2 - (c[1] - MV.y) * sc]; }
  function fromPx(px, py) { var sc = MV.w / m.w; return [clamp(MV.x + (px - m.w / 2) * sc, -2.2, 1), clamp(MV.y - (py - m.h / 2) * sc, -1.4, 1.4)]; }

  // Julia set: rendered in strips; while c is moving, a quick half-resolution pass first
  function drawJulia(fast) {
    var my = ++job, W = j.w, H = j.h, col = g.colors(), x = j.ctx, step = fast ? 2 : 1, maxIt = fast ? 80 : 300;
    var w2 = Math.ceil(W / step), h2 = Math.ceil(H / step), im = x.createImageData(w2, h2), D = im.data, sc = JV.w / W * step;
    var bg = hex(col.bg), a1 = hex(col.dark ? '#2f8f63' : '#00562f'), a2 = hex(col.dark ? '#e2c072' : '#b8963e'), ins = hex(col.dark ? '#0b120e' : '#14261c');
    var cr = C[0], ci = C[1], row = 0;
    var tmp = drawJulia.cv || (drawJulia.cv = document.createElement('canvas'));
    function chunk() {
      if (my !== job) return;
      var t0 = performance.now();
      while (row < h2 && (fast || performance.now() - t0 < 14)) {
        for (var px = 0, o = row * w2 * 4; px < w2; px++, o += 4) {
          var zr = JV.x + (px - w2 / 2) * sc, zi = JV.y - (row - h2 / 2) * sc, n = 0, t, c3;
          for (; n < maxIt; n++) { t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; if (zr * zr + zi * zi > 16) break; }
          if (n >= maxIt) c3 = ins; else { var s = Math.pow(n / 40, 0.7); c3 = s < 1 ? mix(bg, a1, s) : mix(a1, a2, Math.min(1, s - 1)); }
          D[o] = c3[0]; D[o + 1] = c3[1]; D[o + 2] = c3[2]; D[o + 3] = 255;
        }
        row++;
      }
      tmp.width = w2; tmp.height = h2; tmp.getContext('2d').putImageData(im, 0, 0);
      x.imageSmoothingEnabled = step > 1; x.drawImage(tmp, 0, 0, w2, row, 0, 0, w2 * step, row * step);
      if (row < h2) requestAnimationFrame(chunk);
    }
    chunk();
  }
  function info() {
    var inside = inM(C[0], C[1], 500), z = C[0].toFixed(3) + (C[1] < 0 ? ' − ' : ' + ') + Math.abs(C[1]).toFixed(3) + 'i';
    st.innerHTML = 'c = <b>' + z + '</b> · ' + (inside ? '<b>in</b> the Mandelbrot set: the Julia set is one piece' : '<b>outside</b> the Mandelbrot set: the Julia set is dust');
    return 'c = ' + z + (inside ? ', inside the Mandelbrot set.' : ', outside the Mandelbrot set.');
  }
  var st = g.out(), qt = 0;
  function update(fast) { drawMap(); info(); drawJulia(fast); if (fast) { clearTimeout(qt); qt = setTimeout(function () { if (!L.playing()) drawJulia(false); }, 180); } }

  g.drag(m.el, { down: function (x, y) { C = fromPx(x, y); L.pause(); update(true); }, move: function (x, y) { C = fromPx(x, y); update(true); }, up: function () { g.say(info()); } });
  function nudge(dx, dy) { L.pause(); C = [clamp(C[0] + dx, -2.2, 1), clamp(C[1] + dy, -1.4, 1.4)]; update(true); g.say(info()); }
  g.keys(m.el, { ArrowLeft: function (e) { nudge(e.shiftKey ? -0.05 : -0.005, 0); }, ArrowRight: function (e) { nudge(e.shiftKey ? 0.05 : 0.005, 0); },
    ArrowUp: function (e) { nudge(0, e.shiftKey ? 0.05 : 0.005); }, ArrowDown: function (e) { nudge(0, e.shiftKey ? -0.05 : -0.005); } });

  // Play: c rides just inside the edge of the main cardioid, c = e^{it}/2 − e^{2it}/4, pulled in a little
  var L = g.loop(function (dt) {
    ang += dt * 0.25; var k = 0.97, cr = Math.cos(ang) / 2 - Math.cos(2 * ang) / 4, ci = Math.sin(ang) / 2 - Math.sin(2 * ang) / 4;
    C = [cr * k, ci * k]; update(true);
  }, { auto: false, stepSize: 0.25 });
  var PRE = [['rabbit', 'Douady’s rabbit', -0.123, 0.745], ['dendrite', 'A branching tree (c = i)', 0, 1], ['basilica', 'The basilica (c = −1)', -1, 0],
    ['siegel', 'A spinning disk', -0.391, -0.587], ['spiral', 'Spirals near the edge', -0.7454, 0.1130], ['dust', 'Dust (outside)', 0.36, 0.1], ['circle', 'A circle (c = 0)', 0, 0]];
  g.select({ label: 'Try', options: PRE.map(function (p) { return [p[0], p[1]]; }), value: 'rabbit', change: function (v) { PRE.forEach(function (p) { if (p[0] === v) C = [p[2], p[3]]; }); L.pause(); update(false); g.say(info()); } });
  g.bar.appendChild(g.el('p', 'gx-hint', 'Drag the red point on the Mandelbrot map, or focus the map and use the arrow keys (Shift for bigger steps).'));
  g.draw(function () { mapImg = null; update(false); });
});
