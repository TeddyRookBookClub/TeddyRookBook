/* Math Gallery: the Mandelbrot set. Drag to pan, wheel or buttons to zoom, tap to zoom in at a point, arrow keys and
   + / - on the picture. The picture is computed in strips across several frames so the page never freezes. */
Gallery.piece('mandelbrot', function (g) {
  var c = g.canvas({ aspect: 0.68, max: 540, min: 280, hd: false, label: 'The Mandelbrot set. Drag to move, use the zoom buttons or keys to zoom.' });
  var V = { x: -0.6, y: 0, w: 3.4 }, maxIt = 200, job = 0, img = null, drawn = null;
  var PRE = [['home', 'The whole set', -0.6, 0, 3.4], ['sea', 'Seahorse valley', -0.7453, 0.1127, 0.012], ['ele', 'Elephant valley', 0.2925, 0.0149, 0.025],
    ['mini', 'A tiny copy', -1.7686, 0.0017, 0.04], ['spiral', 'A double spiral', -0.761574, -0.0847596, 0.0006]];
  var stat = g.out(), hint = g.el('p', 'gx-hint', 'Drag to move. Tap or click to zoom in there. Keys on the picture: arrows move, + and − zoom.');

  function pal(col) {
    // our own palette: background → green → gold → light, repeating gently with distance
    var a = hex(col.bg), b = hex(col.dark ? '#2f8f63' : '#00562f'), d = hex(col.dark ? '#e2c072' : '#b8963e'), e = hex(col.dark ? '#f4f1e6' : '#fff7dc');
    var P = new Uint8Array(256 * 3);
    for (var i = 0; i < 256; i++) {
      var t = i / 255, s, p, q;
      if (t < 0.4) { s = t / 0.4; p = a; q = b; } else if (t < 0.75) { s = (t - 0.4) / 0.35; p = b; q = d; } else { s = (t - 0.75) / 0.25; p = d; q = e; }
      for (var k = 0; k < 3; k++) P[i * 3 + k] = p[k] + (q[k] - p[k]) * s;
    }
    return P;
  }
  function hex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }

  function render() {
    var my = ++job, W = c.w, H = c.h, col = g.colors(), P = pal(col), ins = hex(col.dark ? '#0b120e' : '#14261c');
    img = c.ctx.createImageData(W, H);
    var D = img.data, sc = V.w / W, x0 = V.x - V.w / 2, y0 = V.y + sc * H / 2, row = 0, L2 = Math.log(2);
    function chunk() {
      if (my !== job) return;
      var t0 = performance.now();
      while (row < H && performance.now() - t0 < 14) {
        var ci = y0 - row * sc, o = row * W * 4;
        for (var px = 0; px < W; px++, o += 4) {
          var cr = x0 + px * sc, zr = 0, zi = 0, zr2 = 0, zi2 = 0, n = 0;
          var q = (cr - 0.25) * (cr - 0.25) + ci * ci;           // skip the main cardioid and the big disk
          if (q * (q + (cr - 0.25)) <= 0.25 * ci * ci || (cr + 1) * (cr + 1) + ci * ci <= 0.0625) n = maxIt;
          else while (n < maxIt && zr2 + zi2 <= 256) { zi = 2 * zr * zi + ci; zr = zr2 - zi2 + cr; zr2 = zr * zr; zi2 = zi * zi; n++; }
          if (n >= maxIt) { D[o] = ins[0]; D[o + 1] = ins[1]; D[o + 2] = ins[2]; }
          else {
            var nu = n + 1 - Math.log(Math.log(zr2 + zi2) / 2 / L2) / L2;     // smooth count
            var t = Math.pow(Math.max(0, nu) / 45, 0.75) % 2; if (t > 1) t = 2 - t;
            var k = (t * 255) | 0; D[o] = P[k * 3]; D[o + 1] = P[k * 3 + 1]; D[o + 2] = P[k * 3 + 2];
          }
          D[o + 3] = 255;
        }
        row++;
      }
      c.ctx.putImageData(img, 0, 0, 0, 0, W, row);
      if (row < H) requestAnimationFrame(chunk); else { drawn = { x: V.x, y: V.y, w: V.w }; g.say(where()); }
    }
    chunk(); show();
  }
  function zoomTxt() { var z = 3.4 / V.w; return g.fmt(z, z < 10 ? 1 : 0); }
  function where() { return 'Center ' + V.x.toFixed(6) + (V.y < 0 ? ' − ' : ' + ') + Math.abs(V.y).toFixed(6) + 'i, zoom ' + zoomTxt() + '×, ' + maxIt + ' steps.'; }
  function show() {
    stat.innerHTML = 'Center <b>' + V.x.toFixed(5) + (V.y < 0 ? ' − ' : ' + ') + Math.abs(V.y).toFixed(5) + 'i</b> · zoom <b>' + zoomTxt() + '×</b>';
    jl.href = '../julia-sets/#c=' + V.x.toFixed(4) + ',' + V.y.toFixed(4);
  }
  // quick preview while dragging: shift the last full image
  function preview() {
    if (!img || !drawn) return;
    var sc = V.w / drawn.w, dx = (drawn.x - V.x) / V.w * c.w, dy = (V.y - drawn.y) / V.w * c.w, x = c.ctx;
    x.fillStyle = g.colors().bg; x.fillRect(0, 0, c.w, c.h);
    var tmp = preview.cv || (preview.cv = document.createElement('canvas')); tmp.width = c.w; tmp.height = c.h; tmp.getContext('2d').putImageData(img, 0, 0);
    x.save(); x.translate(c.w / 2 + dx, c.h / 2 + dy); x.scale(1 / sc, 1 / sc); x.drawImage(tmp, -c.w / 2, -c.h / 2); x.restore();
  }
  var rt = 0;
  function soon() { show(); preview(); clearTimeout(rt); rt = setTimeout(render, 140); }
  function zoomAt(f, px, py) {
    if (px == null) { px = c.w / 2; py = c.h / 2; }
    var sc = V.w / c.w, mx = V.x + (px - c.w / 2) * sc, my = V.y - (py - c.h / 2) * sc;
    var nw = Math.min(6, Math.max(2e-13, V.w * f)); f = nw / V.w;
    V.x = mx + (V.x - mx) * f; V.y = my + (V.y - my) * f; V.w = nw; soon();
  }
  function pan(dx, dy) { V.x += dx * V.w; V.y += dy * V.w; soon(); }

  var st = null, moved = false;
  g.drag(c.el, {
    down: function (x, y) { st = [x, y, V.x, V.y]; moved = false; },
    move: function (x, y) { if (!st) return; var dx = x - st[0], dy = y - st[1]; if (Math.abs(dx) + Math.abs(dy) > 5) moved = true; if (!moved) return; var sc = V.w / c.w; V.x = st[2] - dx * sc; V.y = st[3] + dy * sc; show(); preview(); },
    up: function (x, y) { if (!st) return; st = null; if (moved) render(); else zoomAt(0.5, x, y); }
  });
  c.el.addEventListener('wheel', function (e) { e.preventDefault(); var r = c.el.getBoundingClientRect(); zoomAt(e.deltaY > 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  g.keys(c.el, { ArrowLeft: function () { pan(-0.1, 0); }, ArrowRight: function () { pan(0.1, 0); }, ArrowUp: function () { pan(0, 0.1); }, ArrowDown: function () { pan(0, -0.1); },
    '+': function () { zoomAt(0.5); }, '=': function () { zoomAt(0.5); }, '-': function () { zoomAt(2); }, '_': function () { zoomAt(2); } });

  var r1 = g.group();
  g.button('＋ Zoom in', function () { zoomAt(0.5); }, { parent: r1 });
  g.button('− Zoom out', function () { zoomAt(2); }, { parent: r1 });
  g.select({ label: 'Go to', parent: r1, options: PRE.map(function (p) { return [p[0], p[1]]; }), value: 'home', change: function (v) {
    PRE.forEach(function (p) { if (p[0] === v) { V.x = p[2]; V.y = p[3]; V.w = p[4]; } }); if (v !== 'home' && maxIt < 400) { maxIt = 400; it.set(400); } render(); } });
  var it = g.slider({ label: 'Steps per point', min: 20, max: 1500, step: 10, value: maxIt, input: function (v) { maxIt = v; clearTimeout(rt); rt = setTimeout(render, 160); } });
  var jl = g.el('a', 'gx-btn', 'See the Julia set for the center point'); g.bar.appendChild(jl);
  g.bar.appendChild(hint);
  c.onresize = function () { drawn = null; };
  g.draw(render);
});
