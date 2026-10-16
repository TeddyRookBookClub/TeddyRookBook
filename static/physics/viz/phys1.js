/* Course visuals for phys1, merged from part files by /tmp/merge_parts.js. */
/* ---- part A ---- */
/* Physics 1 course visuals (course key phys1), part A. Registered with MathLadder.viz.register; loaded after
   static/math/viz/core.js on Physics 1 pages. Light and dark themes, an aria-label, no horizontal overflow at 360 px.

   phys1-graphmatch   "Which graph matches?" for translating between motion graphs. A given graph across the top and four
                      candidate graphs below in a 2 × 2 grid, labeled A–D. Static (a printed figure); nothing gives the
                      answer away.
                      opts: given: {q: 'x'|'v'|'a', pts: [[t, y], …]} (straight pieces between the points; a null entry
                            breaks the line, for a jump), choices: [{q, pts}, × 4], tmax (default: the last t),
                            units: {x: 'm', v: 'm/s', a: 'm/s²', t: 's'}, label (aria-label), title (text above the given
                            graph; default "Given: the x–t graph")                                                      */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('physics/viz/phys1.js: load math/viz/core.js first'); return; }
  var M = Math;
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function niceStep(span, n) { var raw = M.abs(span) / M.max(1, n), m = M.pow(10, M.floor(M.log10(raw || 1))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function range(pts) {
    var lo = 0, hi = 0; pts.forEach(function (p) { if (p) { lo = M.min(lo, p[1]); hi = M.max(hi, p[1]); } });
    if (hi - lo < 1e-9) { hi = lo + 1; }
    var st = niceStep(hi - lo, 3), a = M.floor(lo / st - 1e-9) * st, b = M.ceil(hi / st + 1e-9) * st;
    if (lo >= 0) a = M.min(0, a); if (hi <= 0) b = M.max(0, b);
    if (lo < 0 && a === lo) a -= st * 0.25; if (hi > 0 && b === hi) b += st * 0.25;
    return [a, b, st];
  }
  V.register('phys1-graphmatch', function (el, o) {
    var U = Object.assign({ x: 'm', v: 'm/s', a: 'm/s²', t: 's' }, o.units || {});
    var given = o.given || { q: 'x', pts: [[0, 0], [1, 1]] }, ch = (o.choices || []).slice(0, 4);
    var tmax = o.tmax || 0; [given].concat(ch).forEach(function (g) { (g.pts || []).forEach(function (p) { if (p) tmax = M.max(tmax, p[0]); }); });
    var NAME = { x: 'x–t', v: 'v–t', a: 'a–t' };
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', o.label || ('Given: the ' + NAME[given.q] + ' graph of a motion. Below it, four ' + (ch[0] ? NAME[ch[0].q] : '') + ' graphs labeled A, B, C and D.'));
    var copts = { max: 640, min: 360 };
    Object.defineProperty(copts, 'aspect', { get: function () { var w = el.clientWidth || 600; return w < 420 ? 0.66 : w < 560 ? 0.9 : 1.25; } });
    var c = V.canvas(el, copts);
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', el.getAttribute('aria-label'));
    function colOf(q, k) { var d = dark(); return q === 'x' ? (d ? '#8fb1ea' : '#2d5596') : q === 'v' ? k.green : k.orange; }
    function panel(ctx, k, g, r, tag, big) {
      ctx.save();
      ctx.fillStyle = dark() ? '#17281f' : '#f5f8fb'; ctx.strokeStyle = k.grid; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(r.x, r.y, r.w, r.h, 8); else ctx.rect(r.x, r.y, r.w, r.h); ctx.fill(); ctx.stroke();
      var pad = { l: 34, r: 10, t: 22, b: big ? 20 : 16 }, gx = r.x + pad.l, gy = r.y + pad.t, gw = r.w - pad.l - pad.r, gh = r.h - pad.t - pad.b;
      var rg = range(g.pts || []), X = function (t) { return gx + t / tmax * gw; }, Y = function (y) { return gy + gh - (y - rg[0]) / (rg[1] - rg[0]) * gh; };
      while (gh * rg[2] / (rg[1] - rg[0]) < 14) rg[2] *= 2; // keep tick labels apart on small panels
      // grid and ticks
      ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
      var ts = niceStep(tmax, big ? 8 : 5);
      for (var t = 0; t <= tmax + 1e-9; t += ts) { ctx.moveTo(M.round(X(t)) + 0.5, gy); ctx.lineTo(M.round(X(t)) + 0.5, gy + gh); }
      for (var y = M.ceil(rg[0] / rg[2] - 1e-9) * rg[2]; y <= rg[1] + 1e-9; y += rg[2]) { ctx.moveTo(gx, M.round(Y(y)) + 0.5); ctx.lineTo(gx + gw, M.round(Y(y)) + 0.5); }
      ctx.stroke();
      ctx.fillStyle = k.muted; ctx.font = '10.5px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (y = M.ceil(rg[0] / rg[2] - 1e-9) * rg[2]; y <= rg[1] + 1e-9; y += rg[2]) if (Y(y) > gy + 4) ctx.fillText(V.fmt(y, 3), gx - 4, Y(y));
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (t = 0; t <= tmax + 1e-9; t += ts) ctx.fillText(V.fmt(t, 3), X(t), gy + gh + 3);
      // axes
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();
      ctx.fillStyle = k.ink; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(g.q + ' (' + U[g.q] + ')', tag ? gx + 4 : r.x + 8, r.y + 11);
      ctx.textAlign = 'right'; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = k.muted; ctx.fillText('t (' + U.t + ')', r.x + r.w - 6, r.y + 11);
      // the graph
      ctx.strokeStyle = colOf(g.q, k); ctx.lineWidth = big ? 3 : 2.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
      var pen = false; (g.pts || []).forEach(function (p) { if (!p) { pen = false; return; } if (pen) ctx.lineTo(X(p[0]), Y(p[1])); else { ctx.moveTo(X(p[0]), Y(p[1])); pen = true; } });
      ctx.stroke();
      // the tag
      if (tag) {
        var tx = r.x + 14, ty = r.y + 12;
        if (tag.length === 1) { ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(tx, ty, 12, 0, 2 * M.PI); ctx.fill(); ctx.fillStyle = dark() ? '#ffd479' : '#7a5c12'; ctx.beginPath(); ctx.arc(tx, ty, 10.5, 0, 2 * M.PI); ctx.fill(); ctx.fillStyle = dark() ? '#1d2320' : '#ffffff'; ctx.font = '800 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tag, tx, ty + 0.5); }
      }
      ctx.restore();
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h); ctx.restore();
      var gap = 10, title = 20, topH = M.round((h - title) * 0.34), cellW = (w - gap) / 2, cellH = (h - title - topH - gap * 3 - 18) / 2;
      ctx.fillStyle = k.ink; ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(o.title || ('Given: the ' + NAME[given.q] + ' graph'), 2, 10);
      panel(ctx, k, given, { x: 1, y: title, w: w - 2, h: topH }, '', true);
      var y0 = title + topH + gap;
      ctx.fillStyle = k.ink; ctx.font = '700 13px system-ui,sans-serif'; ctx.fillText('Which ' + (ch[0] ? NAME[ch[0].q] : '') + ' graph matches?', 2, y0 + 9);
      y0 += 18 + gap / 2;
      ch.forEach(function (g, i) { panel(ctx, k, g, { x: 1 + (i % 2) * (cellW + gap), y: y0 + M.floor(i / 2) * (cellH + gap), w: cellW - 1, h: cellH }, 'ABCD'[i], false); });
    }
    draw(); c.onResize(draw); V.onTheme(draw);
    return { update: function (o2) { Object.assign(o, o2 || {}); draw(); }, destroy: function () { } };
  });
})(window, document);

