/* Physics Ladder visuals for Exam Challenge (course key exam). Registered on window.MathLadder.viz; load after
   math/viz/core.js. Vanilla JavaScript on a canvas, no libraries, no network requests. Follows the site's light or
   dark theme (redraws when it changes) and prefers-reduced-motion (then nothing moves until Play is pressed; the
   picture opens on its most telling frame, and Step moves it on).

   One scene per topic, named exam-<topic slug>. Each shows the problem's situation moving where motion matters,
   with the key formulas in boxes beside the part of the picture they describe (leader lines point at it).
   Common opts:  quiet: true (inside a problem: given values only, nothing that gives an answer away)
                 play: false (start paused)   task, label (as for every visual)
   Scene opts are listed above each scene. Physics drawn to scale where it can be (paths from the same equations
   the problems use), schematic where scale would hide the idea (a 1 cm deflection, a 30 nm wavelength). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, fm = V.fmt, g = 9.8;
  if (!D.getElementById('exam-viz-css')) {
    var st = D.createElement('style'); st.id = 'exam-viz-css';
    st.textContent = '.xcv .xcv-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.xcv .ml-cv{box-shadow:inset 0 0 0 1px var(--mv-line);touch-action:pan-y}.xcv .ml-ctl{align-items:center;gap:.45rem .6rem}.xcv .xcv-play{min-width:6.2rem}';
    D.head.appendChild(st);
  }
  function nm(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function rad(d) { return d * PI / 180; }

  // ------------------------------------------------------------------ drawing kit
  function kit(ctx, k, w, h) {
    var K = { ctx: ctx, k: k, w: w, h: h, narrow: w < 520 };
    var FS = K.narrow ? 11 : 12, FF = K.narrow ? 12 : 13.5;
    K.line = function (x1, y1, x2, y2, col, lw, dash) { ctx.save(); ctx.strokeStyle = col || k.ink; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };
    K.poly = function (pts, col, lw, dash, fill) { if (pts.length < 2) return; ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); } if (col) { ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); } ctx.restore(); };
    K.arrow = function (x1, y1, x2, y2, col, lw) {
      var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(9, L * 0.45); if (L < 2) return;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    K.dim = function (x1, y1, x2, y2, s, col, side) { // a two-headed dimension arrow with a label
      col = col || k.muted; K.arrow((x1 + x2) / 2, (y1 + y2) / 2, x1, y1, col, 1.4); K.arrow((x1 + x2) / 2, (y1 + y2) / 2, x2, y2, col, 1.4);
      if (s) { var vert = M.abs(x2 - x1) < M.abs(y2 - y1); K.txt(s, (x1 + x2) / 2 + (vert ? (side || 1) * 6 : 0), (y1 + y2) / 2 + (vert ? 0 : (side || -1) * 9), { color: col, align: vert ? (side === -1 ? 'right' : 'left') : 'center', bg: true }); }
    };
    K.circ = function (x, y, r, fill, stroke, lw) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.5, r), 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    K.rect = function (x, y, rw, rh, fill, stroke, r) { ctx.save(); ctx.beginPath(); if (ctx.roundRect && r) ctx.roundRect(x, y, rw, rh, r); else ctx.rect(x, y, rw, rh); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); };
    K.txt = function (s, x, y, o) {
      o = o || {}; ctx.save(); ctx.font = (o.it ? 'italic ' : '') + (o.weight || 600) + ' ' + (o.size || FS) + 'px ' + (o.serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, sans-serif');
      ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
      if (o.bg) { var tw = ctx.measureText(s).width, x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x; ctx.fillStyle = k.bg; ctx.globalAlpha = 0.82; ctx.fillRect(x0 - 2, y - (o.size || FS) * 0.62, tw + 4, (o.size || FS) * 1.24); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.color || k.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    // a formula box centered near (bx, by), kept on the canvas, with a leader line to the point (ax, ay) it describes
    K.fbox = function (s, bx, by, ax, ay, col) {
      col = col || k.gold; ctx.save(); ctx.font = '600 ' + FF + 'px Georgia, "Times New Roman", serif';
      var lines = String(s).split('\n'), tw = 0; lines.forEach(function (l) { tw = M.max(tw, ctx.measureText(l).width); });
      var bw = tw + 14, lh = FF * 1.3, bh = lines.length * lh + 8, x = M.max(4, M.min(w - bw - 4, bx - bw / 2)), y = M.max(4, M.min(h - bh - 4, by - bh / 2));
      if (ax != null) { var cx = M.max(x, M.min(x + bw, ax)), cy = M.max(y, M.min(y + bh, ay)); if (M.hypot(ax - cx, ay - cy) > 6) { ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ax, ay, 3, 0, 2 * PI); ctx.fill(); } }
      ctx.fillStyle = k.panel; ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, 7); else ctx.rect(x, y, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k.ink; ctx.textBaseline = 'middle'; lines.forEach(function (l, i) { ctx.fillText(l, x + 7, y + 4 + lh * (i + 0.5)); });
      ctx.restore(); return { x: x, y: y, w: bw, h: bh };
    };
    K.hatch = function (x1, y, x2, col, down) { K.line(x1, y, x2, y, col || k.ink, 2); for (var x = x1; x < x2; x += 9) K.line(x, y + (down === false ? -1 : 1), x - 6, y + (down === false ? -8 : 8), col || k.muted, 1); };
    K.spring = function (x1, y1, x2, y2, n, amp, col) { var dx = x2 - x1, dy = y2 - y1, L = M.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux, pts = [[x1, y1]], lead = M.min(10, L * 0.1);
      pts.push([x1 + ux * lead, y1 + uy * lead]); for (var i = 0; i < n; i++) { var s = lead + (L - 2 * lead) * (i + 0.5) / n, sg = i % 2 ? -1 : 1; pts.push([x1 + ux * s + px * amp * sg, y1 + uy * s + py * amp * sg]); }
      pts.push([x2 - ux * lead, y2 - uy * lead]); pts.push([x2, y2]); K.poly(pts, col || k.ink, 1.8); };
    K.arc = function (x, y, r, a0, a1, col, lw) { ctx.save(); ctx.strokeStyle = col || k.muted; ctx.lineWidth = lw || 1.4; ctx.beginPath(); ctx.arc(x, y, r, a0, a1, a1 < a0); ctx.stroke(); ctx.restore(); };
    // map a world box onto a screen rect with one scale, y up
    K.fit = function (wx0, wx1, wy0, wy1, r) { r = r || { x: 10, y: 10, w: w - 20, h: h - 20 }; var s = M.min(r.w / (wx1 - wx0), r.h / (wy1 - wy0)), ox = r.x + (r.w - s * (wx1 - wx0)) / 2, oy = r.y + (r.h - s * (wy1 - wy0)) / 2;
      return { s: s, X: function (x) { return ox + (x - wx0) * s; }, Y: function (y) { return oy + (wy1 - y) * s; } }; };
    K.person = function (x, y, s) { // a simple standing figure, feet at (x, y)
      s = s || 1; K.line(x, y - 18 * s, x - 6 * s, y, k.ink, 2); K.line(x, y - 18 * s, x + 6 * s, y, k.ink, 2); K.line(x, y - 18 * s, x, y - 34 * s, k.ink, 2.4);
      K.line(x, y - 30 * s, x - 7 * s, y - 22 * s, k.ink, 2); K.line(x, y - 30 * s, x + 7 * s, y - 22 * s, k.ink, 2); K.circ(x, y - 40 * s, 6 * s, '#ffcc4d', '#e8a93a', 1.6); };
    return K;
  }

  // ------------------------------------------------------------------ the stage: canvas, timing and controls
  // def = { dur (s), hold (s), still (the frame shown under reduced motion; default dur), aw, an (aspects), draw(K, t, o), label(o) }
  function scene(name, def) {
    V.register(name, function (el, o) {
      el.classList.add('xcv'); el.setAttribute('role', 'group');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || (def.label ? def.label(o) : 'An animated diagram'));
      if (o.task) { var tk = V.el('p', 'xcv-task', o.task); el.appendChild(tk); if (ML.typeset) try { ML.typeset(tk); } catch (e) { } }
      var box = V.el('div', 'xcv-box'); el.appendChild(box);
      var wd = box.clientWidth || el.clientWidth || 600, narrow = wd < 520;
      var c = V.canvas(box, { aspect: narrow ? (def.an || 1.05) : (def.aw || 1.75), min: 250, max: narrow ? 460 : 420 });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', el.getAttribute('aria-label'));
      var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
      var dur = def.dur || 3, hold = def.hold == null ? 1.2 : def.hold, t = 0, playing = o.play !== false && !V.reduced;
      if (!playing) t = def.still == null ? dur : def.still;
      function draw() {
        var k = V.colors(), ctx = c.ctx; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
        try { def.draw(kit(ctx, k, c.w, c.h), M.min(t, dur), o); } catch (e) { if (W.console) W.console.error(e); }
      }
      function setBtn() { pb.textContent = playing ? '❚❚ Pause' : '▶ Play'; pb.setAttribute('aria-pressed', playing ? 'true' : 'false'); }
      var pb = V.button(ctl, '', function () { playing = !playing; if (playing && t >= dur) t = 0; setBtn(); }, 'xcv-play'); setBtn();
      V.button(ctl, 'Step ›', function () { playing = false; setBtn(); t = t >= dur ? 0 : M.min(dur, t + dur / 12); draw(); });
      V.button(ctl, '↺ Again', function () { t = 0; playing = true; setBtn(); draw(); });
      V.loop(el, function (dt) { if (!playing) return; t += dt; if (t > dur + hold) t = def.loop ? t - dur - hold : 0; draw(); });
      V.onTheme(draw); c.onResize(draw); draw();
      return { destroy: function () { playing = false; } };
    });
  }
  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // ================================================================== MECHANICS
  // exam-cliff-throw  { h: 30, v: 12, ang: 0 (degrees above horizontal; negative = below), place: cliff|roof|bridge, D: 0 (given landing distance) }
  scene('exam-cliff-throw', {
    dur: 3.2, still: 1.9, label: function (o) { return 'A ball thrown from a height of ' + nm(o.h, 30) + ' m, flying along a curved path to the ground'; },
    draw: function (K, t, o) {
      var k = K.k, h = nm(o.h, 30), v = nm(o.v, 12), a = rad(nm(o.ang, 0)), vx = v * M.cos(a), vy = v * M.sin(a);
      var tl = (vy + M.sqrt(vy * vy + 2 * g * h)) / g, X = vx * tl, top = M.max(0, vy * vy / (2 * g));
      var F = K.fit(-0.32 * X - 2, X * 1.15 + 2, -h - 0.06 * h, top + 0.22 * h + 2, { x: 10, y: 8, w: K.w - 20, h: K.h - 16 });
      var x0 = F.X(0), y0 = F.Y(0), yb = F.Y(-h), water = o.place !== 'roof';
      // the cliff or building, and the ground or water
      K.rect(F.X(-0.32 * X - 2) - 10, y0, x0 - F.X(-0.32 * X - 2) + 10, yb - y0, o.place === 'roof' ? k.grid : k.panel, k.muted);
      if (water) { K.rect(x0, yb, K.w - x0, K.h - yb, k.blueSoft); for (var i = 0; i < 6; i++) { var wx = x0 + 20 + i * (K.w - x0) / 6; K.line(wx, yb + 8, wx + 12, yb + 8, k.blue, 1.2); } }
      K.hatch(water ? 0 : x0, yb, K.w, k.ink);
      K.dim(x0 - 14, y0, x0 - 14, yb, 'h = ' + fm(h, 1) + ' m', k.muted, -1);
      // path so far, and the ball
      var tau = ease(t / 3.2) * tl, pts = [];
      for (var j = 0; j <= 60; j++) { var tt = tau * j / 60; pts.push([F.X(vx * tt), F.Y(vy * tt - 0.5 * g * tt * tt)]); }
      var full = []; for (j = 0; j <= 60; j++) { var t2 = tl * j / 60; full.push([F.X(vx * t2), F.Y(vy * t2 - 0.5 * g * t2 * t2)]); }
      K.poly(full, k.muted, 1, [4, 5]); K.poly(pts, k.green, 2.5);
      var bx = F.X(vx * tau), by = F.Y(vy * tau - 0.5 * g * tau * tau), vyn = vy - g * tau, sc = M.min(3.2, 46 / M.max(v, 1));
      K.arrow(bx, by, bx + vx * sc, by, k.blue, 2.2); K.arrow(bx, by, bx, by - vyn * sc, k.red, 2.2);
      K.circ(bx, by, 6.5, k.orange, k.ink, 1.2);
      K.txt(o.D ? 'v₀ = ?' : 'v₀ = ' + fm(v, 1) + ' m/s' + (o.ang ? ', θ = ' + fm(M.abs(o.ang), 0) + '°' + (o.ang < 0 ? ' below' : '') : ''), x0 + 6, y0 - 26, { color: k.green });
      if (t < 0.4) K.arrow(x0, y0, x0 + 40 * M.cos(a), y0 - 40 * M.sin(a), k.green, 2.4);
      K.txt('vₓ', bx + vx * sc + 4, by - 8, { color: k.blue, it: true, serif: true }); K.txt('v_y', bx + 8, by - vyn * sc, { color: k.red, it: true, serif: true });
      var xl = F.X(X); K.dim(x0, yb - 12, xl, yb - 12, o.D ? 'x = ' + fm(o.D, 1) + ' m' : 'x = ?', k.muted, -1);
      var narrow = K.narrow;
      K.fbox(o.ang ? 'x = (v₀ cos θ) t' : 'x = v₀ t', (x0 + xl) / 2 + (narrow ? 20 : 60), yb - (narrow ? 50 : 44), (x0 + xl) / 2, yb - 12, k.blue);
      K.fbox(o.ang ? 'y = (v₀ sin θ) t − ½ g t²' : 'fall: h = ½ g t²', narrow ? K.w - 90 : K.w - 130, 30, bx + 2, by + 8, k.red);
    }
  });

  // exam-wall-shot  { v: 18, ang: 45, d: 12, H: 3 }
  scene('exam-wall-shot', {
    dur: 3, still: 1.6, an: 1.3, label: function () { return 'A ball launched at an angle over a wall'; },
    draw: function (K, t, o) {
      var k = K.k, v = nm(o.v, 18), a = rad(nm(o.ang, 45)), d = nm(o.d, 12), H = nm(o.H, 3), vx = v * M.cos(a), vy = v * M.sin(a), tl = 2 * vy / g, Rg = vx * tl, top = vy * vy / (2 * g);
      var F = K.fit(-0.08 * Rg, Rg * 1.06, -0.12 * top, top * 1.35, { x: 10, y: 8, w: K.w - 20, h: K.h - 20 });
      var gy = F.Y(0); K.hatch(0, gy, K.w, k.ink);
      var wx = F.X(d); K.rect(wx - 5, F.Y(H), 10, gy - F.Y(H), k.grid, k.muted); K.dim(wx + 12, gy, wx + 12, F.Y(H), 'H = ' + fm(H, 1) + ' m', k.muted, 1);
      K.dim(F.X(0), gy + 12, wx, gy + 12, 'd = ' + fm(d, 1) + ' m', k.muted, 1);
      var full = [], pts = [], tau = ease(t / 3) * tl; for (var j = 0; j <= 70; j++) { var t1 = tl * j / 70, t2 = tau * j / 70; full.push([F.X(vx * t1), F.Y(vy * t1 - 0.5 * g * t1 * t1)]); pts.push([F.X(vx * t2), F.Y(vy * t2 - 0.5 * g * t2 * t2)]); }
      K.poly(full, k.muted, 1, [4, 5]); K.poly(pts, k.green, 2.5);
      var bx = F.X(vx * tau), by = F.Y(vy * tau - 0.5 * g * tau * tau), sc = 40 / v; K.arrow(bx, by, bx + vx * sc, by - (vy - g * tau) * sc, k.green, 2.2); K.circ(bx, by, 6, k.orange, k.ink, 1.2);
      var x0 = F.X(0); K.arc(x0, gy, 26, 0, -a, k.muted); K.txt('θ = ' + fm(o.ang, 0) + '°', x0 + 30, gy - 10, { color: k.muted, size: 11 });
      K.txt('v₀ = ' + fm(v, 1) + ' m/s', x0 + 6, gy - 44, { color: k.green });
      var tw = d / vx, yw = vy * tw - 0.5 * g * tw * tw;
      K.fbox('at the wall:  t = d / (v₀ cos θ)', K.narrow ? K.w / 2 : wx - 40, K.narrow ? K.h - 26 : gy - 18 > K.h - 40 ? K.h - 26 : K.h - 26, wx, gy, k.blue);
      K.fbox('y = (v₀ sin θ) t − ½ g t²', K.narrow ? K.w / 2 : wx + 150, 24, wx, F.Y(yw), k.red);
    }
  });

  // exam-cart-collision  { m1, m2, v, kind: carts|clay|rail }
  scene('exam-cart-collision', {
    dur: 4.2, still: 2.6, label: function () { return 'One cart rolls into another, they lock together and roll up a ramp'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, gy = h * 0.78, xr = w * 0.62, rampH = h * 0.42, clay = o.kind === 'clay';
      // track then a curved smooth ramp on the right
      var ramp = []; for (var i = 0; i <= 30; i++) { var u = i / 30; ramp.push([xr + u * (w - 12 - xr), gy - rampH * u * u]); }
      K.line(8, gy, xr, gy, k.ink, 2); K.poly(ramp, k.ink, 2);
      var cw = M.min(70, w * 0.13), chB = 26, xA0 = 16, xB = w * 0.36, s1 = M.min(1, t / 1.3), xA = xA0 + (xB - cw - xA0) * s1;
      function cart(x, y, lab, col, wid, ang) { var c = K.ctx; c.save(); c.translate(x, y); c.rotate(ang || 0); K.rect(0, -chB - 6, wid, chB, col, k.ink, 5); K.circ(wid * 0.22, -5, 5, k.ink); K.circ(wid * 0.78, -5, 5, k.ink); K.txt(lab, wid / 2, -chB / 2 - 6, { align: 'center', color: '#fff', size: 12 }); c.restore(); }
      function ball(x, y, lab) { K.circ(x, y - 12, 11, k.orange, k.ink); K.txt(lab, x, y - 12, { align: 'center', size: 10, color: '#fff' }); }
      var phase2 = t > 1.3, s2 = ease((t - 1.3) / 2.6), p = 0;
      if (!phase2) {
        if (clay) ball(xA + cw - 11, gy, 'A'); else cart(xA, gy, 'A', k.blue, cw);
        cart(xB, gy, 'B', k.purple, cw);
        K.arrow(xA + cw / 2, gy - chB - 22, xA + cw / 2 + 40, gy - chB - 22, k.green, 2.2);
        K.txt('v = ' + fm(o.v, 2) + ' m/s', xA + cw / 2, gy - chB - 36, { color: k.green });
        K.txt('m₁ = ' + fm(o.m1, 3) + ' kg', 12, 20, { color: k.blue }); K.txt('m₂ = ' + fm(o.m2, 3) + ' kg', 12, 38, { color: k.purple });
      } else {
        // the pair: along the level track, then up the ramp to its top point, easing to rest (speed ~ sqrt of height left)
        var dist1 = xr - xB, ramp1 = 0.55, pos = s2 < 0.45 ? s2 / 0.45 * dist1 : dist1, ru = s2 < 0.45 ? 0 : M.sin((s2 - 0.45) / 0.55 * PI / 2) * ramp1;
        var px = xB - cw + pos + ru * (w - 12 - xr), py = ru > 0 ? gy - rampH * ru * ru : gy, ang = ru > 0 ? -M.atan(2 * rampH * ru / (w - 12 - xr)) : 0;
        if (clay) { cart(px, py, 'A+B', k.purple, cw * 2 - 10, ang); } else { cart(px - cw + 2, py, 'A', k.blue, cw, 0); cart(px, py, 'B', k.purple, cw, 0); }
        if (ru > 0) { var hy = gy - rampH * ramp1 * ramp1; K.line(xr, hy, w - 10, hy, k.muted, 1, [3, 4]); K.dim(w - 22, gy, w - 22, hy, 'h', k.muted, -1); }
        K.arrow(px - 20, gy - chB - 30 - (gy - py), px + 16 * (1 - s2), gy - chB - 30 - (gy - py), k.green, 2); K.txt('V', px - 30, gy - chB - 30 - (gy - py), { color: k.green, it: true, serif: true, align: 'right' });
      }
      K.fbox('momentum:  m₁v = (m₁ + m₂)V', K.narrow ? w / 2 : xB, K.narrow ? h - 22 : h - 24, xB, gy, k.blue);
      K.fbox('energy:  ½(m₁ + m₂)V² = (m₁ + m₂)gh', K.narrow ? w / 2 : w * 0.7, K.narrow ? 70 : 40, w - 30, gy - rampH * 0.3, k.red);
    }
  });

  // exam-loop-track  { h: 1.2, r: 0.4 }
  scene('exam-loop-track', {
    dur: 4, still: 1.05, an: 0.95, label: function () { return 'An object slides down a smooth track and around a vertical loop'; },
    draw: function (K, t, o) {
      var k = K.k, h = nm(o.h, 1.2), r = nm(o.r, 0.4), sx = M.max(2.4 * r, 0.9 * h), path = [];
      for (var i = 0; i <= 40; i++) { var x = -sx + sx * i / 40; path.push([x - r * 0.15, h * (1 + M.cos(PI * (x + sx) / sx)) / 2]); }
      for (i = 0; i <= 80; i++) { var al = 2 * PI * i / 80; path.push([r * M.sin(al), r - r * M.cos(al)]); }
      path.push([2.2 * r, 0]);
      var F = K.fit(-sx - 0.3 * r, 2.4 * r, -0.15 * h, h * 1.12, { x: 10, y: 10, w: K.w - 20, h: K.h - 28 });
      K.hatch(0, F.Y(0) + 3, K.w, k.muted); K.poly(path.map(function (p) { return [F.X(p[0]), F.Y(p[1])]; }), k.ink, 3);
      // arc length along the path, speed from energy, a time-scaled run
      var L = [0]; for (i = 1; i < path.length; i++) L.push(L[i - 1] + M.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
      var s = 0, dt = 0.004, slow = M.sqrt(h / 1.2) * 1.0, tt = 0; while (tt < t * slow && s < L[L.length - 1]) { var j = 0; while (j < L.length - 2 && L[j + 1] < s) j++; var y = path[j][1]; s += M.sqrt(M.max(0.02, 2 * g * (h - y))) * dt; tt += dt; }
      var j2 = 0; while (j2 < L.length - 2 && L[j2 + 1] < s) j2++; var f = (s - L[j2]) / M.max(1e-9, L[j2 + 1] - L[j2]), bx = path[j2][0] + (path[j2 + 1][0] - path[j2][0]) * f, by = path[j2][1] + (path[j2 + 1][1] - path[j2][1]) * f;
      K.circ(F.X(bx), F.Y(by) , 7, k.orange, k.ink, 1.2);
      K.dim(F.X(-sx - 0.18 * r), F.Y(0), F.X(-sx - 0.18 * r), F.Y(h), 'h = ' + fm(h, 2) + ' m', k.muted, 1);
      var cx = F.X(0), cy = F.Y(r); K.line(cx, cy, cx + F.s * r * M.cos(-0.6), cy - F.s * r * M.sin(-0.6), k.muted, 1.2); K.txt('r = ' + fm(r, 2) + ' m', cx + 6, cy + 12, { color: k.muted, size: 11 });
      // forces at the top of the loop
      var tx = F.X(0), ty = F.Y(2 * r); K.arrow(tx + 12, ty - 4, tx + 12, ty + 26, k.red, 2); K.txt('mg', tx + 16, ty + 22, { color: k.red, it: true, serif: true });
      K.arrow(tx - 12, ty - 4, tx - 12, ty + 26, k.blue, 2); K.txt('N', tx - 16, ty + 22, { color: k.blue, it: true, serif: true, align: 'right' });
      K.fbox('top:  N + mg = mv²/r', K.narrow ? K.w * 0.7 : tx + 150, K.narrow ? 22 : ty - 6, tx + 12, ty + 12, k.red);
      K.fbox('energy:  mgh = mg(2r) + ½mv²', K.narrow ? K.w / 2 : K.w * 0.36, K.h - 16, F.X(-sx * 0.5), F.Y(h * 0.5), k.green);
    }
  });

  // exam-conical-pendulum  { L: 1, ang: 30 }
  scene('exam-conical-pendulum', {
    dur: 6, loop: true, hold: 0, still: 1.1, an: 0.95, label: function () { return 'A ball on a string swinging in a horizontal circle, the string tracing a cone'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, th = rad(nm(o.ang, 30)), Lm = nm(o.L, 1), sc = M.min((h - 110) / M.cos(th), (w * 0.38) / M.sin(th)) * 0.92;
      var px = K.narrow ? w * 0.5 : w * 0.38, py = 26, r = sc * M.sin(th), cy = py + sc * M.cos(th), P = 2 * PI * M.sqrt(Lm * M.cos(th) / g), ph = 2 * PI * t / M.max(1.6, P * 1.5);
      K.hatch(px - 50, py - 2, px + 50, k.ink, false); K.line(px, py, px, cy + 30, k.muted, 1, [4, 4]);
      K.ctx.save(); K.ctx.strokeStyle = k.muted; K.ctx.setLineDash([4, 4]); K.ctx.beginPath(); K.ctx.ellipse(px, cy, r, r * 0.22, 0, 0, 2 * PI); K.ctx.stroke(); K.ctx.restore();
      var bx = px + r * M.cos(ph), by = cy + r * 0.22 * M.sin(ph), depth = M.sin(ph);
      K.line(px, py, bx, by, k.ink, 1.8); K.circ(bx, by, 9 + 2 * depth, k.orange, k.ink, 1.2);
      K.arc(px, py, 34, PI / 2, PI / 2 - th * M.sign(M.cos(ph) || 1), k.muted); K.txt('θ = ' + fm(o.ang, 0) + '°', px + (M.cos(ph) >= 0 ? -8 : 8), py + 46, { color: k.muted, align: M.cos(ph) >= 0 ? 'right' : 'left', size: 11 });
      K.txt('L = ' + fm(Lm, 2) + ' m', (px + bx) / 2 + (M.cos(ph) >= 0 ? -10 : 10), (py + by) / 2, { color: k.ink, align: M.cos(ph) >= 0 ? 'right' : 'left', size: 11, bg: true });
      K.line(px, cy, bx, by, k.muted, 1.2, [2, 3]); K.txt('r = L sin θ', (px + bx) / 2, by + 16, { align: 'center', size: 11, color: k.muted, bg: true });
      // tension and its parts, gravity
      var ux = (px - bx) / sc, uy = (py - by) / sc, T = 70; K.arrow(bx, by, bx + ux * T, by + uy * T, k.blue, 2.4);
      K.arrow(bx, by, bx, by + uy * T, k.blue, 1.3); K.arrow(bx, by, bx + ux * T, by, k.purple, 1.6); K.arrow(bx, by, bx, by + 50, k.red, 2.2);
      K.txt('T', bx + ux * T + 6, by + uy * T, { color: k.blue, it: true, serif: true }); K.txt('mg', bx + 5, by + 56, { color: k.red, it: true, serif: true });
      K.fbox('up–down:  T cos θ = mg', K.narrow ? w / 2 : w * 0.8, K.narrow ? h - 50 : h * 0.3, bx, by + uy * T * 0.6, k.blue);
      K.fbox('toward the center:  T sin θ = mv²/r', K.narrow ? w / 2 : w * 0.78, K.narrow ? h - 18 : h * 0.62, bx + ux * T * 0.7, by, k.purple);
    }
  });

  // exam-spring-oscillator  { m: 0.5, k: 50, A: 0.1 (m) }
  scene('exam-spring-oscillator', {
    dur: 7, still: 3.5, an: 0.9, aw: 1.6, label: function () { return 'A block on a spring sliding back and forth, with a trace of its position against time'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, m = nm(o.m, 0.5), kk = nm(o.k, 50), A = nm(o.A, 0.1), om = M.sqrt(kk / m), P = 2 * PI / om, sl = M.max(1, 1.6 / P), wv = om / sl;
      var x0 = 18, eq = w * 0.5, Apx = w * 0.22, yT = 62, bw = 46, x = A * M.cos(wv * t) / A * Apx;
      K.line(x0, yT - 34, x0, yT + 16, k.ink, 3); K.hatch(x0, yT + 16, w - 10, k.muted);
      K.spring(x0, yT - 4, eq + x - bw / 2, yT - 4, 12, 9, k.ink); K.rect(eq + x - bw / 2, yT - 26, bw, 42, k.blue, k.ink, 5); K.txt('m', eq + x, yT - 5, { align: 'center', color: '#fff', it: true, serif: true });
      K.line(eq, yT - 40, eq, h - 10, k.muted, 1, [4, 4]); K.txt('rest', eq + 4, yT - 42, { size: 10.5, color: k.muted });
      K.line(eq - Apx, yT + 22, eq - Apx, h - 10, k.grid, 1); K.line(eq + Apx, yT + 22, eq + Apx, h - 10, k.grid, 1);
      K.txt('−A', eq - Apx, yT + 30, { align: 'center', size: 10.5, color: k.muted }); K.txt('+A', eq + Apx, yT + 30, { align: 'center', size: 10.5, color: k.muted });
      var vv = -M.sin(wv * t); K.arrow(eq + x, yT - 34, eq + x + vv * 40, yT - 34, k.green, 2);
      // the trace: time runs downward under the block
      var top = yT + 40, bot = h - 12, pts = [], span = 2.2 * P * sl; for (var i = 0; i <= 120; i++) { var tt = t - span * i / 120; if (tt < 0) break; pts.push([eq + Apx * M.cos(wv * tt), top + (bot - top) * i / 120]); }
      K.poly(pts, k.orange, 2); K.circ(eq + x, top, 3.5, k.orange);
      K.txt('time ↓', 12, top + 6, { size: 10.5, color: k.muted });
      K.txt('m = ' + fm(m, 2) + ' kg,  k = ' + fm(kk, 1) + ' N/m', w - 12, 16, { align: 'right', size: 11, color: k.muted });
      var tp = top + (bot - top) * (P * sl / span); K.dim(eq + Apx + 18, top, eq + Apx + 18, M.min(bot, tp), 'T', k.purple, 1);
      K.fbox('T = 2π√(m/k)', K.narrow ? w * 0.74 : w * 0.86, K.narrow ? h - 30 : (top + bot) / 2, eq + Apx + 18, (top + M.min(bot, tp)) / 2, k.purple);
      K.fbox('fastest at rest point:  v_max = Aω,  ω = √(k/m)', K.narrow ? w / 2 : w * 0.3, K.narrow ? top + 30 : top + 40, eq, yT - 34, k.green);
    }
  });

  // exam-rough-ramp-spring  { ang: 30, L: 2, mu: 0.2 }
  scene('exam-rough-ramp-spring', {
    dur: 4.5, still: 1.1, label: function () { return 'A crate slides down a rough ramp, across a smooth floor and into a spring'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, th = rad(nm(o.ang, 30)), gy = h - 34, rl = M.min(w * 0.55 / M.cos(th), (gy - 40) / M.sin(th)), x0 = 14, y0 = gy - rl * M.sin(th), xb = x0 + rl * M.cos(th), xw = w - 14;
      K.poly([[x0, y0], [xb, gy], [xw, gy]], k.ink, 2.5); K.poly([[x0, y0], [xb, gy], [x0, gy]], null, 0, null, k.grid); K.line(xw, gy - 60, xw, gy, k.ink, 3);
      K.arc(xb, gy, 34, PI, PI + th, k.muted); K.txt('θ = ' + fm(o.ang, 0) + '°', xb - 40, gy - 12, { align: 'right', size: 11, color: k.muted });
      for (var i = 0; i < 9; i++) { var u = (i + 0.5) / 9; K.line(x0 + u * (xb - x0), y0 + u * (gy - y0) - 1, x0 + u * (xb - x0) + 4, y0 + u * (gy - y0) + 4, k.muted, 1); }
      K.txt('rough, μ = ' + fm(o.mu, 2), (x0 + xb) / 2 + 12, (y0 + gy) / 2 - 18, { size: 11, color: k.muted, bg: true }); K.txt('smooth', (xb + xw) / 2, gy + 14, { align: 'center', size: 11, color: k.muted });
      var sp0 = xw - 90, comp = 0, cs = 30, s, bx, by, ang = 0, phase;
      if (t < 2) { s = (t / 2) * (t / 2); bx = x0 + 20 + s * (xb - x0 - 30); by = y0 + (bx - x0) * M.tan(th); ang = th; phase = 0; }
      else if (t < 3) { var u2 = t - 2; bx = xb + 10 + u2 * (sp0 - xb - 10 - cs); by = gy; phase = 1; }
      else { var u3 = M.sin(ease((t - 3) / 0.9) * PI / 2); comp = u3 * 36; bx = sp0 - cs - comp; by = gy; phase = 2; }
      bx = M.min(bx, sp0 - cs - comp + (phase === 2 ? 0 : 0));
      K.spring(sp0 - comp, gy - 16, xw, gy - 16, 9, 8, k.ink); K.rect(sp0 - comp - 6, gy - 30, 6, 28, k.ink);
      var c = K.ctx; c.save(); c.translate(bx, by); c.rotate(ang); K.rect(-cs / 2 - 6, -cs, cs + 12, cs, k.orange, k.ink, 3);
      if (phase === 0) { K.arrow(0, -cs / 2, -40, -cs / 2, k.red, 2); K.arrow(0, -cs, 0, -cs - 34, k.blue, 2); K.txt('f', -44, -cs / 2 - 10, { color: k.red, it: true, serif: true }); K.txt('N', 6, -cs - 30, { color: k.blue, it: true, serif: true }); }
      c.restore();
      K.dim(x0 - 2 + 18 * M.sin(th), y0 - 18 * M.cos(th), xb + 18 * M.sin(th) - 4, gy - 18 * M.cos(th), '', k.muted);
      K.txt('L = ' + fm(o.L, 2) + ' m', (x0 + xb) / 2 + 26, (y0 + gy) / 2 + 22, { size: 11, color: k.muted, bg: true });
      K.fbox('friction:  |W_f| = μ(mg cos θ) L', K.narrow ? w / 2 : w * 0.66, K.narrow ? 22 : 30, (x0 + xb) / 2, (y0 + gy) / 2, k.red);
      K.fbox('spring:  ½kx² = ½mv²', K.narrow ? w * 0.7 : w * 0.82, K.narrow ? 62 : 82, sp0 - comp + 20, gy - 18, k.purple);
    }
  });

  // ================================================================== HEAT AND GASES
  // exam-piston-gas  { T1: 300, T2: 390 }
  scene('exam-piston-gas', {
    dur: 5, still: 5, an: 0.95, label: function () { return 'Gas in a cylinder under a heavy piston; as it warms, the piston rises'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, T1 = nm(o.T1, 300), T2 = nm(o.T2, 390), f = ease(t / 4.4), T = T1 + (T2 - T1) * f;
      var cx = K.narrow ? w * 0.36 : w * 0.3, cw = M.min(170, w * 0.4), bot = h - 40, h1 = (bot - 90) * 0.62 * T1 / T2, hp = h1 * T / T1, py = bot - hp;
      K.line(cx - cw / 2, 60, cx - cw / 2, bot, k.ink, 3); K.line(cx + cw / 2, 60, cx + cw / 2, bot, k.ink, 3); K.line(cx - cw / 2, bot, cx + cw / 2, bot, k.ink, 3);
      K.rect(cx - cw / 2 + 2, bot - h1, cw - 4, h1, k.blueSoft);
      if (hp > h1 + 1) K.rect(cx - cw / 2 + 2, py, cw - 4, hp - h1, k.orangeSoft);
      // molecules jiggle faster as T rises
      for (var i = 0; i < 26; i++) { var a = i * 2.39996, sp = 2.5 * M.sqrt(T / 300), mx = cx - cw / 2 + 10 + ((M.sin(a * 3.1) + 1) / 2 * (cw - 20) + t * sp * 40 * M.cos(a)) % (cw - 20), my = py + 8 + (((M.cos(a * 1.7) + 1) / 2 * (hp - 16) + t * sp * 37 * M.sin(a)) % M.max(4, hp - 16));
        mx = mx < cx - cw / 2 + 10 ? mx + cw - 20 : mx; my = my < py + 8 ? my + hp - 16 : my; K.circ(mx, my, 3, k.blue); }
      K.rect(cx - cw / 2 + 3, py - 16, cw - 6, 16, k.muted, k.ink, 2); K.rect(cx - 26, py - 46, 52, 30, k.grid, k.ink, 3); K.txt('M', cx, py - 31, { align: 'center', it: true, serif: true });
      K.arrow(cx + cw / 2 - 16, py - 50, cx + cw / 2 - 16, py - 20, k.purple, 1.8); K.txt('p₀', cx + cw / 2 - 12, py - 54, { color: k.purple, it: true, serif: true });
      K.arrow(cx, py + 4, cx, py + 30, k.red, 2); K.arrow(cx - 30, py + 34, cx - 30, py + 6, k.blue, 2); K.txt('pA', cx - 36, py + 22, { color: k.blue, it: true, serif: true, align: 'right' }); K.txt('Mg', cx + 5, py + 34, { color: k.red, it: true, serif: true });
      // heater glow
      var glow = 0.4 + 0.6 * f; for (var j = 0; j < 4; j++) K.arc(cx - cw * 0.3 + j * cw * 0.2, bot + 14, 8, PI, 2 * PI, k.orange, 2 + glow);
      K.txt('T = ' + fm(T, 0) + ' K', cx + cw / 2 + 10, bot - 10, { color: k.orange, weight: 700 });
      if (hp > h1 + 4) K.dim(cx - cw / 2 - 12, bot - h1, cx - cw / 2 - 12, py, 'Δh', k.orange, -1);
      K.fbox('piston balanced:\np = p₀ + Mg/A', K.narrow ? w * 0.74 : w * 0.72, K.narrow ? 46 : 58, cx + cw / 2 - 4, py - 8, k.blue);
      K.fbox('constant p:  V ∝ T,  W = p ΔV', K.narrow ? w * 0.6 : w * 0.72, K.narrow ? h - 18 : h * 0.66, cx + cw / 2 - 4, py + (hp - h1) / 2, k.orange);
    }
  });

  // exam-pv-cycle  { shape: rect|tri, p1, p2 (Pa), V1, V2 (m³) }
  scene('exam-pv-cycle', {
    dur: 6, loop: true, hold: 0, still: 1.5, an: 0.82, label: function () { return 'A pressure–volume graph of a gas cycle, with a point going around it'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, p1 = nm(o.p1, 1e5), p2 = nm(o.p2, 3e5), V1 = nm(o.V1, 2e-3), V2 = nm(o.V2, 6e-3), tri = o.shape === 'tri';
      var L = 46, B = h - 36, R = w - (K.narrow ? 16 : 230), T = K.narrow ? 136 : 20, X = function (v) { return L + (R - L) * v / (V2 * 1.18); }, Y = function (p) { return B - (B - T) * p / (p2 * 1.2); };
      K.arrow(L, B, R + 6, B, k.axis, 1.6); K.arrow(L, B, L, T - 6, k.axis, 1.6); K.txt('V', R + 4, B - 12, { it: true, serif: true, color: k.muted }); K.txt('p', L + 8, T - 2, { it: true, serif: true, color: k.muted });
      var pts = tri ? [[V1, p1], [V2, p2], [V2, p1]] : [[V1, p1], [V1, p2], [V2, p2], [V2, p1]], sp = pts.map(function (q) { return [X(q[0]), Y(q[1])]; });
      K.poly(sp, null, 0, null, k.greenSoft); K.poly(sp.concat([sp[0]]), k.green, 2.4);
      [[V1, 'V₁'], [V2, 'V₂']].forEach(function (q) { K.line(X(q[0]), B, X(q[0]), B + 4, k.axis, 1); K.txt(q[1] + ' = ' + fm(q[0] * 1e3, 2) + '×10⁻³', X(q[0]), B + 14, { align: 'center', size: 10.5, color: k.muted }); });
      [[p1, 'p₁'], [p2, 'p₂']].forEach(function (q) { K.line(L - 4, Y(q[0]), L, Y(q[0]), k.axis, 1); K.txt(q[1], L - 6, Y(q[0]), { align: 'right', size: 11, color: k.muted }); });
      var names = tri ? 'ABC' : 'ABCD'; sp.forEach(function (q, i) { K.circ(q[0], q[1], 3.5, k.ink); K.txt(names[i], q[0] + (i === 0 ? -14 : 8), q[1] + (q[1] < (B + T) / 2 ? -10 : 12), { weight: 700 }); });
      for (var i = 0; i < sp.length; i++) { var a = sp[i], b = sp[(i + 1) % sp.length]; K.arrow(a[0] + (b[0] - a[0]) * 0.4, a[1] + (b[1] - a[1]) * 0.4, a[0] + (b[0] - a[0]) * 0.58, a[1] + (b[1] - a[1]) * 0.58, k.green, 2.2); }
      var u = (t / 6) * sp.length % sp.length, s = M.floor(u), f = u - s, A = sp[s], Bq = sp[(s + 1) % sp.length]; K.circ(A[0] + (Bq[0] - A[0]) * f, A[1] + (Bq[1] - A[1]) * f, 7, k.orange, k.ink, 1.2);
      K.txt('p₁ = ' + fm(p1 / 1e5, 2) + '×10⁵ Pa,  p₂ = ' + fm(p2 / 1e5, 2) + '×10⁵ Pa', K.narrow ? L : R + 14, K.narrow ? T - 22 : B - 30, { size: 10.5, color: k.muted });
      var cxa = (X(V1) + X(V2)) / 2, cya = tri ? (Y(p1) * 2 + Y(p2)) / 3 : (Y(p1) + Y(p2)) / 2;
      K.fbox('net work  W = area inside', K.narrow ? w / 2 : R + 110, K.narrow ? 18 : T + 30, cxa + (tri ? 20 : 0), cya, k.green);
      K.fbox('monatomic:  U = (3/2) pV', K.narrow ? w * 0.32 : R + 110, K.narrow ? 56 : T + 90, (sp[0][0] + sp[1][0]) / 2, (sp[0][1] + sp[1][1]) / 2, k.orange);
      K.fbox('Q = ΔU + W', K.narrow ? w * 0.78 : R + 110, K.narrow ? 56 : T + 150, null, null, k.orange);
    }
  });

  // ================================================================== WAVES AND SOUND
  // exam-two-speakers  { s: 3, x: 4 }
  scene('exam-two-speakers', {
    dur: 4, loop: true, hold: 0, still: 2, an: 0.95, label: function () { return 'Two speakers sending out circular sound waves toward a listener'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, s = nm(o.s, 3), x = nm(o.x, 4), F = K.fit(-0.4, x + 0.8, -0.6, s + 0.6, { x: 70, y: 16, w: w - 90, h: h - 70 });
      var S1 = [F.X(0), F.Y(0)], S2 = [F.X(0), F.Y(s)], P = [F.X(x), F.Y(0)], lam = F.s * M.min(s, x) / 3.2;
      K.ctx.save(); K.ctx.beginPath(); K.ctx.rect(0, 0, w, h); K.ctx.clip();
      [S1, S2].forEach(function (S, i) { for (var n = 0; n < 16; n++) { var rr = (n + (t / 4) * 4 % 1) * lam; K.circ(S[0], S[1], rr, null, i ? k.purpleSoft : k.blueSoft, 2); } });
      K.ctx.restore();
      K.line(S1[0], S1[1], P[0], P[1], k.blue, 2); K.line(S2[0], S2[1], P[0], P[1], k.purple, 2);
      K.rect(S1[0] - 12, S1[1] - 9, 12, 18, k.ink); K.rect(S2[0] - 12, S2[1] - 9, 12, 18, k.ink); K.txt('S₁', S1[0] - 16, S1[1], { align: 'right' }); K.txt('S₂', S2[0] - 16, S2[1], { align: 'right' });
      K.poly([[S1[0] + 10, S1[1]], [S1[0] + 10, S1[1] - 10], [S1[0], S1[1] - 10]], k.muted, 1);
      K.circ(P[0], P[1], 6, k.orange, k.ink); K.txt('P', P[0] + 10, P[1] + 2, { weight: 700 });
      K.dim(S1[0] - 34, S1[1], S1[0] - 34, S2[1], 's = ' + fm(s, 2) + ' m', k.muted, -1); K.txt('x = ' + fm(x, 2) + ' m', (S1[0] + P[0]) / 2, S1[1] + 16, { align: 'center', color: k.blue, size: 11 });
      K.txt('L₂', (S2[0] + P[0]) / 2 + 6, (S2[1] + P[1]) / 2 - 10, { color: k.purple, it: true, serif: true });
      K.fbox('path difference:  Δ = L₂ − L₁', K.narrow ? w / 2 : w * 0.66, K.narrow ? h - 46 : 26, P[0] - 8, P[1] - 4, k.purple);
      K.fbox('loud: Δ = mλ    quiet: Δ = (m + ½)λ', K.narrow ? w / 2 : w * 0.5, h - 16, null, null, k.gold);
    }
  });

  // exam-doppler-wall  { u: 15, mode: behind|driver }
  scene('exam-doppler-wall', {
    dur: 5, loop: true, hold: 0, still: 3, label: function () { return 'A vehicle with a siren driving toward a cliff; its sound waves bunch up ahead and spread out behind'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, gy = h * 0.62, xw = w - 30, vs = 120, uu = vs * M.min(0.45, nm(o.u, 15) / 340 * 6), Tp = 0.36, x0 = w * 0.18;
      K.rect(xw, 16, w - xw, gy - 16, k.grid, k.muted); K.txt('cliff', xw - 4, 26, { align: 'right', size: 11, color: k.muted }); K.hatch(0, gy, w, k.ink);
      var tt = t % 5, xs = x0 + uu * tt;
      K.ctx.save(); K.ctx.beginPath(); K.ctx.rect(0, 0, xw, gy); K.ctx.clip();
      for (var n = 0; n * Tp <= tt; n++) { var te = n * Tp, xe = x0 + uu * te, rr = vs * (tt - te); if (rr > 0) K.circ(xe, gy - 22, rr, null, k.blue, 1.6);
        var reach = xw - xe; if (rr > reach) K.circ(2 * xw - xe, gy - 22, rr, null, k.purple, 1.3); }
      K.ctx.restore();
      K.rect(xs - 26, gy - 30, 52, 22, k.red, k.ink, 5); K.circ(xs - 14, gy - 6, 5, k.ink); K.circ(xs + 14, gy - 6, 5, k.ink); K.rect(xs - 6, gy - 37, 12, 7, k.gold);
      K.arrow(xs, gy - 50, xs + 36, gy - 50, k.green, 2); K.txt('u = ' + fm(o.u, 1) + ' m/s', xs, gy - 62, { align: 'center', color: k.green, size: 11 });
      if (o.mode !== 'driver') { K.person(14, gy, 0.9); K.txt('hiker', 26, gy + 14, { size: 10.5, color: k.muted }); }
      K.fbox('ahead (toward the cliff):  f′ = f · v/(v − u)', K.narrow ? w / 2 : w * 0.62, gy + 30, xw - 30, gy - 22, k.blue);
      K.fbox(o.mode === 'driver' ? 'the cliff re-sends what it gets;\nthe driver moves toward it:  f″ = f′ · (v + u)/v' : 'behind:  f′ = f · v/(v + u)\nthe echo comes back at the cliff\'s f′', K.narrow ? w / 2 : w * 0.4, h - 24, o.mode === 'driver' ? xs : 30, gy - 30, k.purple);
    }
  });

  // exam-string-pulley  { n: 3 }
  scene('exam-string-pulley', {
    dur: 4, loop: true, hold: 0, still: 0.15, label: function () { return 'A string from a vibrator over a pulley to a hanging mass, vibrating in loops'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, n = M.max(1, M.round(nm(o.n, 3))), x0 = 46, x1 = w - 56, y = h * 0.36, A = M.min(36, h * 0.12), ph = M.cos(2 * PI * t / 0.8);
      K.rect(8, y - 22, 34, 44, k.grid, k.ink, 4); K.txt('f', 25, y, { align: 'center', it: true, serif: true }); K.circ(x1 + 12, y + 12, 12, null, k.ink, 2); K.circ(x1 + 12, y + 12, 3, k.ink);
      K.line(x1 + 24, y + 12, x1 + 24, h * 0.72, k.ink, 1.6); K.rect(x1 + 6, h * 0.72, 36, 36, k.purple, k.ink, 4); K.txt('M', x1 + 24, h * 0.72 + 18, { align: 'center', color: '#fff', it: true, serif: true });
      var pts = [], env1 = [], env2 = []; for (var i = 0; i <= 160; i++) { var u = i / 160, xx = x0 + (x1 - x0) * u, s = M.sin(n * PI * u); pts.push([xx, y - A * s * ph]); env1.push([xx, y - A * s]); env2.push([xx, y + A * s]); }
      K.poly(env1, k.grid, 1, [3, 3]); K.poly(env2, k.grid, 1, [3, 3]); K.poly(pts, k.blue, 2.4);
      for (i = 0; i <= n; i++) K.circ(x0 + (x1 - x0) * i / n, y, 3.5, k.ink);
      K.dim(x0, y + A + 18, x1, y + A + 18, 'L', k.muted, 1); var lx = x0 + (x1 - x0) / n; K.dim(x0, y - A - 14, lx, y - A - 14, 'λ/2', k.gold, -1);
      K.arrow(x1 + 24, h * 0.72 + 40, x1 + 24, h * 0.72 + 64 > h - 4 ? h - 4 : h * 0.72 + 64, k.red, 2);
      K.fbox('tension T = Mg,  v = √(T/μ)', K.narrow ? w * 0.48 : w * 0.6, h - 30, x1 + 6, h * 0.72 + 18, k.purple);
      K.fbox(n + ' loops:  L = ' + n + ' · λ/2,   f = v/λ', K.narrow ? w * 0.48 : w * 0.3, K.narrow ? 20 : 22, (x0 + lx) / 2, y - A - 14, k.gold);
    }
  });

  // ================================================================== OPTICS
  // exam-convex-lens  { f: 15, d: 25, h: 2 }
  scene('exam-convex-lens', {
    dur: 3.5, label: function () { return 'An object, a convex lens and the rays that form its image'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, f = nm(o.f, 15), d = nm(o.d, 25), ho = nm(o.h, 2), di = 1 / (1 / f - 1 / d), hi = -ho * di / d, virt = di < 0;
      var xl = M.min(-d, di, -f) * 1.15 - 2, xr = M.max(virt ? f : di, f) * 1.2 + 2, yy = M.max(ho, M.abs(hi)) * 1.35;
      var sxl = (w - 16) / (xr - xl), syl = (h - 56) / (2 * yy), F = { s: syl, X: function (x) { return 8 + (x - xl) * sxl; }, Y: function (y) { return 8 + (yy - y) * syl; } }, ay = F.Y(0), lx = F.X(0);
      K.line(4, ay, w - 4, ay, k.axis, 1); K.ctx.save(); K.ctx.strokeStyle = k.teal; K.ctx.fillStyle = k.tealSoft; K.ctx.lineWidth = 2; K.ctx.beginPath(); var lh = F.s * yy * 0.9; K.ctx.ellipse(lx, ay, 9, lh, 0, 0, 2 * PI); K.ctx.fill(); K.ctx.stroke(); K.ctx.restore();
      [-f, f].forEach(function (x) { K.circ(F.X(x), ay, 3.5, k.ink); K.txt('F', F.X(x), ay + 13, { align: 'center', size: 11 }); });
      var ox = F.X(-d), oy = F.Y(ho); K.arrow(ox, ay, ox, oy, k.orange, 3); K.txt('object', ox, ay + 26, { align: 'center', size: 10.5, color: k.muted });
      // three principal rays; each draws in over the run
      var ix = F.X(di), iy = F.Y(hi), p = ease(t / 3);
      var R1 = [[ox, oy], [lx, oy], [virt ? lx + (lx - ix) * 1.6 : ix, virt ? oy + (oy - iy) * 1.6 : iy]];   // parallel, then through F
      var R2 = [[ox, oy], [lx, ay], [virt ? lx + (lx - ox) * 1.5 : ix, virt ? ay + (ay - oy) * 1.5 : iy]];   // straight through the center
      var y3 = F.Y(ho * f / (f - d)), R3 = d !== f ? [[ox, oy], [lx, y3], [virt ? w : ix, virt ? y3 : iy]] : null;   // toward F, then parallel
      [[R1, k.red], [R2, k.blue], [R3, k.green]].forEach(function (rc, i) { if (!rc[0] || M.abs(y3 - ay) > h * 1.2 && i === 2) return; var pts = rc[0], L1 = M.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), L2 = M.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]), s = p * (L1 + L2);
        if (s <= L1) K.line(pts[0][0], pts[0][1], pts[0][0] + (pts[1][0] - pts[0][0]) * s / L1, pts[0][1] + (pts[1][1] - pts[0][1]) * s / L1, rc[1], 1.8);
        else { K.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], rc[1], 1.8); var q = (s - L1) / L2; K.line(pts[1][0], pts[1][1], pts[1][0] + (pts[2][0] - pts[1][0]) * q, pts[1][1] + (pts[2][1] - pts[1][1]) * q, rc[1], 1.8);
          if (virt && q > 0.2) K.line(pts[1][0], pts[1][1], ix, iy, rc[1], 1, [4, 4]); } });
      if (p >= 1) { K.ctx.save(); if (virt) K.ctx.setLineDash([5, 4]); K.arrow(ix, ay, ix, iy, k.purple, 2.6); K.ctx.restore(); K.txt('image', ix, (iy < ay ? iy - 10 : iy + 12), { align: 'center', size: 10.5, color: k.purple }); }
      K.txt('f = ' + fm(f, 1) + ' cm', lx + 8, F.Y(-yy * 0.85), { size: 11, color: k.teal });
      K.dim(ox, h - 40, lx, h - 40, 'd₀ = ' + fm(d, 1) + ' cm', k.muted, 1);
      K.fbox('1/d₀ + 1/dᵢ = 1/f', K.narrow ? w * 0.72 : lx + 120, 22, lx, F.Y(yy * 0.85), k.teal);
      K.fbox('m = −dᵢ/d₀', K.narrow ? w * 0.75 : w - 80, h - 16, ix, iy, k.purple);
    }
  });

  // exam-pool-light  { n: 1.33, D: 2, a1: 30 }
  scene('exam-pool-light', {
    dur: 3.5, label: function () { return 'A lamp at the bottom of a pool sending rays to the surface; some escape, others reflect back'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, n = nm(o.n, 1.33), Dm = nm(o.D, 2), a1 = rad(nm(o.a1, 30)), tc = M.asin(1 / n), sy = h * 0.34, by = h - 22, Dp = by - sy, lx = w / 2;
      K.rect(0, sy, w, by - sy, k.blueSoft); K.line(0, sy, w, sy, k.blue, 1.6); K.hatch(0, by, w, k.ink);
      var rpx = Dp * M.tan(tc); K.line(lx - rpx, sy, lx + rpx, sy, k.gold, 5); K.txt('bright circle', lx, sy - 12, { align: 'center', size: 10.5, color: k.gold, bg: true });
      var p = ease(t / 3);
      for (var i = -7; i <= 7; i++) { var a = i / 7 * 1.25, ax = lx + Dp * M.tan(a) * p, ay = by - Dp * p, out = M.abs(a) < tc; if (M.abs(a) > 1.2) continue;
        K.line(lx, by, ax, ay, out ? k.orange : k.muted, out ? 1.6 : 1.2);
        if (p >= 1) { var sx = lx + Dp * M.tan(a); if (out) { var b = M.asin(n * M.sin(M.abs(a))) * M.sign(a); K.line(sx, sy, sx + 70 * M.sin(b), sy - 70 * M.cos(b), k.orange, 1.6); } else K.line(sx, sy, sx + 50 * M.sin(a), sy + 50 * M.cos(a), k.muted, 1.1, [3, 3]); } }
      // the highlighted ray at a1
      var hx = lx + Dp * M.tan(a1); K.line(lx, by, lx + (hx - lx) * p, by - Dp * p, k.red, 2.6);
      if (p >= 1) { var b1 = M.asin(n * M.sin(a1)); K.line(hx, sy, hx + 80 * M.sin(b1), sy - 80 * M.cos(b1), k.red, 2.6); K.line(hx, sy - 60, hx, sy + 60, k.muted, 1, [4, 4]); K.txt('θ₁', hx + 4, sy + 34, { color: k.red, it: true, serif: true, size: 11 }); K.txt('θ₂', hx + 8, sy - 30, { color: k.red, it: true, serif: true, size: 11 }); }
      K.circ(lx, by - 4, 6, k.gold, k.ink); K.dim(K.narrow ? 16 : 30, sy, K.narrow ? 16 : 30, by, 'D = ' + fm(Dm, 2) + ' m', k.muted, 1);
      K.txt('n = ' + fm(n, 2), w - 12, by - 14, { align: 'right', color: k.blue, size: 11 }); K.txt('air, n = 1.00', w - 12, sy - 26 > 12 ? 14 : 14, { align: 'right', color: k.muted, size: 11 });
      K.fbox('n sin θ₁ = 1.00 sin θ₂', K.narrow ? w * 0.7 : hx + 150, K.narrow ? 46 : 40, hx, sy, k.red);
      K.fbox('edge: sin θc = 1/n,  r = D tan θc', K.narrow ? w / 2 : lx - rpx - 40, K.narrow ? sy + Dp * 0.62 : sy + Dp * 0.5, lx - rpx, sy, k.gold);
    }
  });

  // exam-double-slit  { lam: 600 (nm), d: 0.3 (mm), L: 1.5 (m) }
  function waveColor(nmv) { var l = nmv; if (l < 440) return '#7048e8'; if (l < 490) return '#1c6fd6'; if (l < 510) return '#0c8599'; if (l < 570) return '#2f9e44'; if (l < 590) return '#e0a800'; if (l < 620) return '#e8590c'; return '#e03131'; }
  scene('exam-double-slit', {
    dur: 4, loop: true, hold: 0, still: 2.5, label: function () { return 'Light waves passing two slits and making bright and dark fringes on a screen'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, col = waveColor(nm(o.lam, 600)), bx = w * 0.26, sx = w - (K.narrow ? 70 : 110), cy = h * 0.46, sep = M.min(46, h * 0.14), lamp = 16, ph = (t / 1) % 1;
      for (var x = 8 + ph * lamp; x < bx; x += lamp) K.line(x, cy - 60, x, cy + 60, col, 1.4);
      K.ctx.save(); K.ctx.beginPath(); K.ctx.rect(bx, 0, sx - bx, h); K.ctx.clip(); K.ctx.globalAlpha = 0.3;
      [cy - sep / 2, cy + sep / 2].forEach(function (yy) { for (var r = ph * lamp; r < sx - bx + 40; r += lamp) { K.ctx.beginPath(); K.ctx.arc(bx, yy, r, -PI / 2, PI / 2); K.ctx.strokeStyle = col; K.ctx.lineWidth = 1.1; K.ctx.stroke(); } });
      K.ctx.restore();
      K.rect(bx - 4, 10, 8, cy - sep / 2 - 4 - 10, k.ink); K.rect(bx - 4, cy - sep / 2 + 4, 8, sep - 8, k.ink); K.rect(bx - 4, cy + sep / 2 + 4, 8, h - 40 - cy - sep / 2, k.ink);
      // screen with fringes (spacing drawn schematically), and the intensity curve
      var fy = M.min(30, h * 0.09); K.rect(sx, 10, 8, h - 50, k.grid, k.muted);
      for (var y = 12; y < h - 42; y += 2) { var I = M.pow(M.cos(PI * (y - cy) / fy), 2); K.ctx.save(); K.ctx.globalAlpha = I; K.ctx.fillStyle = col; K.ctx.fillRect(sx, y, 8, 2); K.ctx.restore(); }
      var pts = []; for (y = 12; y < h - 42; y += 2) pts.push([sx + 14 + 34 * M.pow(M.cos(PI * (y - cy) / fy), 2), y]); K.poly(pts, col, 1.6);
      K.dim(sx - 10, cy, sx - 10, cy + fy, 'Δy', k.ink, -1);
      K.dim(bx - 16, cy - sep / 2, bx - 16, cy + sep / 2, 'd = ' + fm(o.d, 2) + ' mm', k.muted, -1);
      K.dim(bx, h - 30, sx, h - 30, 'L = ' + fm(o.L, 2) + ' m', k.muted, 1);
      K.txt('λ = ' + fm(o.lam, 0) + ' nm', 10, 22, { color: col, size: 11 });
      K.fbox('fringe spacing  Δy = λL/d', K.narrow ? w * 0.5 : sx - 120, K.narrow ? h - 56 : 26, sx - 10, cy + fy / 2, k.gold);
      K.fbox('bright: d sin θ = mλ', K.narrow ? w * 0.6 : bx + 130, K.narrow ? 22 : h - 60, bx + 4, cy + sep / 2, k.purple);
    }
  });

  // ================================================================== ELECTRICITY AND MAGNETISM
  // exam-capacitor-circuit  { E, R1, R2, C (μF) }
  scene('exam-capacitor-circuit', {
    dur: 5, still: 5, label: function () { return 'A circuit with a battery, a switch, a resistor in series and a resistor and capacitor side by side'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, L = 30, R = w - 30, T = 40, B = h - 34, xm = L + (R - L) * 0.5, x2 = L + (R - L) * 0.62, x3 = R - 10, closed = t > 0.5, q = closed ? 1 - M.exp(-(t - 0.5) / 1.1) : 0;
      function res(x1, y1, x2_, y2) { var vert = x1 === x2_; if (vert) { K.line(x1, y1, x1, y1 + (y2 - y1) * 0.3, k.ink, 2); K.spring(x1, y1 + (y2 - y1) * 0.3, x1, y1 + (y2 - y1) * 0.7, 6, 7, k.ink); K.line(x1, y1 + (y2 - y1) * 0.7, x1, y2, k.ink, 2); } else { K.line(x1, y1, x1 + (x2_ - x1) * 0.3, y1, k.ink, 2); K.spring(x1 + (x2_ - x1) * 0.3, y1, x1 + (x2_ - x1) * 0.7, y1, 6, 7, k.ink); K.line(x1 + (x2_ - x1) * 0.7, y1, x2_, y2, k.ink, 2); } }
      // battery on the left
      var by = (T + B) / 2; K.line(L, T, L, by - 10, k.ink, 2); K.line(L, by + 10, L, B, k.ink, 2); K.line(L - 14, by - 10, L + 14, by - 10, k.ink, 2.5); K.line(L - 7, by + 6, L + 7, by + 6, k.ink, 4);
      K.txt('E = ' + fm(o.E, 1) + ' V', L + 18, by, { size: 11 });
      // switch, R1 along the top, then the two branches
      var sw0 = L + 40; K.line(L, T, sw0, T, k.ink, 2); K.circ(sw0, T, 3, k.ink); var sa = closed ? 0 : -0.5; K.line(sw0, T, sw0 + 34 * M.cos(sa), T + 34 * M.sin(sa), k.ink, 2); K.circ(sw0 + 34, T, 3, k.ink); K.txt('S', sw0 + 14, T - 16, { weight: 700 });
      res(sw0 + 34, T, x2, T); K.txt('R₁ = ' + fm(o.R1, 0) + ' Ω', (sw0 + 34 + x2) / 2, T + 18, { align: 'center', size: 11 });
      K.line(x2, T, x3, T, k.ink, 2); K.line(L, B, x3, B, k.ink, 2);
      res(x2, T, x2, B); K.txt('R₂ = ' + fm(o.R2, 0) + ' Ω', x2 - 10, (T + B) / 2, { align: 'right', size: 11 });
      var cyp = (T + B) / 2; K.line(x3, T, x3, cyp - 6, k.ink, 2); K.line(x3, cyp + 6, x3, B, k.ink, 2); K.line(x3 - 16, cyp - 6, x3 + 16, cyp - 6, k.ink, 3); K.line(x3 - 16, cyp + 6, x3 + 16, cyp + 6, k.ink, 3);
      K.txt('C = ' + fm(o.C, 0) + ' μF', x3 - 20, cyp + 26, { align: 'right', size: 11 });
      if (q > 0.05) { var nq = M.round(q * 4); for (var i = 0; i < nq; i++) { K.txt('+', x3 - 12 + i * 8, cyp - 14, { size: 11, color: k.red, weight: 800 }); K.txt('−', x3 - 12 + i * 8, cyp + 16, { size: 11, color: k.blue, weight: 800 }); } }
      // moving charges: the capacitor branch carries current early on, R2's branch later
      if (closed) { var tt = t - 0.5, Ic = M.exp(-tt / 1.1), Ir2 = 1 - Ic, dots = function (pts, amt, col) { if (amt < 0.04) return; var Lt = 0, seg = []; for (var j = 1; j < pts.length; j++) { var l = M.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); seg.push(l); Lt += l; }
        for (var s = (tt * 60 * amt) % 22; s < Lt; s += 22) { var a = s, j2 = 0; while (a > seg[j2]) { a -= seg[j2]; j2++; } var f = a / seg[j2]; K.circ(pts[j2][0] + (pts[j2 + 1][0] - pts[j2][0]) * f, pts[j2][1] + (pts[j2 + 1][1] - pts[j2][1]) * f, 2.6, col); } };
        dots([[L, B], [L, T], [x2, T]], 1, k.orange); dots([[x2, T], [x3, T], [x3, cyp - 8]], Ic, k.orange); dots([[x3, cyp + 8], [x3, B], [x2, B]], Ic, k.orange); dots([[x2, T], [x2, B]], Ir2 * 0.9 + 0.1 * Ir2, k.orange); dots([[x2, B], [L, B]], 1, k.orange); }
      var early = closed && t < 2.2;
      K.fbox(early ? 'just closed: uncharged C\nacts like a plain wire' : closed ? 'charged C: no current\nthrough it, V_C = V across R₂' : 'switch open', K.narrow ? w * 0.66 : w * 0.8, K.narrow ? h - 22 : h - 30, x3, cyp, k.purple);
      K.fbox('Q = C V_C,   U = ½ C V_C²', K.narrow ? w * 0.6 : w * 0.44, K.narrow ? 16 : 16, x3 - 4, cyp - 8, k.gold);
    }
  });

  // exam-deflecting-plates  { top: true (upper plate +), len, d (cm), V }
  scene('exam-deflecting-plates', {
    dur: 3, label: function () { return 'An electron bending along a curved path between two charged plates'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, top = o.top !== false, x0 = w * 0.18, x1 = w * 0.62, cy = h * 0.46, gap = M.min(120, h * 0.34), yd = gap * 0.36 * (top ? -1 : 1), up = cy - gap / 2, dn = cy + gap / 2;
      K.rect(x0, up - 10, x1 - x0, 10, top ? k.red : k.blue); K.rect(x0, dn, x1 - x0, 10, top ? k.blue : k.red);
      K.txt(top ? '+' : '−', x0 - 10, up - 5, { align: 'right', weight: 800, color: top ? k.red : k.blue, size: 14 }); K.txt(top ? '−' : '+', x0 - 10, dn + 5, { align: 'right', weight: 800, color: top ? k.blue : k.red, size: 14 });
      for (var i = 1; i < 6; i++) { var fx = x0 + (x1 - x0) * i / 6; if (top) K.arrow(fx, up + 4, fx, dn - 4, k.grid, 1.2); else K.arrow(fx, dn - 4, fx, up + 4, k.grid, 1.2); }
      K.txt('E', x0 + (x1 - x0) / 12 + 8, cy + gap * 0.28 * (top ? 1 : -1), { color: k.muted, it: true, serif: true });
      var p = ease(t / 2.6), xe = 10 + (w - 20) * p, path = [];
      for (var x = 10; x <= xe; x += 3) { var y; if (x < x0) y = cy; else if (x < x1) { var u = (x - x0) / (x1 - x0); y = cy + yd * u * u; } else y = cy + yd + 2 * yd * (x - x1) / (x1 - x0); path.push([x, y]); }
      if (path.length) { K.poly(path, k.purple, 2.2); var e = path[path.length - 1]; K.circ(e[0], e[1], 6, k.blue, k.ink); K.txt('e⁻', e[0], e[1] - 14, { align: 'center', size: 11, color: k.blue }); }
      K.line(x1, cy, w - 10, cy, k.muted, 1, [4, 4]); K.dim(x1 + 10, cy, x1 + 10, cy + yd, 'y', k.purple, 1);
      K.dim(x0, dn + 24, x1, dn + 24, 'ℓ = ' + fm(o.len, 1) + ' cm', k.muted, 1); K.dim(x1 + 36, up, x1 + 36, dn, 'd = ' + fm(o.d, 1) + ' cm', k.muted, 1);
      K.arrow(14, cy - 16, 48, cy - 16, k.green, 2); K.txt('v₀', 52, cy - 16, { color: k.green, it: true, serif: true });
      K.txt('V = ' + fm(o.V, 0) + ' V', x0, up - 24, { size: 11 });
      K.fbox('E = V/d,   a = eE/m', K.narrow ? w * 0.6 : w * 0.5, K.narrow ? h - 50 : h - 22, x0 + (x1 - x0) * 0.5, cy + 10, k.gold);
      K.fbox('along: t = ℓ/v₀    across: y = ½at²', K.narrow ? w * 0.5 : w * 0.66, 18, x1 + 10, cy + yd / 2, k.purple);
    }
  });

  // exam-mass-spectrometer  { V, B }
  scene('exam-mass-spectrometer', {
    dur: 4, still: 4, an: 0.95, label: function () { return 'Ions sped up between two plates, then bent into a half circle by a magnetic field'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, bx = w * (K.narrow ? 0.4 : 0.36), ey = h * 0.82, r = M.min((h - 50) * 0.42, (w - bx - 20) * 0.46);
      K.rect(bx, 10, w - bx - 8, h - 20, k.purpleSoft); for (var gx = bx + 16; gx < w - 10; gx += 26) for (var gy = 22; gy < h - 12; gy += 26) K.txt('×', gx, gy, { size: 11, color: k.purple, align: 'center' });
      K.txt('B = ' + fm(o.B, 2) + ' T (into the page)', w - 12, 18, { align: 'right', size: 11, color: k.purple, bg: true });
      var p1 = 18, p2 = bx * 0.5; K.rect(p1, ey - 34, 7, 68, k.red); K.rect(p2, ey - 34, 7, 68, k.blue); K.line(p2 + 3, ey - 4, p2 + 3, ey + 4, k.bg, 3);
      K.txt('V = ' + fm(o.V, 0) + ' V', (p1 + p2) / 2, ey - 44, { align: 'center', size: 11 }); K.line(bx, ey - 3, bx, ey + 3, k.ink, 1);
      K.rect(bx - 4, ey - 2 * r - 14, 8, 2 * r + 4, k.grid, k.muted); K.txt('detector', bx - 8, ey - 2 * r - 6, { align: 'right', size: 10.5, color: k.muted });
      var ph = ease(t / 3.6), x, y, path = [[p1 + 10, ey]];
      if (ph < 0.35) { var u = ph / 0.35; x = p1 + 10 + (bx - p1 - 10) * u * u; y = ey; path.push([x, y]); }
      else { path.push([bx, ey]); var a = (ph - 0.35) / 0.65 * PI; for (var j = 0; j <= 40; j++) { var aa = a * j / 40; path.push([bx + r * M.sin(aa), ey - r + r * M.cos(aa)]); } x = bx + r * M.sin(a); y = ey - r + r * M.cos(a); }
      K.poly(path, k.orange, 2.2); K.circ(x, y, 6, k.orange, k.ink); K.txt('+', x, y, { align: 'center', size: 10, color: '#fff', weight: 800 });
      if (ph > 0.6) { K.line(bx, ey - r, bx + r * M.sin(1), ey - r + r * M.cos(1), k.muted, 1.2, [3, 3]); K.txt('r', bx + r * 0.42, ey - r + r * 0.32, { it: true, serif: true, color: k.muted }); }
      K.fbox('speed up:  qV = ½mv²', K.narrow ? w * 0.3 : bx * 0.5 + 10, K.narrow ? h * 0.42 : ey - 84, (p1 + p2) / 2, ey, k.red);
      K.fbox('qvB = mv²/r  →  r = mv/(qB)', K.narrow ? w * 0.62 : bx + r + 60, K.narrow ? 44 : 50, bx + r * 0.5, ey - r, k.purple);
    }
  });

  // exam-sliding-rod  { into: true, right: true }
  scene('exam-sliding-rod', {
    dur: 4, loop: true, hold: 0, still: 2, label: function () { return 'A metal rod sliding along two rails in a magnetic field, the rails joined by a resistor'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, into = o.into !== false, right = o.right !== false, T = h * 0.24, B = h * 0.72, L = 40, xmin = w * 0.4, xmax = w - 40;
      var u = (t / 4) % 1, xr = right ? xmin + (xmax - xmin) * u : xmax - (xmax - xmin) * u;
      for (var gx = L + 26; gx < w - 10; gx += 30) for (var gy = T + 22; gy < B - 6; gy += 28) { if (into) K.txt('×', gx, gy, { size: 12, color: k.purple, align: 'center' }); else { K.circ(gx, gy, 4, null, k.purple, 1.2); K.circ(gx, gy, 1.2, k.purple); } }
      K.line(L, T, w - 8, T, k.ink, 3); K.line(L, B, w - 8, B, k.ink, 3); K.line(L, T, L, T + (B - T) * 0.3, k.ink, 2); K.spring(L, T + (B - T) * 0.3, L, T + (B - T) * 0.7, 6, 8, k.ink); K.line(L, T + (B - T) * 0.7, L, B, k.ink, 2);
      K.txt('R', L - 10, (T + B) / 2, { align: 'right', it: true, serif: true });
      K.ctx.save(); K.ctx.fillStyle = k.orangeSoft; K.ctx.fillRect(L + 2, T + 2, xr - L - 4, B - T - 4); K.ctx.restore();
      K.rect(xr - 5, T - 10, 10, B - T + 20, k.gold, k.ink, 3);
      K.arrow(xr, T - 22, xr + (right ? 40 : -40), T - 22, k.green, 2.2); K.txt('v', xr + (right ? 46 : -46), T - 22, { color: k.green, it: true, serif: true, align: right ? 'left' : 'right' });
      K.dim(xr + 18, T, xr + 18, B, 'L', k.muted, 1);
      K.txt('B ' + (into ? 'into' : 'out of') + ' the page', w - 10, B + 18, { align: 'right', size: 11, color: k.purple });
      if (!o.quiet) { var ccw = (right ? 1 : -1) * (into ? 1 : -1) > 0, pts = ccw ? [[xr, B], [xr, T], [L, T], [L, B], [xr, B]] : [[xr, T], [xr, B], [L, B], [L, T], [xr, T]];
        var Lt = 2 * (xr - L) + 2 * (B - T); for (var s = (t * 50) % 26; s < Lt; s += 26) { var a = s, j = 0; while (j < 3) { var l = M.hypot(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]); if (a <= l) break; a -= l; j++; } var l2 = M.hypot(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]) || 1; K.circ(pts[j][0] + (pts[j + 1][0] - pts[j][0]) * a / l2, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * a / l2, 2.6, k.red); }
        K.arrow(xr, (T + B) / 2, xr + (right ? -36 : 36), (T + B) / 2, k.red, 2); K.txt('F = ILB', xr + (right ? -40 : 40), (T + B) / 2 - 12, { color: k.red, size: 11, align: right ? 'right' : 'left' }); }
      K.fbox('ε = BLv,   I = ε/R', K.narrow ? w * 0.5 : w * 0.3, 18, xr, T + (B - T) * 0.3, k.gold);
      K.fbox('force on the current:  F = ILB (opposes v)', K.narrow ? w * 0.5 : w * 0.55, h - 16, xr, B - 10, k.red);
    }
  });

  // ================================================================== ATOMS AND LIGHT
  // exam-photoelectric  { lam: 300 (nm) }
  scene('exam-photoelectric', {
    dur: 3, loop: true, hold: 0, still: 1.6, label: function () { return 'Light striking a metal plate and knocking out electrons that fly toward a collector'; },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, px = w * 0.3, cx = w * 0.72, top = h * 0.18, bot = h * 0.72, col = waveColor(nm(o.lam, 300));
      K.rect(px - 10, top, 10, bot - top, k.muted, k.ink); K.rect(cx, top, 10, bot - top, k.grid, k.ink); K.txt('metal', px - 5, bot + 14, { align: 'center', size: 10.5, color: k.muted }); K.txt('collector', cx + 5, bot + 14, { align: 'center', size: 10.5, color: k.muted });
      K.line(px - 5, bot, px - 5, h - 18, k.ink, 1.6); K.line(cx + 5, bot, cx + 5, h - 18, k.ink, 1.6); K.line(px - 5, h - 18, (px + cx) / 2 - 10, h - 18, k.ink, 1.6); K.line((px + cx) / 2 + 10, h - 18, cx + 5, h - 18, k.ink, 1.6);
      K.line((px + cx) / 2 - 10, h - 30, (px + cx) / 2 - 10, h - 6, k.ink, 2.5); K.line((px + cx) / 2 + 10, h - 24, (px + cx) / 2 + 10, h - 12, k.ink, 4); K.txt('V', (px + cx) / 2, h - 40, { align: 'center', it: true, serif: true });
      // photons: wavy packets flying into the plate
      for (var i = 0; i < 3; i++) { var u = ((t / 1.5) + i / 3) % 1, hy = top + (bot - top) * (0.25 + 0.25 * i), sx = 10 + (px - 26 - 10) * u, sy = hy - (1 - u) * (bot - top) * 0.35, pts = [];
        for (var s2 = -16; s2 <= 16; s2 += 2) pts.push([sx + s2 * 0.8, sy + s2 * 0.35 * (bot - top) / (px - 36) + 4 * M.sin(s2 * 0.8)]); K.poly(pts, col, 2); }
      K.txt('λ = ' + fm(o.lam, 0) + ' nm', 12, 16, { color: col, size: 11 });
      // electrons: x = vτ − τ²/2 across a gap of 1 (the slowing field); v² > 2 reaches the collector, slower ones turn back
      [1.15, 1.6, 0.9, 1.3, 1.5].forEach(function (v, j) { var tau = (((t / 1.5) + j / 5) % 1) * 2 * v, x = v * tau - tau * tau / 2; if (x > 1) x = 1; if (x < 0) return; var vel = v - tau, ex = px + 6 + (cx - px - 12) * x, ey = top + (bot - top) * (0.15 + j * 0.17);
        if (x < 1) K.arrow(ex, ey, ex + vel * 18, ey, k.blue, 1.4); K.circ(ex, ey, 4.5, k.blue, k.ink, 1); });
      K.arrow(cx - 22, bot - 12, px + 22, bot - 12, k.grid, 1.4); K.txt('slowing force on electrons', (px + cx) / 2, bot - 22, { align: 'center', size: 10.5, color: k.muted });
      K.fbox('photon:  E = hf = hc/λ', K.narrow ? w * 0.3 : w * 0.16, K.narrow ? h - 14 : h - 30, 40, top + (bot - top) * 0.4, col);
      K.fbox('K_max = hf − φ', K.narrow ? w * 0.5 : (px + cx) / 2, top - 6 < 20 ? 22 : top - 4, px + 10, top + (bot - top) * 0.25, k.blue);
      K.fbox('stopping:  eV_s = K_max', K.narrow ? w * 0.5 : (px + cx) / 2 + 40, (top + bot) / 2 + 34, (px + cx) / 2, h - 18, k.gold);
    }
  });

  // exam-hydrogen-levels  { nu: 3, nl: 2, up: false, Z: 1 }
  scene('exam-hydrogen-levels', {
    dur: 3.4, still: 2.2, an: 0.95, label: function (o) { return 'An energy level diagram with a jump from level ' + nm(o.nu, 3) + ' to level ' + nm(o.nl, 2); },
    draw: function (K, t, o) {
      var k = K.k, w = K.w, h = K.h, nu = nm(o.nu, 3), nl = nm(o.nl, 2), up = !!o.up, Z = nm(o.Z, 1), E0 = 13.6 * Z * Z, top = 22, bot = h - 22, x0 = K.narrow ? 46 : 70, x1 = K.narrow ? w * 0.62 : w * 0.5;
      var Y = function (E) { return top + (bot - top) * (-E / E0); };
      for (var n = 1; n <= 7; n++) { var E = -E0 / (n * n), y = Y(E); var key = n === nu || n === nl; K.line(x0, y, x1, y, key ? k.ink : k.muted, key ? 2.4 : 1.2); if (n <= 4 || (key && n > 4)) { K.txt('n = ' + n, x0 - 6, y, { align: 'right', size: 11 }); K.txt(fm(E, 2) + ' eV', x1 + 6, y, { size: 10.5, color: k.muted }); } }
      K.line(x0, Y(0), x1, Y(0), k.muted, 1, [4, 4]); K.txt('0 (free)', x1 + 6, Y(0), { size: 10.5, color: k.muted });
      var xa = x0 + (x1 - x0) * 0.4, from = up ? nl : nu, to = up ? nu : nl, yf = Y(-E0 / (from * from)), yt = Y(-E0 / (to * to)), p = ease((t - 0.8) / 1), col = k.orange;
      // the photon: arriving (absorbed) before the jump, or leaving after it
      var ph = up ? ease(t / 0.8) : ease((t - 1.8) / 1.4), px0 = up ? w - 20 : xa + 10, px1 = up ? xa + 10 : w - 10, pxh = px0 + (px1 - px0) * ph, ym = (yf + yt) / 2;
      if ((up && t < 0.9) || (!up && t > 1.8)) { var pts = []; for (var s = -26; s <= 26; s += 2) pts.push([pxh + s, ym + 6 * M.sin(s * 0.5)]); K.poly(pts, col, 2.2); K.txt('photon', pxh, ym - 16, { align: 'center', size: 10.5, color: col }); }
      K.arrow(xa, yf, xa, yf + (yt - yf) * p, k.red, 2.6);
      var ey = yf + (yt - yf) * p; K.circ(xa, ey, 6, k.blue, k.ink);
      var gapY = (Y(-E0 / 4) + Y(-E0)) / 2;
      K.fbox('Eₙ = −' + fm(E0, 1) + '/n² eV', K.narrow ? w * 0.5 : w * 0.78, K.narrow ? gapY + 52 : bot - 30, x1 - 20, Y(-E0), k.muted);
      K.fbox('photon:  E = E_upper − E_lower', K.narrow ? w * 0.5 : w * 0.76, K.narrow ? gapY - 30 : top + 60, xa + 4, ym, k.red);
      K.fbox('λ = hc/E = 1240 eV·nm / E', K.narrow ? w * 0.5 : w * 0.76, K.narrow ? gapY + 10 : top + 110, null, null, col);
    }
  });
})(window, document);
