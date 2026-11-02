/* Physics Ladder visuals for Rocket Boys Math and Physics (course key rocket). Registered on window.MathLadder.viz; load
   after math/viz/core.js. Vanilla JavaScript on a canvas, no libraries, no network requests. Follows the site's light or
   dark theme (redraws when it changes) and prefers-reduced-motion (then nothing moves until Play is pressed; the picture
   opens on its most telling frame, and Step moves it on).
   One scene per name, rocket-<idea>. Some scenes add sliders or switches (def.ctl). Rockets are drawn as plain generic
   shapes; people are simple cartoon figures in the site's one skin color (#ffcc4d, outline #e8a93a).
   Nothing here shows how to build a motor or a nozzle: the nozzle scene is a flow picture with no sizes or materials. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, fm = V.fmt, g = 9.8, DEG = PI / 180;
  if (!D.getElementById('rocket-viz-css')) {
    var st = D.createElement('style'); st.id = 'rocket-viz-css';
    st.textContent = '.rkv .ml-cv{box-shadow:inset 0 0 0 1px var(--mv-line);touch-action:pan-y}.rkv .ml-ctl{align-items:center;gap:.45rem .6rem;flex-wrap:wrap}.rkv .rkv-play{min-width:6.2rem}' +
      '.rkv .ml-sl{min-width:min(100%,13rem);flex:1 1 13rem}.rkv .rkv-out{margin:.4rem 0 0;font-size:.95rem}';
    D.head.appendChild(st);
  }
  function nm(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(x) { x = ease(x); return x * x * (3 - 2 * x); }

  // ------------------------------------------------------------------ drawing kit
  function kit(ctx, k, w, h) {
    var K = { ctx: ctx, k: k, w: w, h: h, narrow: w < 520 };
    var FS = K.narrow ? 11 : 12, FF = K.narrow ? 12 : 13.5;
    K.FS = FS;
    K.line = function (x1, y1, x2, y2, col, lw, dash) { ctx.save(); ctx.strokeStyle = col || k.ink; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };
    K.poly = function (pts, col, lw, dash, fill) { if (pts.length < 2) return; ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); } if (col) { ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); } ctx.restore(); };
    K.arrow = function (x1, y1, x2, y2, col, lw) {
      var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(9, L * 0.45); if (L < 2) return;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    K.dim = function (x1, y1, x2, y2, s, col, side) {
      col = col || k.muted; K.arrow((x1 + x2) / 2, (y1 + y2) / 2, x1, y1, col, 1.4); K.arrow((x1 + x2) / 2, (y1 + y2) / 2, x2, y2, col, 1.4);
      if (s) { var vert = M.abs(x2 - x1) < M.abs(y2 - y1); K.txt(s, (x1 + x2) / 2 + (vert ? (side || 1) * 6 : 0), (y1 + y2) / 2 + (vert ? 0 : (side || -1) * 10), { color: col, align: vert ? (side === -1 ? 'right' : 'left') : 'center', bg: true }); }
    };
    K.circ = function (x, y, r, fill, stroke, lw) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.5, r), 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    K.rect = function (x, y, rw, rh, fill, stroke, r) { ctx.save(); ctx.beginPath(); if (ctx.roundRect && r) ctx.roundRect(x, y, rw, rh, r); else ctx.rect(x, y, rw, rh); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); };
    K.txt = function (s, x, y, o) {
      o = o || {}; ctx.save(); ctx.font = (o.it ? 'italic ' : '') + (o.weight || 600) + ' ' + (o.size || FS) + 'px ' + (o.serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, sans-serif');
      ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
      if (o.bg) { var tw = ctx.measureText(s).width, x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x; ctx.fillStyle = k.bg; ctx.globalAlpha = 0.85; ctx.fillRect(x0 - 2, y - (o.size || FS) * 0.62, tw + 4, (o.size || FS) * 1.24); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.color || k.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    K.fbox = function (s, bx, by, ax, ay, col) {
      col = col || k.gold; ctx.save(); ctx.font = '600 ' + FF + 'px Georgia, "Times New Roman", serif';
      var lines = String(s).split('\n'), tw = 0; lines.forEach(function (l) { tw = M.max(tw, ctx.measureText(l).width); });
      var bw = tw + 14, lh = FF * 1.3, bh = lines.length * lh + 8, x = M.max(4, M.min(w - bw - 4, bx - bw / 2)), y = M.max(4, M.min(h - bh - 4, by - bh / 2));
      if (ax != null) { var cx = M.max(x, M.min(x + bw, ax)), cy = M.max(y, M.min(y + bh, ay)); if (M.hypot(ax - cx, ay - cy) > 6) { ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ax, ay, 3, 0, 2 * PI); ctx.fill(); } }
      ctx.fillStyle = k.panel; ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, 7); else ctx.rect(x, y, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k.ink; ctx.textBaseline = 'middle'; lines.forEach(function (l, i) { ctx.fillText(l, x + 7, y + 4 + lh * (i + 0.5)); });
      ctx.restore(); return { x: x, y: y, w: bw, h: bh };
    };
    K.ground = function (y, x1, x2) { x1 = x1 || 0; x2 = x2 == null ? w : x2; K.rect(x1, y, x2 - x1, h - y, k.greenSoft); K.line(x1, y, x2, y, k.ink, 2); };
    K.arc = function (x, y, r, a0, a1, col, lw) { ctx.save(); ctx.strokeStyle = col || k.muted; ctx.lineWidth = lw || 1.4; ctx.beginPath(); ctx.arc(x, y, r, a0, a1, a1 < a0); ctx.stroke(); ctx.restore(); };
    K.fit = function (wx0, wx1, wy0, wy1, r) { r = r || { x: 10, y: 10, w: w - 20, h: h - 20 }; var s = M.min(r.w / (wx1 - wx0), r.h / (wy1 - wy0)), ox = r.x + (r.w - s * (wx1 - wx0)) / 2, oy = r.y + (r.h - s * (wy1 - wy0)) / 2;
      return { s: s, X: function (x) { return ox + (x - wx0) * s; }, Y: function (y) { return oy + (wy1 - y) * s; } }; };
    // a plot box: maps (x0..x1, y0..y1) onto a screen rect, not to one scale; draws axes with labels
    K.plot = function (r, x0, x1, y0, y1, o) {
      o = o || {}; var P = { r: r, X: function (x) { return r.x + (x - x0) / (x1 - x0) * r.w; }, Y: function (y) { return r.y + r.h - (y - y0) / (y1 - y0) * r.h; } };
      K.rect(r.x, r.y, r.w, r.h, k.panel); if (o.grid !== false) { for (var i = 1; i < 4; i++) { K.line(r.x + r.w * i / 4, r.y, r.x + r.w * i / 4, r.y + r.h, k.grid, 1); K.line(r.x, r.y + r.h * i / 4, r.x + r.w, r.y + r.h * i / 4, k.grid, 1); } }
      var yz = y0 < 0 && y1 > 0 ? P.Y(0) : r.y + r.h; K.line(r.x, yz, r.x + r.w, yz, k.axis, 1.4); K.line(r.x, r.y, r.x, r.y + r.h, k.axis, 1.4);
      if (o.xl) K.txt(o.xl, r.x + r.w, r.y + r.h + 11, { align: 'right', color: k.muted, size: FS - 1 });
      if (o.yl) K.txt(o.yl, r.x + 4, r.y + 8, { color: o.ycol || k.muted, size: FS - 1 });
      return P;
    };
    // a generic rocket, nose at (x, y) pointing along angle a (radians, 0 = up), length L
    K.rocket = function (x, y, L, a, flame, col) {
      a = a || 0; var bw = L * 0.2; ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      if (flame) { var f = L * (0.35 + 0.15 * M.sin(Date.now() / 60)); K.poly([[-bw * 0.32, L], [0, L + f], [bw * 0.32, L]], null, 0, null, k.orange); K.poly([[-bw * 0.18, L], [0, L + f * 0.6], [bw * 0.18, L]], null, 0, null, k.gold); }
      K.poly([[-bw / 2, L * 0.72], [-bw * 1.05, L * 1.02], [-bw / 2, L * 0.96]], k.ink, 1.2, null, k.red);
      K.poly([[bw / 2, L * 0.72], [bw * 1.05, L * 1.02], [bw / 2, L * 0.96]], k.ink, 1.2, null, k.red);
      K.rect(-bw / 2, L * 0.28, bw, L * 0.72, col || k.panel, k.ink);
      K.poly([[-bw / 2, L * 0.28], [0, 0], [bw / 2, L * 0.28]], k.ink, 1.2, null, k.red);
      ctx.restore();
    };
    K.person = function (x, y, s) {
      s = s || 1; K.line(x, y - 18 * s, x - 6 * s, y, k.ink, 2); K.line(x, y - 18 * s, x + 6 * s, y, k.ink, 2); K.line(x, y - 18 * s, x, y - 34 * s, k.ink, 2.4);
      K.line(x, y - 30 * s, x - 7 * s, y - 22 * s, k.ink, 2); K.line(x, y - 30 * s, x + 8 * s, y - 31 * s, k.ink, 2); K.circ(x, y - 40 * s, 6 * s, '#ffcc4d', '#e8a93a', 1.6); };
    K.theodolite = function (x, y, ang, s) { // a tripod with a sighting tube tilted up by ang (radians); returns the tube's pivot
      s = s || 1; var py = y - 30 * s; K.line(x, py, x - 10 * s, y, k.muted, 1.8); K.line(x, py, x + 10 * s, y, k.muted, 1.8); K.line(x, py, x, y, k.muted, 1.4);
      var L = 20 * s; K.line(x - M.cos(ang) * L * 0.3, py + M.sin(ang) * L * 0.3, x + M.cos(ang) * L, py - M.sin(ang) * L, k.ink, 4 * s); K.circ(x, py, 3 * s, k.gold); return [x, py]; };
    return K;
  }

  // ------------------------------------------------------------------ the stage
  // def = { dur, hold, still, loop, aw, an, draw(K, t, o, S), label(o), ctl(ctl, o, S, redraw), init(o) -> S, out(S, o) -> html }
  function scene(name, def) {
    V.register(name, function (el, o) {
      el.classList.add('rkv'); el.setAttribute('role', 'group');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || (def.label ? def.label(o) : 'An animated diagram'));
      var box = V.el('div', 'rkv-box'); el.appendChild(box);
      var wd = box.clientWidth || el.clientWidth || 600, narrow = wd < 520;
      var c = V.canvas(box, { aspect: narrow ? (def.an || 1.05) : (def.aw || 1.75), min: 250, max: narrow ? 460 : 420 });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', el.getAttribute('aria-label'));
      var S = def.init ? def.init(o) : {};
      var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
      var out = def.out ? V.readout(el) : null;
      var dur = def.dur || 3, hold = def.hold == null ? 1.2 : def.hold, t = 0, playing = o.play !== false && !V.reduced;
      if (!playing) t = def.still == null ? dur : def.still;
      function draw() {
        var k = V.colors(), ctx = c.ctx; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
        try { def.draw(kit(ctx, k, c.w, c.h), M.min(t, dur), o, S); } catch (e) { if (W.console) W.console.error(e); }
      }
      var lastOut = '';
      function upd() { if (out) { var h = def.out(S, o); if (h !== lastOut) { lastOut = h; out.set(h); } } }
      function setBtn() { pb.textContent = playing ? '❚❚ Pause' : '▶ Play'; pb.setAttribute('aria-pressed', playing ? 'true' : 'false'); }
      var pb = V.button(ctl, '', function () { playing = !playing; if (playing && t >= dur) t = 0; setBtn(); }, 'rkv-play'); setBtn();
      V.button(ctl, 'Step ›', function () { playing = false; setBtn(); t = t >= dur ? 0 : M.min(dur, t + dur / 12); draw(); });
      V.button(ctl, '↺ Again', function () { t = 0; playing = true; setBtn(); draw(); });
      if (def.ctl) def.ctl(ctl, o, S, function (restart) { if (restart) { t = 0; if (!V.reduced) { playing = true; setBtn(); } else t = def.still == null ? dur : def.still; } draw(); upd(); });
      V.loop(el, function (dt) { if (!playing) return; t += dt; if (t > dur + hold) t = def.loop ? t - dur - hold : 0; draw(); });
      V.onTheme(draw); c.onResize(draw); draw(); upd();
      return { destroy: function () { playing = false; } };
    });
  }
  function slider(ctl, label, min, max, step, val, fmtf, fn) { return V.slider(ctl, { label: label, min: min, max: max, step: step, value: val, fmt: fmtf, input: fn }); }

  // ================================================================== TOOLS OF THE TRADE

  // rocket-units: a rocket climbs past a scale marked in feet on the left and meters on the right
  scene('rocket-units', {
    dur: 4, still: 4, label: function () { return 'A rocket climbs past a height scale marked in feet on one side and meters on the other'; },
    draw: function (K, t) {
      var k = K.k, H = 1000, top = 22, bot = K.h - 30, sx = K.w / 2, Y = function (ft) { return bot - (bot - top) * ft / H; };
      K.ground(bot);
      K.line(sx, top, sx, bot, k.ink, 2);
      for (var f = 0; f <= H; f += 100) { K.line(sx - 12, Y(f), sx, Y(f), k.blue, 1.5); K.txt(f + ' ft', sx - 16, Y(f), { align: 'right', color: k.blue, size: K.FS - 1 }); }
      for (var m = 0; m * 3.28084 <= H; m += 50) { var yy = Y(m * 3.28084); K.line(sx, yy, sx + 12, yy, k.green, 1.5); if (m % 100 === 0) K.txt(m + ' m', sx + 16, yy, { color: k.green, size: K.FS - 1 }); }
      var hft = 1000 * smooth(t / 3.6), ry = Y(hft);
      K.rocket(sx + (K.narrow ? 70 : 120), ry - 4, 34, 0, t < 3.6);
      K.line(sx, ry, sx + (K.narrow ? 62 : 112), ry, k.gold, 1.4, [4, 4]);
      K.fbox(fm(hft, 0) + ' ft × 0.3048 m/ft = ' + fm(hft * 0.3048, 0) + ' m', K.narrow ? K.w / 2 : K.w * 0.78, K.narrow ? 16 : K.h * 0.35, sx + 4, ry, k.gold);
      K.txt('feet', sx - 50, bot + 16, { color: k.blue, align: 'center' }); K.txt('meters', sx + 50, bot + 16, { color: k.green, align: 'center' });
    }
  });

  // rocket-flight-graph  { vb: 60, tb: 2 }: the velocity-time graph drawn as the flight goes, area shaded = height
  scene('rocket-flight-graph', {
    dur: 5, still: 5, label: function () { return 'A velocity-time graph of a rocket: a straight rise during the burn, then a straight fall with slope minus g; the shaded area is the height gained'; },
    draw: function (K, t, o) {
      var k = K.k, vb = nm(o.vb, 60), tb = nm(o.tb, 2), tz = tb + vb / g, tend = tz * 1.25;
      var v = function (x) { return x < tb ? vb * x / tb : vb - g * (x - tb); };
      var r = { x: 44, y: 16, w: K.w - 60, h: K.h - 48 }, P = K.plot(r, 0, tend, -vb * 0.35, vb * 1.15, { xl: 't (s)', yl: 'v (m/s)' });
      var tc = tend * ease(t / 4.5), pts = [], area = [[P.X(0), P.Y(0)]];
      for (var i = 0; i <= 80; i++) { var x = tc * i / 80; pts.push([P.X(x), P.Y(v(x))]); area.push([P.X(x), P.Y(M.max(0, M.min(v(x), v(x))))]); }
      area.push([P.X(tc), P.Y(0)]);
      var shade = []; for (i = 0; i <= 80; i++) { var x2 = M.min(tc, tz) * i / 80; shade.push([P.X(x2), P.Y(v(x2))]); } shade.push([P.X(M.min(tc, tz)), P.Y(0)]); shade.unshift([P.X(0), P.Y(0)]);
      K.poly(shade, null, 0, null, k.greenSoft); K.poly(pts, k.green, 2.6);
      K.txt('0', r.x - 6, P.Y(0), { align: 'right', color: k.muted, size: K.FS - 1 }); K.txt(fm(vb, 0), r.x - 6, P.Y(vb), { align: 'right', color: k.muted, size: K.FS - 1 });
      if (tc > tb) { K.line(P.X(tb), P.Y(0), P.X(tb), P.Y(vb), k.muted, 1, [3, 3]); K.fbox('burnout\nslope = +' + fm(vb / tb, 0), P.X(tb) + 54, P.Y(vb) + 10, P.X(tb), P.Y(vb), k.orange); }
      if (tc > tb + 0.6 * (tz - tb)) K.fbox('slope = −9.8 m/s²', P.X((tb + tz) / 2) + 60, P.Y(v((tb + tz) / 2)) - 22, P.X((tb + tz) / 2), P.Y(v((tb + tz) / 2)), k.red);
      if (tc >= tz) { K.circ(P.X(tz), P.Y(0), 5, k.gold, k.ink); K.fbox('apogee: v = 0\narea = height = ' + fm(0.5 * vb * tz, 0) + ' m', P.X(tz) - (K.narrow ? 40 : 10), P.Y(vb * 0.55), P.X(tz), P.Y(0), k.gold); }
    }
  });

  // rocket-launch-stats: seven launches drop onto a number line, then the mean and a band of one standard deviation
  scene('rocket-launch-stats', {
    dur: 6, still: 6, label: function () { return 'Seven launch heights drop as dots onto a number line; then a line marks the mean and a band shows one standard deviation either side'; },
    draw: function (K, t, o) {
      var k = K.k, xs = o.xs || [312, 340, 298, 355, 330, 305, 342], n = xs.length, mn = 260, mx = 400;
      var m = xs.reduce(function (s, x) { return s + x; }, 0) / n, sd = M.sqrt(xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (n - 1));
      var x0 = 30, x1 = K.w - 30, X = function (v) { return x0 + (v - mn) / (mx - mn) * (x1 - x0); }, ay = K.h * 0.66;
      if (t > 4.6) { var a = ease((t - 4.6) / 0.8); K.rect(X(m - sd), ay - 120 * a, X(m + sd) - X(m - sd), 120 * a, k.goldSoft); }
      K.line(x0, ay, x1, ay, k.ink, 2);
      for (var v = mn; v <= mx; v += 20) { K.line(X(v), ay, X(v), ay + 6, k.ink, 1.4); if (!K.narrow || v % 40 === 0) K.txt(String(v), X(v), ay + 17, { align: 'center', color: k.muted, size: K.FS - 1 }); }
      K.txt('height (m)', x1, ay + 32, { align: 'right', color: k.muted });
      var stack = {};
      xs.forEach(function (x, i) {
        var ti = i * 0.55, p = ease((t - ti) / 0.5); if (t < ti) return;
        var key = M.round(x / 8), s = stack[key] = (stack[key] || 0) + 1, yEnd = ay - 9 - (s - 1) * 15;
        K.circ(X(x), 20 + (yEnd - 20) * p * p, 6.5, k.blue, k.ink, 1.2);
      });
      if (t > 4.1) { K.line(X(m), ay - 130, X(m), ay, k.red, 2.4); K.fbox('mean = ' + fm(m, 1) + ' m', X(m), ay - 140, X(m), ay - 130, k.red); }
      if (t > 5.2) K.fbox('s ≈ ' + fm(sd, 1) + ' m: most launches within one band', K.w / 2, K.h - 18, X(m + sd), ay - 60, k.gold);
    }
  });

  // ================================================================== PUSHING OFF

  // rocket-thrust-fbd: forces on a rocket at liftoff; the thrust slider changes the net force
  scene('rocket-thrust-fbd', {
    dur: 3, still: 1.6, label: function () { return 'A free-body diagram of a rocket at liftoff: thrust up, weight down, and the net force that sets the acceleration'; },
    init: function (o) { return { T: nm(o.T, 6), m: nm(o.m, 0.12) }; },
    ctl: function (ctl, o, S, re) { slider(ctl, 'Thrust', 0.5, 12, 0.1, S.T, function (v) { return fm(v, 1) + ' N'; }, function (v) { S.T = v; re(true); }); },
    out: function (S) { var Wt = S.m * g, a = (S.T - Wt) / S.m; return S.T > Wt ? 'Weight $mg = ' + fm(Wt, 2) + '$ N. Net force $' + fm(S.T - Wt, 2) + '$ N up, so $a = ' + fm(a, 1) + '\\ \\text{m/s}^2$.' : 'Thrust $' + fm(S.T, 1) + '$ N is not more than the weight, $' + fm(Wt, 2) + '$ N: the rocket stays on the pad.'; },
    draw: function (K, t, o, S) {
      var k = K.k, gy = K.h - 26, Wt = S.m * g, a = M.max(0, (S.T - Wt) / S.m), y = 0.5 * a * t * t, sc = (K.h - 120) / M.max(1, 0.5 * 90 * 9);
      K.ground(gy); var cx = K.w * 0.35, L = 70, ny = gy - L - 12 - y * sc;
      K.rocket(cx, ny, L, 0, true);
      var mid = ny + L * 0.55, fs = 9;
      K.arrow(cx, mid, cx, mid - S.T * fs, k.green, 3); K.txt('thrust ' + fm(S.T, 1) + ' N', cx + 12, mid - S.T * fs + 6, { color: k.green, bg: true });
      K.arrow(cx, mid, cx, mid + Wt * fs, k.red, 3); K.txt('weight mg', cx + 12, mid + Wt * fs - 4, { color: k.red, bg: true });
      var bx = K.w * 0.72;
      K.fbox('3rd law: rocket pushes gas down,\ngas pushes rocket up', bx, 34, cx, ny + L + 18, k.orange);
      K.fbox('2nd law: a = (T − mg) / m', bx, K.h * 0.5, cx, mid, k.blue);
      K.fbox('1st law: forces balanced → no change', bx, K.h - 60, null, null, k.muted);
    }
  });

  // rocket-twr: three rockets with thrust-to-weight 0.8, 2 and 5 side by side
  scene('rocket-twr', {
    dur: 3, still: 2.4, label: function () { return 'Three rockets with thrust-to-weight ratios of 0.8, 2 and 5: the first stays on the pad, the others rise, the last fastest'; },
    draw: function (K, t) {
      var k = K.k, gy = K.h - 30, R = [0.8, 2, 5]; K.ground(gy);
      R.forEach(function (r, i) {
        var x = K.w * (0.2 + 0.3 * i), a = M.max(0, (r - 1) * g), y = 0.5 * a * t * t, sc = (K.h - 120) / (0.5 * 4 * g * 9), L = 54;
        K.line(x + 16, gy, x + 16, gy - 110, k.muted, 2);
        K.rocket(x, gy - L - 10 - y * sc, L, 0, true);
        K.txt('T/W = ' + r, x, gy + 15, { align: 'center', color: r < 1 ? k.red : k.green });
        if (r < 1 && t > 0.6) K.txt('stays put', x, gy - L - 26, { align: 'center', color: k.red, bg: true });
      });
      K.fbox('net acceleration = (T/W − 1) g', K.w / 2, 18, null, null, k.gold);
    }
  });

  // rocket-thrust-curve: a thrust-time curve; the area fills as the burn goes on, and the running impulse is shown
  scene('rocket-thrust-curve', {
    dur: 4, still: 4, label: function () { return 'A thrust-time curve with a spike and then a steady plateau; the shaded area under it is the total impulse'; },
    draw: function (K, t, o) {
      var k = K.k, Fp = nm(o.Fp, 14), tp = nm(o.tp, 0.25), Fs = nm(o.Fs, 4.5), te = nm(o.te, 1.6);
      var F = function (x) { return x < tp ? Fp * x / tp : x < tp + 0.12 ? Fp - (Fp - Fs) * (x - tp) / 0.12 : x < te ? Fs : 0; };
      var r = { x: 44, y: 16, w: K.w - 60, h: K.h - 48 }, P = K.plot(r, 0, te * 1.12, 0, Fp * 1.2, { xl: 't (s)', yl: 'thrust (N)' });
      var tc = te * 1.12 * ease(t / 3.5), sh = [[P.X(0), P.Y(0)]], J = 0, dx = tc / 200;
      for (var i = 0; i <= 200; i++) { var x = i * dx; sh.push([P.X(x), P.Y(F(x))]); if (i) J += (F(x) + F(x - dx)) / 2 * dx; }
      sh.push([P.X(tc), P.Y(0)]); K.poly(sh, k.orange, 2.4, null, k.orangeSoft);
      var full = []; for (i = 0; i <= 200; i++) { var x3 = te * 1.12 * i / 200; full.push([P.X(x3), P.Y(F(x3))]); } K.poly(full, k.muted, 1, [4, 4]);
      K.fbox('impulse so far: J = ∫F dt ≈ ' + fm(J, 2) + ' N·s', K.w * 0.62, 34, P.X(M.min(tc, te) * 0.6), P.Y(F(M.min(tc, te) * 0.6) * 0.5), k.gold);
      K.txt(fm(Fp, 0) + ' N peak', P.X(tp) + 6, P.Y(Fp) - 8, { color: k.muted });
    }
  });

  // rocket-mass-ratio: the mass-ratio explorer. Sliders for the mass ratio and the exhaust speed; the curve is Δv = v_e ln(MR)
  scene('rocket-mass-ratio', {
    dur: 4, still: 4, label: function () { return 'Mass-ratio explorer: a graph of the rocket equation, change in speed against mass ratio, with a rocket whose propellant drains as the marker climbs the curve'; },
    init: function (o) { return { MR: nm(o.MR, 4), ve: nm(o.ve, 2500) }; },
    ctl: function (ctl, o, S, re) {
      slider(ctl, 'Mass ratio m₀/m_f', 1.1, 12, 0.1, S.MR, function (v) { return fm(v, 1); }, function (v) { S.MR = v; re(true); });
      slider(ctl, 'Exhaust speed', 500, 4500, 50, S.ve, function (v) { return fm(v, 0) + ' m/s'; }, function (v) { S.ve = v; re(true); });
    },
    out: function (S) { return 'Propellant is $' + fm(100 * (1 - 1 / S.MR), 0) + '\\%$ of the starting mass. $\\Delta v = ' + fm(S.ve, 0) + '\\ln(' + fm(S.MR, 1) + ') \\approx ' + fm(S.ve * M.log(S.MR), 0) + '\\ \\text{m/s}$.'; },
    draw: function (K, t, o, S) {
      var k = K.k, nar = K.narrow, gx = nar ? 70 : 120, r = { x: gx + 40, y: 18, w: K.w - gx - 56, h: K.h - 52 };
      var P = K.plot(r, 1, 12, 0, 4500 * M.log(12), { xl: 'mass ratio m₀/m_f', yl: 'Δv (m/s)' });
      [1, 3, 6, 9, 12].forEach(function (x) { K.txt(String(x), P.X(x), r.y + r.h + 11, { align: 'center', color: k.muted, size: K.FS - 1 }); });
      var cur = []; for (var i = 0; i <= 100; i++) { var x = 1 + 11 * i / 100; cur.push([P.X(x), P.Y(S.ve * M.log(x))]); } K.poly(cur, k.blue, 2.6);
      var p = smooth(t / 3.5), mrNow = M.exp(M.log(S.MR) * p), dv = S.ve * M.log(mrNow);
      var path = []; for (i = 0; i <= 60; i++) { var x2 = M.exp(M.log(S.MR) * p * i / 60); path.push([P.X(x2), P.Y(S.ve * M.log(x2))]); } K.poly(path, k.green, 4);
      K.circ(P.X(mrNow), P.Y(dv), 6, k.gold, k.ink);
      K.fbox('Δv = vₑ ln(m₀/m_f) = ' + fm(dv, 0) + ' m/s', P.X(mrNow) - (nar ? 30 : 60), M.max(30, P.Y(dv) - 30), P.X(mrNow), P.Y(dv), k.gold);
      // the rocket: tank height shows propellant left
      var rx = 14, ry = 30, rw = nar ? 40 : 56, rh = K.h - 90, fracLeft = (S.MR / mrNow - 1) / (S.MR - 1 || 1), prop = (1 - 1 / S.MR);
      K.poly([[rx, ry + 16], [rx + rw / 2, ry - 8], [rx + rw, ry + 16]], k.ink, 1.4, null, k.red);
      K.rect(rx, ry + 16, rw, rh, k.panel, k.ink);
      var tankH = rh * prop, tank = tankH * clamp(fracLeft, 0, 1);
      K.rect(rx + 3, ry + 16 + rh - tank - 2, rw - 6, tank, k.orangeSoft, k.orange);
      K.txt('fuel', rx + rw / 2, ry + 16 + rh + 12, { align: 'center', color: k.orange, size: K.FS - 1 });
    }
  });

  // rocket-nozzle: a flow picture of a nozzle that narrows then widens; tracer dots speed up all the way
  scene('rocket-nozzle', {
    dur: 4, still: 2, loop: true, hold: 0, label: function () { return 'Gas flowing through a nozzle that narrows to a throat and then widens: below the speed of sound it speeds up as the passage narrows, it reaches the speed of sound at the throat, and above it it keeps speeding up as the passage widens'; },
    draw: function (K, t) {
      var k = K.k, x0 = 24, x1 = K.w - 24, cy = K.h * 0.46, xt = x0 + (x1 - x0) * 0.38;
      var half = function (x) { var u = (x - x0) / (x1 - x0), ut = 0.38; return u < ut ? 22 + 50 * M.pow((ut - u) / ut, 1.4) + 0 : 22 + 46 * M.pow((u - ut) / (1 - ut), 1.2); };
      var up = [], dn = []; for (var i = 0; i <= 80; i++) { var x = x0 + (x1 - x0) * i / 80; up.push([x, cy - half(x)]); dn.push([x, cy + half(x)]); }
      var shape = up.concat(dn.slice().reverse());
      // pressure shading: dark (high) to light (low)
      var grd = K.ctx.createLinearGradient(x0, 0, x1, 0); grd.addColorStop(0, k.redSoft); grd.addColorStop(0.38, k.goldSoft); grd.addColorStop(1, k.blueSoft);
      K.poly(shape, null, 0, null, grd); K.poly(up, k.ink, 2.4); K.poly(dn, k.ink, 2.4);
      // speed as a function of position (illustrative: Mach rises from about 0.2 to about 3)
      var mach = function (x) { var u = (x - x0) / (x1 - x0); return u < 0.38 ? 0.2 + 0.8 * M.pow(u / 0.38, 1.6) : 1 + 2 * M.pow((u - 0.38) / 0.62, 0.8); };
      for (var j = 0; j < 7; j++) for (var lane = -2; lane <= 2; lane++) {
        var s = ((t / 4 + j / 7) % 1), xx = x0 + (x1 - x0) * M.pow(s, 1.7), yy = cy + lane / 2.6 * half(xx);
        K.circ(xx, yy, 2.6, k.ink);
      }
      K.line(xt, cy - half(xt) - 8, xt, cy + half(xt) + 8, k.gold, 1.4, [4, 3]);
      var ly = cy + 86 > K.h - 16 ? K.h - 16 : cy + 86;
      K.txt('slower than sound', x0 + (xt - x0) / 2, K.narrow ? 14 : 18, { align: 'center', color: k.red });
      K.txt('throat: speed of sound', xt, ly, { align: 'center', color: k.gold, bg: true });
      K.txt('faster than sound', xt + (x1 - xt) / 2, K.narrow ? 14 : 18, { align: 'center', color: k.blue });
      K.txt('pressure high → low,  speed low → high', K.w / 2, K.h - 2 - 10, { align: 'center', color: k.muted });
      K.txt('Mach ≈ ' + fm(mach(x0 + 4), 1), x0 + 4, cy, { color: k.muted, size: K.FS - 1, bg: true });
      K.txt('Mach ≈ ' + fm(mach(x1 - 4), 1), x1 - 4, cy, { align: 'right', color: k.muted, size: K.FS - 1, bg: true });
    }
  });

  // ================================================================== UP AND DOWN

  // rocket-calculus: a(t), v(t) and h(t) stacked, with a cursor; area under a so far, and the tangent to h whose slope is v
  scene('rocket-calculus', {
    dur: 6, still: 3.4, label: function () { return 'Three stacked graphs of acceleration, velocity and height against time for a boosted then coasting rocket; a cursor moves across, the area under acceleration is shaded, and a tangent line on the height graph has slope equal to the velocity'; },
    draw: function (K, t) {
      var k = K.k, a1 = 40, tb = 1.5, vb = a1 * tb, hb = 0.5 * a1 * tb * tb, tz = tb + vb / g, T = tz * 1.05;
      var acc = function (x) { return x < tb ? a1 - g : -g; }, vel = function (x) { return x < tb ? (a1 - g) * x : (a1 - g) * tb - g * (x - tb); };
      var vb2 = (a1 - g) * tb, hb2 = 0.5 * (a1 - g) * tb * tb, tz2 = tb + vb2 / g, hgt = function (x) { return x < tb ? 0.5 * (a1 - g) * x * x : hb2 + vb2 * (x - tb) - 0.5 * g * (x - tb) * (x - tb); };
      T = tz2 * 1.1; var Hm = hb2 + vb2 * vb2 / (2 * g);
      var gap = 14, hh = (K.h - 30 - 2 * gap) / 3, rx = 52, rw = K.w - 66;
      var Pa = K.plot({ x: rx, y: 8, w: rw, h: hh }, 0, T, -14, 34, { yl: 'a (m/s²)', grid: false }),
          Pv = K.plot({ x: rx, y: 8 + hh + gap, w: rw, h: hh }, 0, T, -25, vb2 * 1.15, { yl: 'v (m/s)', grid: false }),
          Ph = K.plot({ x: rx, y: 8 + 2 * (hh + gap), w: rw, h: hh }, 0, T, 0, Hm * 1.15, { yl: 'h (m)', xl: 't (s)', grid: false });
      var tc = T * ease(t / 5.6);
      function curve(P, f, col) { var pts = []; for (var i = 0; i <= 120; i++) { var x = T * i / 120; pts.push([P.X(x), P.Y(f(x))]); } K.poly(pts, col, 2.2); }
      var sh = [[Pa.X(0), Pa.Y(0)]]; for (var i = 0; i <= 80; i++) { var x = tc * i / 80; sh.push([Pa.X(x), Pa.Y(acc(x))]); } sh.push([Pa.X(tc), Pa.Y(0)]); K.poly(sh, null, 0, null, k.blueSoft);
      curve(Pa, acc, k.blue); curve(Pv, vel, k.green); curve(Ph, hgt, k.purple);
      [Pa, Pv, Ph].forEach(function (P) { K.line(P.X(tc), P.r.y, P.X(tc), P.r.y + P.r.h, k.gold, 1.4, [4, 3]); });
      K.circ(Pv.X(tc), Pv.Y(vel(tc)), 4.5, k.green, k.ink);
      var s = vel(tc), x1 = tc - T * 0.12, x2 = tc + T * 0.12; K.line(Ph.X(x1), Ph.Y(hgt(tc) + s * (x1 - tc)), Ph.X(x2), Ph.Y(hgt(tc) + s * (x2 - tc)), k.red, 2);
      K.circ(Ph.X(tc), Ph.Y(hgt(tc)), 4.5, k.purple, k.ink);
      K.txt('area under a = change in v = ' + fm(vel(tc), 1) + ' m/s', rx + rw - 4, 8 + hh - 12, { align: 'right', color: k.blue, bg: true });
      K.txt('slope of h = v = ' + fm(s, 1) + ' m/s', rx + rw - 4, 8 + 2 * (hh + gap) + 12, { align: 'right', color: k.red, bg: true });
    }
  });

  // rocket-boost: powered flight, then the coast; burnout marked with its speed and height
  scene('rocket-boost', {
    dur: 4.5, still: 1.6, label: function () { return 'A rocket rising under thrust with a steady net acceleration until burnout, where its speed and height are marked, and then coasting'; },
    draw: function (K, t) {
      var k = K.k, a = 50, tb = 1.6, vb = a * tb, hb = 0.5 * a * tb * tb, Hm = hb + vb * vb / (2 * g), gy = K.h - 24, sc = (gy - 60) / Hm;
      K.ground(gy); var x = K.w * 0.3, y, v;
      if (t < tb) { y = 0.5 * a * t * t; v = a * t; } else { var u = t - tb; y = hb + vb * u - 0.5 * g * u * u; v = vb - g * u; if (v < 0) { y = Hm; v = 0; } }
      var ny = gy - 46 - y * sc; K.rocket(x, ny, 40, 0, t < tb);
      K.line(x - 60, gy - 46 + 40 - hb * sc, x + 60, gy - 46 + 40 - hb * sc, k.orange, 1.4, [5, 4]);
      K.arrow(x + 22, ny + 20, x + 22, ny + 20 - v * 0.6, k.green, 2.6);
      K.txt('v = ' + fm(v, 0) + ' m/s', x + 30, ny + 10, { color: k.green, bg: true });
      K.fbox('burn: a = ' + a + ' m/s² for ' + tb + ' s\nv_b = a t_b = ' + fm(vb, 0) + ' m/s\nh_b = ½ a t_b² = ' + fm(hb, 0) + ' m', K.w * 0.7, K.narrow ? 34 : gy - 46 + 40 - hb * sc - 10, x + 60, gy - 46 + 40 - hb * sc, k.orange);
    }
  });

  // rocket-coast: after burnout, a strobe picture one second apart, the velocity arrow shrinking by 9.8 m/s each time
  scene('rocket-coast', {
    dur: 5, still: 5, label: function () { return 'A coasting rocket shown once each second: the gaps get smaller and the velocity arrow shrinks by 9.8 meters per second each second until it stops at apogee'; },
    draw: function (K, t, o) {
      var k = K.k, vb = nm(o.vb, 44), hb = nm(o.hb, 60), tc = vb / g, Hm = hb + vb * vb / (2 * g), gy = K.h - 20, sc = (gy - 40) / Hm;
      K.ground(gy); var x = K.w * 0.42, shown = tc * ease(t / 4.4);
      K.line(x - 70, gy - hb * sc, x + 70, gy - hb * sc, k.orange, 1.2, [5, 4]); K.txt('burnout', x - 74, gy - hb * sc, { align: 'right', color: k.orange });
      for (var s = 0; s <= M.floor(shown); s++) {
        var y = hb + vb * s - 0.5 * g * s * s, v = vb - g * s, yy = gy - y * sc;
        K.circ(x, yy, 5, s === M.floor(shown) ? k.orange : k.muted, k.ink, 1);
        K.arrow(x + 12, yy, x + 12, yy - v * 1.1, k.green, 2);
        K.txt('t = ' + s + ' s, v = ' + fm(v, 1), x + 20, yy, { color: k.ink, size: K.FS - 1, bg: true });
      }
      if (shown >= tc - 1e-6) { var ya = gy - Hm * sc; K.circ(x, ya, 6, k.gold, k.ink); K.fbox('apogee after ' + fm(tc, 2) + ' s:\nh = ' + fm(hb, 0) + ' + v_b²/2g = ' + fm(Hm, 0) + ' m', K.narrow ? K.w * 0.3 : K.w * 0.2, M.max(30, ya + 10), x - 6, ya, k.gold); }
    }
  });

  // rocket-energy: kinetic and potential energy bars while the rocket coasts from burnout to apogee (and with drag, if o.drag)
  scene('rocket-energy', {
    dur: 4.5, still: 4.5, label: function () { return 'Energy bars for a coasting rocket: kinetic energy shrinks while potential energy grows, and the total stays the same without drag'; },
    draw: function (K, t) {
      var k = K.k, m = 0.2, vb = 50, hb = 40, tc = vb / g, u = tc * smooth(t / 4.2), v = vb - g * u, y = hb + vb * u - 0.5 * g * u * u, Hm = hb + vb * vb / (2 * g);
      var gy = K.h - 22, sc = (gy - 40) / Hm, x = K.w * 0.22; K.ground(gy, 0, K.w * 0.45);
      K.rocket(x, gy - y * sc - 20, 30, 0, false);
      var Kn = 0.5 * m * v * v, U = m * g * (y - hb), Tot = 0.5 * m * vb * vb, bx = K.w * 0.55, bw = K.narrow ? 30 : 44, top = 30, bh = gy - top - 16;
      function bar(i, val, col, lab) { var hgt = bh * val / Tot, xx = bx + i * (bw + 18); K.rect(xx, gy - 16 - hgt, bw, hgt, col, k.ink); K.txt(lab, xx + bw / 2, gy - 4, { align: 'center', size: K.FS - 1 }); K.txt(fm(val, 0) + ' J', xx + bw / 2, gy - 22 - hgt, { align: 'center', size: K.FS - 1, color: k.muted }); }
      bar(0, Kn, k.green, 'K'); bar(1, U, k.blue, 'ΔU'); bar(2, Kn + U, k.gold, 'total');
      K.fbox('½ m v_b² = m g Δh', K.w * 0.5, 16, null, null, k.gold);
    }
  });

  // rocket-drag: height against time with and without drag; the drag arrow on the rocket grows as v squared
  scene('rocket-drag', {
    dur: 5, still: 5, label: function () { return 'Two height-time curves for a coasting rocket, one without drag and one with drag; the drag curve peaks lower and sooner'; },
    init: function (o) { return { k2: nm(o.k, 0.0012), m: 0.25, v0: 70 }; },
    ctl: function (ctl, o, S, re) { slider(ctl, 'Drag constant k', 0, 0.004, 0.0001, S.k2, function (v) { return fm(v * 1000, 1) + ' g/m'; }, function (v) { S.k2 = v; re(true); }); },
    out: function (S) { var r = sim(S, 0.01); return 'No drag: apogee $' + fm(S.v0 * S.v0 / (2 * g), 0) + '$ m. With drag ($k = ' + fm(S.k2 * 1000, 1) + '$ g/m): apogee about $' + fm(r.H, 0) + '$ m after $' + fm(r.T, 1) + '$ s (Euler steps of 0.01 s).'; },
    draw: function (K, t, o, S) {
      var k = K.k, H0 = S.v0 * S.v0 / (2 * g), T0 = S.v0 / g, r = { x: 48, y: 16, w: K.w - 64, h: K.h - 48 }, P = K.plot(r, 0, T0 * 1.05, 0, H0 * 1.15, { xl: 't (s)', yl: 'h (m)' });
      var tc = T0 * 1.05 * ease(t / 4.5), a = [], b = [];
      for (var i = 0; i <= 100; i++) { var x = M.min(T0, tc * i / 100); a.push([P.X(x), P.Y(S.v0 * x - 0.5 * g * x * x)]); }
      K.poly(a, k.muted, 2, [5, 4]);
      var s = sim(S, 0.02), tr = s.path; for (i = 0; i < tr.length && tr[i][0] <= tc; i++) b.push([P.X(tr[i][0]), P.Y(tr[i][1])]);
      K.poly(b, k.red, 2.6);
      var last = b.length ? tr[b.length - 1] : [0, 0, S.v0];
      if (b.length) { var bx = b[b.length - 1][0], by = b[b.length - 1][1], Fd = S.k2 * last[2] * last[2]; K.circ(bx, by, 5, k.red, k.ink); K.arrow(bx, by, bx, by + M.min(80, Fd / (S.m * g) * 22), k.orange, 2.4); }
      K.txt(fm(H0, 0) + ' m', r.x - 4, P.Y(H0), { align: 'right', size: K.FS - 1, color: k.muted });
      K.fbox('no drag', P.X(T0 * 0.8), P.Y(H0) - 2, P.X(T0 * 0.8), P.Y(S.v0 * T0 * 0.8 - 0.5 * g * T0 * T0 * 0.64), k.muted);
      K.fbox('with drag: a = −g − k v²/m', P.X(T0 * 0.55), P.Y(H0 * 0.35), P.X(s.T * 0.5), P.Y(interp(tr, s.T * 0.5)), k.red);
    }
  });
  function sim(S, dt) { var v = S.v0, h = 0, t = 0, path = [[0, 0, v]]; while (v > 0 && t < 60) { var a = -g - S.k2 * v * v / S.m; h += v * dt; v += a * dt; t += dt; path.push([t, h, M.max(0, v)]); } return { H: h, T: t, path: path }; }
  function interp(tr, x) { for (var i = 1; i < tr.length; i++) if (tr[i][0] >= x) return tr[i][1]; return tr[tr.length - 1][1]; }

  // rocket-stability: a gust tips the rocket; with CM ahead of CP it swings back, with CP ahead it swings further
  scene('rocket-stability', {
    dur: 4, still: 1.4, label: function () { return 'A rocket hit by a gust: when the center of mass is ahead of the center of pressure it turns back into its path; when it is behind, the rocket turns away'; },
    init: function () { return { stable: true }; },
    ctl: function (ctl, o, S, re) { V.seg(ctl, { label: 'Balance', items: [['s', 'CM ahead (stable)'], ['u', 'CP ahead (unstable)']], value: 's', change: function (v) { S.stable = v === 's'; re(true); } }); },
    draw: function (K, t, o, S) {
      var k = K.k, cx = K.w * 0.42, cy = K.h * 0.5, L = M.min(K.h * 0.62, 200);
      var ang = S.stable ? 0.42 * M.exp(-1.1 * t) * M.cos(3.2 * t) : M.min(1.9, 0.12 * M.exp(1.2 * t)) * (t > 0 ? 1 : 0);
      if (S.stable && t < 0.3) ang = 0.42 * t / 0.3;
      var cmF = S.stable ? 0.45 : 0.68, cpF = S.stable ? 0.7 : 0.45, pivot = cmF;
      var nx = cx - M.sin(ang) * L * pivot, ny = cy - M.cos(ang) * L * pivot;
      K.rocket(nx, ny, L, ang, false);
      function at(f) { return [nx + M.sin(ang) * L * f, ny + M.cos(ang) * L * f]; }
      var cm = at(cmF), cp = at(cpF);
      K.circ(cm[0], cm[1], 7, '#ffffff', k.ink, 2); K.ctx.save(); K.ctx.fillStyle = k.ink; K.ctx.beginPath(); K.ctx.moveTo(cm[0], cm[1]); K.ctx.arc(cm[0], cm[1], 7, 0, PI / 2); K.ctx.lineTo(cm[0], cm[1]); K.ctx.arc(cm[0], cm[1], 7, PI, PI * 1.5); K.ctx.fill(); K.ctx.restore();
      K.circ(cp[0], cp[1], 6, k.red, k.ink);
      for (var i = 0; i < 4; i++) { var wy = cy - 60 + i * 34, ph = (t * 90 + i * 40) % (K.w * 0.3); K.arrow(K.w - 20 - ph, wy, K.w - 60 - ph, wy, k.blue, 1.6); }
      K.txt('gust', K.w - 30, cy - 80, { align: 'right', color: k.blue });
      K.fbox('CM (center of mass)', K.narrow ? K.w * 0.78 : K.w * 0.8, K.h * 0.25, cm[0] + 8, cm[1], k.ink);
      K.fbox('CP (center of pressure)', K.narrow ? K.w * 0.74 : K.w * 0.8, K.h * 0.78, cp[0] + 6, cp[1], k.red);
      K.txt(S.stable ? 'air pushes at CP behind CM → nose turns back' : 'air pushes at CP ahead of CM → it turns away', K.w / 2, K.h - 12, { align: 'center', color: S.stable ? k.green : k.red, bg: true });
    }
  });

  // rocket-range: paths at several launch angles at the same speed; the slider picks one to highlight
  scene('rocket-range', {
    dur: 3, still: 3, label: function () { return 'Projectile paths at the same speed and different launch angles; 45 degrees goes farthest, and angles that add to 90 degrees land at the same place'; },
    init: function (o) { return { th: nm(o.th, 45), v: nm(o.v, 20) }; },
    ctl: function (ctl, o, S, re) { slider(ctl, 'Launch angle', 5, 85, 1, S.th, function (v) { return fm(v, 0) + '°'; }, function (v) { S.th = v; re(true); }); },
    out: function (S) { var R = S.v * S.v * M.sin(2 * S.th * DEG) / g; return 'At $' + fm(S.v, 0) + '$ m/s and $' + fm(S.th, 0) + '^\\circ$: range $R = v^2\\sin 2\\theta / g \\approx ' + fm(R, 1) + '$ m, height $' + fm(M.pow(S.v * M.sin(S.th * DEG), 2) / (2 * g), 1) + '$ m.'; },
    draw: function (K, t, o, S) {
      var k = K.k, v = S.v, Rm = v * v / g, F = K.fit(-2, Rm * 1.08, -2, Rm * 0.55, { x: 12, y: 10, w: K.w - 24, h: K.h - 34 }), gy = F.Y(0);
      K.ground(gy);
      [15, 30, 45, 60, 75].forEach(function (a) { var pts = [], vx = v * M.cos(a * DEG), vy = v * M.sin(a * DEG), tf = 2 * vy / g; for (var i = 0; i <= 50; i++) { var tt = tf * i / 50; pts.push([F.X(vx * tt), F.Y(vy * tt - 0.5 * g * tt * tt)]); } K.poly(pts, k.muted, 1.2, [4, 4]); K.txt(a + '°', F.X(vx * tf * 0.5), F.Y(vy * vy / (2 * g)) - 8, { align: 'center', size: K.FS - 1, color: k.muted }); });
      var vx = v * M.cos(S.th * DEG), vy = v * M.sin(S.th * DEG), tf = 2 * vy / g, tc = tf * ease(t / 2.6), pts = [];
      for (var i = 0; i <= 60; i++) { var tt = tc * i / 60; pts.push([F.X(vx * tt), F.Y(vy * tt - 0.5 * g * tt * tt)]); }
      K.poly(pts, k.green, 3); K.circ(F.X(vx * tc), F.Y(vy * tc - 0.5 * g * tc * tc), 6, k.orange, k.ink);
      K.dim(F.X(0), gy + 12, F.X(vx * tf), gy + 12, 'R = ' + fm(vx * tf, 1) + ' m', k.ink, 1);
      K.fbox('R = v² sin 2θ / g', K.w * 0.8, 22, null, null, k.gold);
    }
  });

  // ================================================================== HOW HIGH DID IT GO?

  // rocket-theodolite: the highlight. Sliders for the baseline and the angle; the rocket rises to apogee while the tracker
  // follows it, and the triangle shows h = b tan θ
  scene('rocket-theodolite', {
    dur: 4.5, still: 4.5, aw: 1.55, an: 0.95, label: function () { return 'Altitude by the tangent: a tracker stands a measured baseline from the launch pad and sights the rocket at apogee with a theodolite; the right triangle gives height equals baseline times the tangent of the angle'; },
    init: function (o) { return { b: nm(o.b, 150), th: nm(o.th, 55), e: nm(o.e, 1.5) }; },
    ctl: function (ctl, o, S, re) {
      slider(ctl, 'Baseline b', 30, 400, 5, S.b, function (v) { return fm(v, 0) + ' m'; }, function (v) { S.b = v; re(true); });
      slider(ctl, 'Angle at apogee θ', 10, 80, 1, S.th, function (v) { return fm(v, 0) + '°'; }, function (v) { S.th = v; re(true); });
    },
    out: function (S) { var h = S.b * M.tan(S.th * DEG); return '$h = b\\tan\\theta + e = ' + fm(S.b, 0) + '\\tan ' + fm(S.th, 0) + '^\\circ + ' + fm(S.e, 1) + ' \\approx ' + fm(h + S.e, 0) + '\\ \\text{m}$ (about $' + fm((h + S.e) / 0.3048, 0) + '$ ft).'; },
    draw: function (K, t, o, S) {
      var k = K.k, H = S.b * M.tan(S.th * DEG), pad = K.w - (K.narrow ? 46 : 80), obs = K.narrow ? 52 : 90, gy = K.h - 30;
      var sc = M.min((pad - obs) / S.b, (gy - 40) / M.max(H, 1)), ox = pad - S.b * sc;
      K.ground(gy);
      var p = smooth(t / 4), y = H * (1 - M.pow(1 - p, 2)), ry = gy - y * sc;
      // pad and rod
      K.rect(pad - 12, gy - 4, 24, 4, k.muted); K.line(pad + 6, gy, pad + 6, gy - 34, k.muted, 1.6);
      K.line(pad, gy - 2, pad, ry, k.muted, 1, [2, 4]);
      K.rocket(pad, ry - 30, 26, 0, p < 0.35);
      // observer, instrument, sight line and angle
      var cur = M.atan2(y * sc, pad - ox), piv = K.theodolite(ox, gy, cur, 1);
      K.person(ox - 22, gy, 1);
      K.line(piv[0], piv[1], pad, ry, k.gold, 1.6, [6, 4]);
      K.line(piv[0], piv[1], pad, piv[1], k.muted, 1, [3, 3]);
      K.arc(piv[0], piv[1], 34, 0, -cur, k.red, 2); K.txt('θ = ' + fm(cur / DEG, 0) + '°', piv[0] + 40, piv[1] - 14, { color: k.red, bg: true });
      K.dim(ox, gy + 14, pad, gy + 14, 'baseline b = ' + fm(S.b, 0) + ' m', k.ink, 1);
      if (p > 0.97) {
        K.rect(pad - 10, piv[1] - 10, 10, 10, null, k.muted);
        K.dim(pad + 16, piv[1], pad + 16, ry, 'h', k.green, 1);
        K.fbox('tan θ = opposite / adjacent = h / b\nh = b tan θ = ' + fm(H, 0) + ' m above the eye', K.narrow ? K.w / 2 : (ox + pad) / 2, K.narrow ? 26 : M.max(30, (ry + piv[1]) / 2 - 20), (piv[0] + pad) / 2, (piv[1] + ry) / 2, k.gold);
      }
    }
  });

  // rocket-tangent: the triangle above and the graph of tan θ below; as θ climbs, the height for a 100 m baseline shoots up
  scene('rocket-tangent', {
    dur: 5, still: 3.2, label: function () { return 'A right triangle with a 100 meter base whose angle grows, above a graph of the tangent function that rises slowly at first and then very steeply near 90 degrees'; },
    draw: function (K, t) {
      var k = K.k, th = 5 + 80 * smooth(t / 4.8), half = K.narrow ? K.h * 0.46 : K.h, lw = K.narrow ? K.w : K.w * 0.42;
      // triangle
      var bx0 = 18, by0 = (K.narrow ? half : K.h) - 22, base = lw - 60, hgt = M.min(base * M.tan(th * DEG), (K.narrow ? half : K.h) - 40);
      var clip = base * M.tan(th * DEG) > hgt;
      K.poly([[bx0, by0], [bx0 + base, by0], [bx0 + base, by0 - hgt]], k.ink, 2, null, k.greenSoft);
      K.arc(bx0, by0, 26, 0, -th * DEG, k.red, 2); K.txt('θ = ' + fm(th, 0) + '°', bx0 + 30, by0 - 12, { color: k.red, size: K.FS - 1 });
      K.txt('b = 100 m', bx0 + base / 2, by0 + 12, { align: 'center', color: k.muted, size: K.FS - 1 });
      K.txt('h = ' + fm(100 * M.tan(th * DEG), 0) + ' m' + (clip ? ' (off the top!)' : ''), bx0 + base + 4, by0 - M.min(hgt, (K.narrow ? half : K.h) - 50) / 2, { color: k.green, size: K.FS - 1, bg: true, align: clip || base > lw - 80 ? 'right' : 'left' });
      // graph
      var r = K.narrow ? { x: 40, y: half + 10, w: K.w - 56, h: K.h - half - 34 } : { x: lw + 40, y: 14, w: K.w - lw - 56, h: K.h - 40 };
      var P = K.plot(r, 0, 90, 0, 6, { xl: 'θ (degrees)', yl: 'tan θ' }), pts = [];
      for (var a = 0; a <= 80.5; a += 0.5) pts.push([P.X(a), P.Y(M.min(6, M.tan(a * DEG)))]); K.poly(pts, k.blue, 2.4);
      [0, 30, 45, 60, 90].forEach(function (x) { K.txt(String(x), P.X(x), r.y + r.h + 11, { align: 'center', size: K.FS - 1, color: k.muted }); });
      K.line(P.X(45), P.Y(0), P.X(45), P.Y(1), k.muted, 1, [3, 3]); K.txt('tan 45° = 1', P.X(45) + 4, P.Y(1) - 10, { size: K.FS - 1, color: k.muted });
      var ty = M.min(6, M.tan(th * DEG)); K.circ(P.X(th), P.Y(ty), 5, k.gold, k.ink);
    }
  });

  // rocket-angle-error: a ±2° wedge from the tracker; the band of possible heights over the pad grows with the angle
  scene('rocket-angle-error', {
    dur: 5, still: 3, label: function () { return 'A tracker sights a rocket with a two degree uncertainty either way; the band of possible heights over the pad is short at low angles and grows quickly at steep angles'; },
    draw: function (K, t) {
      var k = K.k, d = 2, Bm = 100, th = 20 + 55 * smooth(t / 4.6), top = Bm * M.tan(77 * DEG);
      var F = K.fit(-12, Bm + 30, -4, top * 1.02, { x: 10, y: 8, w: K.w - 20, h: K.h - 34 }), gy = F.Y(0), ox = F.X(0), pad = F.X(Bm);
      K.ground(gy); K.line(pad, gy, pad, F.Y(top), k.muted, 1, [2, 4]);
      var lo = Bm * M.tan((th - d) * DEG), hi = Bm * M.tan((th + d) * DEG), mid = Bm * M.tan(th * DEG);
      K.poly([[ox, gy], [pad, F.Y(lo)], [pad, F.Y(hi)]], null, 0, null, k.goldSoft);
      K.line(ox, gy, pad, F.Y(mid), k.gold, 1.6, [6, 4]);
      K.line(pad - 8, F.Y(lo), pad + 8, F.Y(lo), k.red, 3); K.line(pad - 8, F.Y(hi), pad + 8, F.Y(hi), k.red, 3); K.line(pad, F.Y(lo), pad, F.Y(hi), k.red, 3);
      K.person(ox - 10, gy, 0.8);
      K.dim(ox, gy + 13, pad, gy + 13, 'b = 100 m', k.ink, 1);
      K.fbox('θ = ' + fm(th, 0) + '° ± ' + d + '°\nh from ' + fm(lo, 0) + ' to ' + fm(hi, 0) + ' m\nspread ' + fm(hi - lo, 0) + ' m', K.narrow ? F.X(Bm * 0.35) : F.X(Bm * 0.3), F.Y(top * 0.75), pad - 8, F.Y((lo + hi) / 2), k.red);
    }
  });

  // rocket-triangulate: two observers sight the rocket; same side (cotangents subtract) or opposite sides (they add)
  scene('rocket-triangulate', {
    dur: 3.5, still: 3.5, label: function () { return 'Two observers a known distance apart sight the same rocket at apogee; from the two angles and the distance between them, the height follows'; },
    init: function () { return { same: true }; },
    ctl: function (ctl, o, S, re) { V.seg(ctl, { label: 'Where the observers stand', items: [['s', 'Same side'], ['o', 'Opposite sides']], value: 's', change: function (v) { S.same = v === 's'; re(true); } }); },
    draw: function (K, t, o, S) {
      var k = K.k, gy = K.h - 30, h = 1, A, B, xr, d = 1;
      // world: rocket at x = 0, height H; observers at -x1 and -x2 (same) or -x1 and +x2 (opposite)
      var H = 300, x1 = S.same ? 180 : 230, x2 = S.same ? 420 : 160, xs = S.same ? [-x2, -x1] : [-x1, x2];
      var F = K.fit(M.min(xs[0], 0) - 30, M.max(xs[1], 0) + 30, -10, H * 1.15, { x: 14, y: 14, w: K.w - 28, h: K.h - 52 });
      K.ground(F.Y(0)); var p = smooth(t / 3), ry = F.Y(H * p);
      K.line(F.X(0), F.Y(0), F.X(0), ry, k.muted, 1, [2, 4]); K.rocket(F.X(0), ry - 24, 22, 0, p < 0.4);
      xs.forEach(function (x, i) {
        var ex = F.X(x), ey = F.Y(0), ang = M.atan2(H * p, M.abs(x)), dir = x < 0 ? 1 : -1;
        K.person(ex - dir * 10, ey, 0.85);
        K.line(ex, ey - 2, F.X(0), ry, i ? k.blue : k.red, 1.6, [6, 4]);
        K.arc(ex, ey - 2, 28, dir > 0 ? 0 : PI, dir > 0 ? -ang : PI + ang, i ? k.blue : k.red, 2);
        K.txt((i ? 'β' : 'α') + ' = ' + fm(ang / DEG, 0) + '°', ex + dir * 30, ey - 22, { color: i ? k.blue : k.red, align: dir > 0 ? 'left' : 'right', bg: true });
      });
      K.dim(F.X(xs[0]), F.Y(0) + 14, F.X(xs[1]), F.Y(0) + 14, 'd (measured)', k.ink, 1);
      K.fbox(S.same ? 'd = h (cot α − cot β)\nh = d / (cot α − cot β)' : 'd = h (cot α + cot β)\nh = d / (cot α + cot β)', K.narrow ? K.w / 2 : K.w * 0.72, 30, F.X(0), ry, k.gold);
    }
  });

  // ================================================================== BEYOND THE SKY

  // rocket-cannon: Newton's cannon on a very tall mountain; faster shots land farther, and the fastest one goes all the way around
  scene('rocket-cannon', {
    dur: 7, still: 7, aw: 1.4, an: 1, label: function () { return 'Newton\'s cannon: shots fired sideways from a very tall mountain land farther and farther around the Earth as their speed increases, until the fastest one falls all the way around and never lands'; },
    draw: function (K, t) {
      var k = K.k, cx = K.w / 2, cy = K.h / 2 + 6, Rp = M.min(K.w, K.h) * 0.3, r0 = 1.12, speeds = [0.55, 0.75, 0.88, 1 / M.sqrt(r0) * 1.0];
      K.circ(cx, cy, Rp, k.blueSoft, k.blue, 2); K.txt('Earth', cx, cy, { align: 'center', color: k.blue });
      K.poly([[cx - 8, cy - Rp + 2], [cx, cy - Rp * r0 - 2], [cx + 8, cy - Rp + 2]], k.ink, 1.4, null, k.muted);
      speeds.forEach(function (sp, i) {
        var t0 = i * 1.4, tt = t - t0; if (tt < 0) return;
        var x = 0, y = r0, vx = sp, vy = 0, dt = 0.004, pts = [[cx, cy - Rp * r0]], steps = M.min(4000, M.floor(tt / 1.6 * 1200)), landed = false;
        for (var s = 0; s < steps; s++) { var r = M.hypot(x, y); if (r < 1) { landed = true; break; } var a = -1 / (r * r * r); vx += a * x * dt; vy += a * y * dt; x += vx * dt; y += vy * dt; pts.push([cx + x * Rp, cy - y * Rp]); if (i === 3 && s > 50 && M.abs(x) < 0.01 && y > 0) break; }
        var col = i === 3 ? k.green : [k.orange, k.red, k.purple][i];
        K.poly(pts, col, 2.2); var e = pts[pts.length - 1]; K.circ(e[0], e[1], 4, col, k.ink, 1);
      });
      K.fbox('fast enough sideways:\nit falls around the Earth', K.narrow ? K.w / 2 : K.w * 0.84, K.narrow ? K.h - 22 : 34, cx + Rp * 0.8, cy - Rp * 0.85, k.green);
      K.txt('v = √(GM/r)', 12, 18, { color: k.gold, serif: true, size: 14 });
    }
  });

  // rocket-escape: from the same height, speeds of 0.8, 1, 1.2 and 1.41 times circular speed: smaller ellipse, circle, bigger ellipse, escape
  scene('rocket-escape', {
    dur: 6, still: 6, aw: 1.6, an: 1, label: function () { return 'Paths from the same starting point at different speeds: below circular speed a smaller ellipse, at circular speed a circle, faster a longer ellipse, and at the square root of two times circular speed the craft escapes'; },
    draw: function (K, t) {
      var k = K.k, cx = K.w * 0.42, cy = K.h / 2, sc = M.min(K.w, K.h) * 0.2, f = [0.85, 1, 1.2, M.SQRT2], cols = [k.orange, k.green, k.purple, k.red], labs = ['0.85 × circular', 'circular', '1.2 × circular', '√2 × circular: escape'];
      K.circ(cx, cy, sc * 0.5, k.blueSoft, k.blue, 2);
      f.forEach(function (ff, i) {
        var x = 0, y = 1, vx = ff, vy = 0, dt = 0.004, pts = [[cx, cy - sc]], steps = M.floor(M.min(1, t / 5) * 2600);
        for (var s = 0; s < steps; s++) { var r = M.hypot(x, y); var a = -1 / (r * r * r); vx += a * x * dt; vy += a * y * dt; x += vx * dt; y += vy * dt; var px = cx + x * sc, py = cy - y * sc; if (px < -20 || px > K.w + 20 || py < -20 || py > K.h + 20) break; pts.push([px, py]); if (s > 60 && M.abs(x) < 0.006 && y > 0 && ff < 1.3) break; }
        K.poly(pts, cols[i], 2);
        K.txt(labs[i], K.w - 10, 18 + i * 17, { align: 'right', color: cols[i], size: K.FS - 1, bg: true });
      });
      K.circ(cx, cy - sc, 4, k.ink);
      K.fbox('v_esc = √(2GM/r) = √2 · v_orbit', K.w / 2, K.h - 18, null, null, k.gold);
    }
  });

  // rocket-kepler  { e: 0.5 }: a satellite on an ellipse with Earth at one focus; equal-time wedges have equal areas
  scene('rocket-kepler', {
    dur: 8, still: 5, loop: true, hold: 0, aw: 1.6, an: 1, label: function () { return 'A satellite on an elliptical orbit with Earth at one focus; it moves fastest near perigee, and wedges swept in equal times have equal areas'; },
    init: function (o) { return { e: nm(o.e, 0.5) }; },
    ctl: function (ctl, o, S, re) { slider(ctl, 'Eccentricity e', 0, 0.8, 0.05, S.e, function (v) { return fm(v, 2); }, function (v) { S.e = v; re(false); }); },
    draw: function (K, t, o, S) {
      var k = K.k, e = S.e, a = M.min(K.w * 0.36, K.h * 0.42 / M.sqrt(1 - e * e)), b = a * M.sqrt(1 - e * e), cx = K.w * 0.5, cy = K.h * 0.5, fx = cx + a * e;
      var el = []; for (var i = 0; i <= 120; i++) { var q = 2 * PI * i / 120; el.push([cx + a * M.cos(q), cy + b * M.sin(q)]); } K.poly(el, k.muted, 1.6);
      K.circ(fx, cy, 9, k.blueSoft, k.blue, 2); K.circ(cx - a * e, cy, 2.5, k.muted);
      function pos(tau) { var Mn = 2 * PI * tau, E = Mn; for (var j = 0; j < 30; j++) E = E - (E - e * M.sin(E) - Mn) / (1 - e * M.cos(E)); return [cx + a * M.cos(E), cy + b * M.sin(E)]; }
      // two wedges, each 1/12 of the period: one at perigee, one at apogee
      [[-1 / 24, 1 / 24, k.goldSoft], [0.5 - 1 / 24, 0.5 + 1 / 24, k.greenSoft]].forEach(function (w) { var pts = [[fx, cy]]; for (var j = 0; j <= 20; j++) pts.push(pos(w[0] + (w[1] - w[0]) * j / 20)); K.poly(pts, null, 0, null, w[2]); });
      var tau = (t / 8) % 1, p = pos(tau);
      K.line(fx, cy, p[0], p[1], k.gold, 1.4); K.circ(p[0], p[1], 6, k.orange, k.ink);
      K.txt('perigee', cx + a + 6, cy, { color: k.muted, size: K.FS - 1 }); K.txt('apogee', cx - a - 6, cy, { align: 'right', color: k.muted, size: K.FS - 1 });
      K.txt('equal times → equal areas', K.w / 2, 16, { align: 'center', color: k.gold, bg: true });
      K.txt('T² ∝ a³', 12, K.h - 14, { color: k.gold, serif: true, size: 14 });
    }
  });
})(window, document);