/* ---- part B ---- */
/* Physics 1 course visuals, part B (course key phys1). Registered with MathLadder.viz.register; loaded after
   static/math/viz/core.js on Physics 1 pages. Light and dark themes, an aria-label that states the scene in words,
   keyboard-usable controls (native sliders and buttons), no horizontal overflow at 360 px, no autoplay when the viewer
   prefers reduced motion.

   phys1-sweep   Angular momentum of a point mass moving in a straight line. A puck slides at constant velocity along a
                 line that passes a distance d from a point P. Drawn: the line of motion, P, the position vector r from P
                 to the puck, the perpendicular distance r⊥ = d (with a right-angle mark), the velocity arrow, and the
                 triangles swept by r in equal time intervals (all of equal area, ½ v Δt d). The readout gives r, the
                 angle θ between r and v, r sin θ (always d) and L = m v r⊥ (constant).
                 A strip below plots r and r⊥ = r sin θ against time: r dips and rises, r⊥ stays flat.
                 opts: m (kg, default 2), v (m/s, 3), d (m, 1.5, at most 2.5; 0 puts P on the line, so L = 0), t (s: the moment shown;
                       in problem mode the frozen frame, default 0.55 of the crossing), dt (s, the time per swept triangle,
                       default 0.5), play (true|false), interactive (false = a frozen figure with no controls),
                       quiet (true = no numbers that could give an answer away), show/hide: ['areas', 'rperp', 'r',
                       'values', 'graph'], task (lesson text above the picture), label (aria-label), height (px).            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('physics/viz/phys1.js (part B): load math/viz/core.js first'); return; }
  var M = Math;
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function f2(v, d) { return V.fmt(v, d == null ? 2 : d); }
  function arrow(ctx, x1, y1, x2, y2, col, w) {
    var L = M.hypot(x2 - x1, y2 - y1); if (L < 1) return; var a = M.atan2(y2 - y1, x2 - x1), h = M.min(10 + w, L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - h * 0.6 * M.cos(a), y2 - h * 0.6 * M.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * M.cos(a - 0.42), y2 - h * M.sin(a - 0.42)); ctx.lineTo(x2 - h * M.cos(a + 0.42), y2 - h * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function label(ctx, s, x, y, col, o) {
    o = o || {}; ctx.save(); ctx.font = (o.it ? 'italic ' : '') + (o.w || 700) + ' ' + (o.size || 13) + 'px ' + (o.serif ? 'Georgia,serif' : 'system-ui,-apple-system,"Segoe UI",sans-serif');
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = dark() ? 'rgba(20,33,26,0.9)' : 'rgba(255,255,255,0.92)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y);
    ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
  }

  V.register('phys1-sweep', function (el, o) {
    o = o || {};
    var live = o.interactive !== false, quiet = !!(o.quiet || o.readout === false), show = o.show || [], hide = o.hide || [];
    function on(n, def) { if (hide.indexOf(n) >= 0) return false; if (show.indexOf(n) >= 0) return true; return def; }
    var DMAX = 2.5, P = { m: num(o.m, 2), v: M.max(0.2, num(o.v, 3)), d: M.min(DMAX, M.max(0, num(o.d, 1.5))), dt: M.max(0.1, num(o.dt, 0.5)) };
    var X0 = -4, X1 = 4; // the puck crosses from x = −4 m to x = 4 m
    function tmax() { return (X1 - X0) / P.v; }
    var S = { t: o.t != null ? M.max(0, num(o.t, 0)) : tmax() * 0.55 };
    el.classList.add('phv'); if (!live) el.classList.add('phv-static');
    el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || 'A puck sliding in a straight line past a point P, with its angular momentum about P');
    if (o.task && live) { var tk = D.createElement('p'); tk.className = 'phv-task'; tk.innerHTML = '<span>' + o.task + '</span>'; el.appendChild(tk); if (ML.typeset) try { ML.typeset(tk); } catch (e) { } }
    var box = D.createElement('div'); box.className = 'phv-box'; el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.5, min: 300, max: 520, height: o.height });
    c.cv.setAttribute('role', 'img');
    var ctl = null, out = null, playing = false, lp = null, btn = null;
    if (live) {
      ctl = D.createElement('div'); ctl.className = 'ml-ctl phv-ctl phv-anim'; el.appendChild(ctl);
      btn = V.button(ctl, '▶ Play', function () { if (playing) pause(); else play(); }, 'pri phv-play');
      V.button(ctl, '↺', function () { pause(); S.t = 0; draw(); }).setAttribute('aria-label', 'Start again');
      var ctl2 = D.createElement('div'); ctl2.className = 'ml-ctl phv-ctl'; el.appendChild(ctl2);
      V.slider(ctl2, { label: 'Distance r⊥', min: 0, max: DMAX, step: 0.1, value: P.d, fmt: function (v) { return f2(v, 1) + ' m'; }, input: function (v) { P.d = v; draw(); } });
      V.slider(ctl2, { label: 'Speed v', min: 1, max: 5, step: 0.5, value: P.v, fmt: function (v) { return f2(v, 1) + ' m/s'; }, input: function (v) { var fr = S.t / tmax(); P.v = v; S.t = fr * tmax(); draw(); } });
      lp = V.loop(box, function (dts) { if (!playing) return; S.t += dts * 0.8; if (S.t > tmax()) S.t = 0; draw(); }); lp.stop();
    }
    if (!quiet) { out = V.readout(el); out.el.classList.add('phv-read'); }
    function play() { playing = true; if (lp) lp.start(); if (btn) { btn.textContent = '❚❚ Pause'; btn.setAttribute('aria-pressed', 'true'); } }
    function pause() { playing = false; if (lp) lp.stop(); if (btn) { btn.textContent = '▶ Play'; btn.setAttribute('aria-pressed', 'false'); } }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, d = P.d, dk = dark();
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var showG = on('graph', true), gh = showG ? M.round(M.min(140, M.max(92, h * 0.3))) : 0, sceneH = h - gh - (showG ? 14 : 0);
      var top = (live ? DMAX : M.max(d, 0.6)) + 0.45, bot = -0.55, sc = M.min((w - 24) / (X1 - X0 + 0.6), (sceneH - 8) / (top - bot)), ox = w / 2, oy = 4 + top * sc + M.max(0, (sceneH - 8 - (top - bot) * sc) / 2);
      function Xp(x) { return ox + x * sc; } function Yp(y) { return oy - y * sc; }
      var col = { line: k.muted, r: dk ? '#b197fc' : '#7048e8', perp: dk ? '#ffd479' : '#a07408', v: k.green, puck: dk ? '#8fb1ea' : '#2d5596', a1: dk ? 'rgba(255,212,121,0.30)' : 'rgba(184,134,11,0.22)', a2: dk ? 'rgba(143,177,234,0.28)' : 'rgba(45,85,150,0.16)' };
      var x = X0 + P.v * S.t, rr = M.hypot(x, d), th = rr > 1e-9 ? M.atan2(d, -x) : 0; // angle between r (P to puck) and v (+x)
      // swept triangles in equal times, behind the puck
      if (on('areas', true) && d > 0.02) {
        var n = M.floor(S.t / P.dt);
        for (var i = 0; i < n; i++) { var xa = X0 + P.v * P.dt * i, xb = X0 + P.v * P.dt * (i + 1); ctx.beginPath(); ctx.moveTo(Xp(0), Yp(0)); ctx.lineTo(Xp(xa), Yp(d)); ctx.lineTo(Xp(xb), Yp(d)); ctx.closePath(); ctx.fillStyle = i % 2 ? col.a2 : col.a1; ctx.fill(); }
        if (S.t - n * P.dt > 1e-6) { ctx.beginPath(); ctx.moveTo(Xp(0), Yp(0)); ctx.lineTo(Xp(X0 + P.v * P.dt * n), Yp(d)); ctx.lineTo(Xp(x), Yp(d)); ctx.closePath(); ctx.fillStyle = n % 2 ? col.a2 : col.a1; ctx.fill(); }
      }
      // line of motion
      ctx.save(); ctx.setLineDash([7, 6]); ctx.strokeStyle = col.line; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(Xp(X0 - 0.3), Yp(d)); ctx.lineTo(Xp(X1 + 0.3), Yp(d)); ctx.stroke(); ctx.restore();
      if (x < 0.5) label(ctx, 'line of motion', Xp(X1 + 0.3) - 2, Yp(d) - 12, k.muted, { w: 500, size: 11, align: 'right' }); else label(ctx, 'line of motion', Xp(X0 - 0.3) + 2, Yp(d) - 12, k.muted, { w: 500, size: 11, align: 'left' });
      // r perpendicular
      if (on('rperp', true) && d > 0.02) {
        ctx.save(); ctx.strokeStyle = col.perp; ctx.lineWidth = 2.4; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(Xp(0), Yp(0)); ctx.lineTo(Xp(0), Yp(d)); ctx.stroke(); ctx.restore();
        var q = 9; ctx.save(); ctx.strokeStyle = col.perp; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(Xp(0) + q, Yp(d)); ctx.lineTo(Xp(0) + q, Yp(d) + q); ctx.lineTo(Xp(0), Yp(d) + q); ctx.stroke(); ctx.restore();
        label(ctx, 'r⊥' + (quiet || !on('values', true) ? '' : ' = ' + f2(d, 2) + ' m'), Xp(0) + (x > 0.3 ? -8 : 8), Yp(d / 2), col.perp, { align: x > 0.3 ? 'right' : 'left', size: 12.5 });
      }
      // r vector
      if (on('r', true) && rr > 0.05) arrow(ctx, Xp(0), Yp(0), Xp(x), Yp(d), col.r, 2.6);
      if (on('r', true) && rr > 0.4) label(ctx, 'r', Xp(x * 0.5) + (x > 0 ? 9 : -9), Yp(d * 0.5) + 8, col.r, { it: true, serif: true, size: 15 });
      // the point P
      ctx.beginPath(); ctx.arc(Xp(0), Yp(0), 5, 0, 2 * M.PI); ctx.fillStyle = k.ink; ctx.fill();
      label(ctx, 'P', Xp(0), Yp(0) + 15, k.ink, { size: 13 });
      // puck and velocity
      var pr = M.max(8, M.min(12, sc * 0.12)), al = P.v * 0.32 * sc;
      ctx.beginPath(); ctx.arc(Xp(x), Yp(d), pr, 0, 2 * M.PI); ctx.fillStyle = col.puck; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = k.bg; ctx.stroke();
      arrow(ctx, Xp(x) + pr + 2, Yp(d), Xp(x) + pr + 2 + al, Yp(d), col.v, 3);
      label(ctx, 'v', Xp(x) + pr + 2 + al * 0.5, Yp(d) - 12, col.v, { it: true, serif: true, size: 15 });
      // graph strip: r and r⊥ against time
      if (showG) {
        var gx = 46, gy = h - gh + 4, gw = w - gx - 16, gH = gh - 26, rmax = M.max(M.hypot(4, d), 0.5) * 1.08, T = tmax();
        var GX = function (t) { return gx + t / T * gw; }, GY = function (y) { return gy + gH - y / rmax * gH; };
        ctx.save(); ctx.fillStyle = dk ? '#17281f' : '#f5f8fb'; ctx.fillRect(gx - 40, gy - 6, gw + 52, gH + 30); ctx.restore();
        ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gH); ctx.lineTo(gx + gw, gy + gH); ctx.stroke(); ctx.restore();
        var st = rmax > 3 ? 2 : 1; ctx.save(); ctx.font = '500 10.5px system-ui,sans-serif'; ctx.fillStyle = k.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (var yv = 0; yv <= rmax + 1e-9; yv += st) { ctx.fillText(String(yv), gx - 5, GY(yv)); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(gx + 1, GY(yv)); ctx.lineTo(gx + gw, GY(yv)); ctx.stroke(); }
        ctx.textAlign = 'left'; ctx.fillText('m', gx - 36, gy + 2); ctx.textAlign = 'right'; ctx.fillText('time →', gx + gw, gy + gH + 12); ctx.restore();
        ctx.save(); ctx.strokeStyle = col.r; ctx.lineWidth = 2.2; ctx.beginPath(); for (var j = 0; j <= 120; j++) { var tj = T * j / 120, xj = X0 + P.v * tj, yj = M.hypot(xj, d); if (j) ctx.lineTo(GX(tj), GY(yj)); else ctx.moveTo(GX(tj), GY(yj)); } ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = col.perp; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(GX(0), GY(d)); ctx.lineTo(GX(T), GY(d)); ctx.stroke(); ctx.restore();
        label(ctx, 'r', GX(T * 0.06), GY(M.hypot(X0 + P.v * T * 0.06, d)) - 9, col.r, { it: true, serif: true, size: 13, align: 'left' });
        label(ctx, 'r⊥ = r sin θ', GX(T * 0.02) + 4, GY(d) + (d >= 0.6 ? 11 : -11), col.perp, { size: 11.5, align: 'left' });
        ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = k.gold; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(GX(S.t), gy); ctx.lineTo(GX(S.t), gy + gH); ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(GX(S.t), GY(rr), 3.8, 0, 2 * M.PI); ctx.fillStyle = col.r; ctx.fill();
      }
      var L = P.m * P.v * d;
      var desc = 'A ' + f2(P.m, 1) + ' kg puck slides in a straight line at ' + f2(P.v, 1) + ' m/s, passing ' + f2(d, 2) + ' m from point P. Its distance r from P changes, but the perpendicular distance r⊥ does not' + (quiet ? '.' : ', so its angular momentum about P, m v r⊥ = ' + f2(L, 2) + ' kg·m²/s, is the same all along the line.');
      c.cv.setAttribute('aria-label', desc); c.cv.textContent = desc;
      if (out) out.set(d < 0.02 ? 'P is on the line of motion: r⊥ = 0, so the puck has <b>no</b> angular momentum about P.' :
        'Now: r = <b>' + f2(rr, 2) + ' m</b> and the angle between r and v is θ = <b>' + f2(th * 180 / M.PI, 0) + '°</b>, so r sin θ = <b>' + f2(rr * M.sin(th), 2) + ' m</b> = r⊥. L = m v r⊥ = (' + f2(P.m, 1) + ')(' + f2(P.v, 1) + ')(' + f2(d, 2) + ') = <b>' + f2(L, 2) + ' kg·m²/s</b> at every moment. Each shaded triangle has the same area, ½ v Δt r⊥ = ' + f2(0.5 * P.v * P.dt * d, 2) + ' m².');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    if (live && (o.play != null ? !!o.play : true) && !V.reduced) play();
    return { update: function (no) { Object.assign(o, no || {}); draw(); }, destroy: function () { if (lp) lp.stop(); } };
  });
})(window, document);
