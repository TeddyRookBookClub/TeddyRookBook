/* /earth-and-space/ocean-floor-gravity/: "How it works", the animation. A seamount (a cone, treated as one point mass at
   its center of mass) pulls on the water, the sea surface bulges, SWOT's swath measures it, and the shape gives gravity
   and its gradient. Simplified on purpose (no isostasy, no sediment, flat Earth); the page says so.
     sea-surface bump   N(x)   = G m / (g r)
     gravity anomaly    dg(x)  = G m d / r^3
     gravity gradient   VGG(x) = G m (2 d^2 - x^2) / r^5     (= g times the surface's curvature, summed in both directions)
   with r = sqrt(x^2 + d^2), d = depth of the center of mass, m = (rock - seawater density) x cone volume. */
(function () {
  'use strict';
  var fig = document.querySelector('.of-how');
  if (!fig) return;
  var G = 6.674e-11, g0 = 9.81, DRHO = 2800 - 1030, DEPTH = 4000, OFF = 30;   // OFF: seamount 30 km east of the track
  var side = fig.querySelector('.of-how-side'), top = fig.querySelector('.of-how-top'), chart = fig.querySelector('.of-how-chart');
  var hEl = fig.querySelector('.of-how-h'), hOut = fig.querySelector('.of-how-hout'), sum = fig.querySelector('.of-how-sum');
  var playBtn = fig.querySelector('.of-how-play');
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var playing = !RM, visible = false, t0 = performance.now(), paintedTo = -1, field = null, FN = 130;

  function css(v, d) { return getComputedStyle(fig).getPropertyValue(v).trim() || d; }
  function model(h) {
    var R = 4 * h, V = Math.PI * R * R * h / 3, m = DRHO * V, d = DEPTH - h / 4, Gm = G * m;
    return {
      h: h, R: R, d: d, Gm: Gm,
      N: function (x) { var r = Math.sqrt(x * x + d * d); return Gm / (g0 * r); },
      dg: function (x) { var r = Math.sqrt(x * x + d * d); return Gm * d / (r * r * r) * 1e5; },
      vgg: function (x) { var r = Math.sqrt(x * x + d * d); return Gm * (2 * d * d - x * x) / Math.pow(r, 5) * 1e9; }
    };
  }
  var M = model(+hEl.value);
  function fmt(v, dp) { return v.toLocaleString('en-US', { maximumFractionDigits: dp, minimumFractionDigits: dp }); }
  function update() {
    M = model(+hEl.value);
    hOut.textContent = (+hEl.value).toLocaleString('en-US') + ' m';
    var n = M.N(0) * 100;
    sum.textContent = 'Right above the seamount: the sea surface stands ' + (n < 10 ? fmt(n, 1) : fmt(n, 0)) + ' cm higher, gravity is ' + fmt(M.dg(0), M.dg(0) < 10 ? 1 : 0) + ' mGal stronger, and the gravity gradient is ' + fmt(M.vgg(0), 0) + ' E.';
    field = null; paintedTo = -1;
    if (!playing) drawAll(1); else drawChart();
  }
  hEl.addEventListener('input', update);
  playBtn.addEventListener('click', function () {
    playing = !playing;
    playBtn.setAttribute('aria-pressed', String(!playing));
    playBtn.textContent = playing ? 'Pause' : 'Play';
    if (playing) { t0 = performance.now(); paintedTo = -1; loop(); } else drawAll(1);
  });
  if (!playing) { playBtn.textContent = 'Play'; playBtn.setAttribute('aria-pressed', 'true'); }

  function prep(cv) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    return { c: c, w: w, h: h };
  }

  // ---- side view: across the track, looking along it
  function drawSide(phase) {
    var P = prep(side), c = P.c, w = P.w, h = P.h;
    var X0 = -68, X1 = 68, kx = w / (X1 - X0);
    function X(km) { return (km - X0) * kx; }
    var ySat = h * 0.13, ySea = h * 0.42, yBed = h * 0.92, kv = (yBed - ySea) / DEPTH;   // px per meter (true scale)
    // bump exaggeration: a round factor so the bump is 8 to 40 px tall
    var peak = M.N(0), want = Math.max(8, Math.min(40, h * 0.09)), ex = want / (peak * kv);
    var p10 = Math.pow(10, Math.floor(Math.log10(ex))), f = ex / p10; ex = (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p10;
    var sky = css('--of-sky', '#dfeef7'), sea = css('--of-sea', '#2f6d93'), deep = css('--of-deep', '#123049'), rock = css('--of-rock', '#7a5a3a'), ink = css('--of-ink', '#1d2a22'), gold = css('--of-gold', '#b8963e');
    c.fillStyle = sky; c.fillRect(0, 0, w, ySea + 2);
    // water
    var grd = c.createLinearGradient(0, ySea, 0, yBed); grd.addColorStop(0, sea); grd.addColorStop(1, deep);
    c.fillStyle = grd; c.beginPath(); c.moveTo(0, h);
    for (var px = 0; px <= w; px += 2) { var xkm = px / kx + X0; c.lineTo(px, ySea - M.N((xkm - OFF) * 1000) * kv * ex); }
    c.lineTo(w, h); c.closePath(); c.fill();
    // flat reference line (where the surface would be without the seamount)
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([4, 4]); c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, ySea - M.N(80000) * kv * ex); c.lineTo(w, ySea - M.N(80000) * kv * ex); c.stroke(); c.setLineDash([]);
    // seafloor and the seamount (a cone)
    var hp = M.h * kv, rp = M.R / 1000 * kx;
    c.fillStyle = rock; c.beginPath(); c.moveTo(0, yBed); c.lineTo(X(OFF) - rp, yBed); c.lineTo(X(OFF), yBed - hp); c.lineTo(X(OFF) + rp, yBed); c.lineTo(w, yBed); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
    // pull arrows toward the center of mass
    var cmY = ySea + (DEPTH - M.h / 4) * kv, pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 4);
    c.strokeStyle = 'rgba(255,255,255,' + (0.45 + 0.35 * pulse) + ')'; c.fillStyle = c.strokeStyle; c.lineWidth = 1.5;
    [[-22, 0.25], [-12, 0.55], [12, 0.55], [22, 0.25], [-6, 0.12], [6, 0.12]].forEach(function (a) {
      var sx = X(OFF + a[0]), sy = ySea + (yBed - ySea) * a[1], dx = X(OFF) - sx, dy = cmY - sy, L = Math.hypot(dx, dy), len = Math.min(26, L * 0.4);
      var ux = dx / L, uy = dy / L, ex2 = sx + ux * len, ey = sy + uy * len;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex2, ey); c.stroke();
      c.beginPath(); c.moveTo(ex2, ey); c.lineTo(ex2 - ux * 6 - uy * 3.5, ey - uy * 6 + ux * 3.5); c.lineTo(ex2 - ux * 6 + uy * 3.5, ey - uy * 6 - ux * 3.5); c.closePath(); c.fill();
    });
    // radar swaths: 10 to 60 km on each side of the track
    var sx0 = X(0);
    c.fillStyle = 'rgba(242,201,76,.20)'; c.strokeStyle = 'rgba(184,150,62,.75)'; c.lineWidth = 1;
    [[-60, -10], [10, 60]].forEach(function (s) {
      c.beginPath(); c.moveTo(sx0, ySat + 8); c.lineTo(X(s[0]), ySea); c.lineTo(X(s[1]), ySea); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = gold; c.fillRect(X(s[0]), ySea - 2, X(s[1]) - X(s[0]), 4); c.fillStyle = 'rgba(242,201,76,.20)';
    });
    // satellite: body, solar panels, the mast with an antenna at each end
    c.fillStyle = ink; c.fillRect(sx0 - 9, ySat - 9, 18, 14);
    c.fillStyle = '#3b6fb6'; c.fillRect(sx0 - 9 - 22, ySat - 6, 20, 7); c.fillRect(sx0 + 11, ySat - 6, 20, 7);
    c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(sx0 - 30, ySat + 8); c.lineTo(sx0 + 30, ySat + 8); c.stroke();
    c.fillStyle = gold; c.fillRect(sx0 - 34, ySat + 5, 8, 6); c.fillRect(sx0 + 26, ySat + 5, 8, 6);
    // labels
    var small = w < 520;
    c.font = (small ? '11px' : '12px') + ' system-ui, sans-serif'; c.textBaseline = 'middle';
    c.fillStyle = ink; c.textAlign = 'left';
    if (small) { c.textAlign = 'center'; c.fillText('SWOT, about 890 km up (not to scale)', sx0, ySat - 20); }
    else c.fillText('SWOT, about 890 km up (not to scale)', sx0 + 40, ySat - 2);
    c.textAlign = 'left'; c.fillStyle = ink;
    c.fillText('Sea surface: bump drawn ' + ex.toLocaleString('en-US') + '× taller', 6, ySea - want - 10 > 12 ? ySea - want - 10 : ySea - 12);
    c.fillStyle = '#fff'; c.textAlign = 'right';
    c.fillText('Seamount ' + M.h.toLocaleString('en-US') + ' m tall', X(OFF) - rp - 6 > 120 ? X(OFF) - rp - 6 : w - 6, yBed - Math.min(hp, 40) / 2 - 4);
    c.textAlign = 'left'; c.fillText('Seafloor, 4,000 m deep', 6, yBed + (h - yBed) / 2);
    c.textAlign = 'center'; c.fillStyle = ink;
    c.fillText('50 km', X(-35), ySea + 12 > yBed ? ySea - 10 : ySea + 13);
  }

  // ---- top view: the swath sweeping over the bump
  function makeField() {
    var f = new Float32Array(FN * FN), mx = 0;
    for (var j = 0; j < FN; j++) for (var i = 0; i < FN; i++) {
      var x = (i + 0.5) / FN * 130 - 65, y = (j + 0.5) / FN * 130 - 65, r = Math.hypot(x - OFF, y) * 1000;
      var v = M.N(r); f[j * FN + i] = v; if (v > mx) mx = v;
    }
    var far = M.N(65000 * 1.2);
    for (var k = 0; k < f.length; k++) f[k] = Math.max(0, (f[k] - far) / (mx - far));
    return f;
  }
  var off = document.createElement('canvas'), offImg = null; off.width = FN; off.height = FN;
  function drawTop(phase) {
    var P = prep(top), c = P.c, w = P.w, h = P.h, sz = Math.min(w, h) - 26, ox = (w - sz) / 2, oy = 4;
    if (!field) { field = makeField(); paintedTo = -1; }
    var row = Math.floor(Math.min(1, phase / 0.8) * FN);
    if (row < paintedTo) paintedTo = -1;
    var oc = off.getContext('2d'), img = offImg || (offImg = oc.createImageData(FN, FN)), d = img.data;
    if (paintedTo < 0) { for (var q = 0; q < d.length; q += 4) { d[q] = 0; d[q + 3] = 0; } }
    for (var j = Math.max(0, paintedTo); j < row; j++) {
      for (var i = 0; i < FN; i++) {
        var xk = (i + 0.5) / FN * 130 - 65, ax = Math.abs(xk), o = (j * FN + i) * 4;
        if (ax < 10 || ax > 60) continue;
        var t = Math.pow(field[j * FN + i], 0.8);
        d[o] = 30 + 225 * t; d[o + 1] = 70 + 150 * t; d[o + 2] = 140 + 60 * (1 - t) * 0.3 + 40 * t; d[o + 3] = 255;
      }
    }
    paintedTo = row;
    oc.putImageData(img, 0, 0);
    c.fillStyle = css('--of-sea', '#2f6d93'); c.globalAlpha = 0.35; c.fillRect(ox, oy, sz, sz); c.globalAlpha = 1;
    c.imageSmoothingEnabled = true; c.drawImage(off, ox, oy, sz, sz);
    // track and satellite
    var ink = css('--of-ink', '#1d2a22'), k = sz / 130, sy = oy + Math.min(1, phase / 0.8) * sz;
    c.strokeStyle = ink; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(ox + sz / 2, oy); c.lineTo(ox + sz / 2, oy + sz); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(242,201,76,.95)'; c.lineWidth = 2;
    c.strokeRect(ox + (65 - 60) * k, sy - 2, 50 * k, 4); c.strokeRect(ox + (65 + 10) * k, sy - 2, 50 * k, 4);
    c.fillStyle = ink; c.fillRect(ox + sz / 2 - 5, sy - 5, 10, 10);
    // seamount marker
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.arc(ox + (65 + OFF) * k, oy + 65 * k, Math.max(3, M.R / 1000 * k), 0, 7); c.stroke();
    c.fillStyle = ink; c.font = '11px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('From above: 130 km square. Strips = what SWOT measures', w / 2, oy + sz + 6);
  }

  // ---- chart: the three curves through the seamount
  function drawChart() {
    var P = prep(chart), c = P.c, w = P.w, h = P.h, ink = css('--of-ink', '#1d2a22'), dim = css('--of-dim', '#5b6b61'), grid = css('--of-grid', '#e3e8e5');
    var rows = [
      { name: 'Sea surface height', unit: 'cm', f: function (x) { return M.N(x) * 100; }, col: css('--of-blue', '#2f6d93') },
      { name: 'Gravity anomaly', unit: 'mGal', f: M.dg, col: css('--of-gold', '#b8963e') },
      { name: 'Gravity gradient', unit: 'E', f: M.vgg, col: css('--of-g', '#00562f') }
    ];
    var ml = 8, mr = 8, gap = 6, rh = (h - 22 - gap * 2) / 3, pw = w - ml - mr;
    c.font = '11px system-ui, sans-serif';
    rows.forEach(function (r, k) {
      var y0 = k * (rh + gap), vals = [], lo = Infinity, hi = -Infinity;
      for (var i = 0; i <= 200; i++) { var x = (i / 200 * 50 - 25) * 1000, v = r.f(x); vals.push(v); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      lo = Math.min(lo, 0); var span = hi - lo || 1;
      function Y(v) { return y0 + 16 + (1 - (v - lo) / span) * (rh - 20); }
      c.strokeStyle = grid; c.lineWidth = 1; c.strokeRect(ml, y0, pw, rh);
      c.strokeStyle = dim; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(ml, Y(0)); c.lineTo(ml + pw, Y(0)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = r.col; c.lineWidth = 2; c.beginPath();
      vals.forEach(function (v, i) { var x = ml + i / 200 * pw; if (i) c.lineTo(x, Y(v)); else c.moveTo(x, Y(v)); }); c.stroke();
      c.fillStyle = ink; c.textAlign = 'left'; c.textBaseline = 'top';
      var pk = r.f(0);
      c.fillText(r.name + ': peak ' + (Math.abs(pk) < 10 ? fmt(pk, 1) : fmt(pk, 0)) + ' ' + r.unit, ml + 5, y0 + 3);
    });
    c.fillStyle = dim; c.textBaseline = 'top';
    c.textAlign = 'left'; c.fillText('−25 km', ml, h - 16);
    c.textAlign = 'center'; c.fillText('over the seamount', ml + pw / 2, h - 16);
    c.textAlign = 'right'; c.fillText('+25 km', ml + pw, h - 16);
  }

  function drawAll(phase) { drawSide(phase); drawTop(phase); drawChart(); }
  var raf = 0, last = -1;
  function loop() {
    if (raf) return;
    raf = requestAnimationFrame(function (now) {
      raf = 0;
      if (!playing || !visible) return;
      var ph = ((now - t0) / 7000) % 1;
      if (ph < last) { paintedTo = -1; }
      last = ph;
      drawSide(ph); drawTop(ph);
      loop();
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && playing) loop(); }).observe(fig);
  } else visible = true;
  function redraw() { field = null; drawAll(playing ? 0.001 : 1); }
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(fig); else window.addEventListener('resize', redraw);
  new MutationObserver(function () { drawAll(playing ? last : 1); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  update();
  drawAll(playing ? 0.001 : 1);
  if (playing) loop();
})();
