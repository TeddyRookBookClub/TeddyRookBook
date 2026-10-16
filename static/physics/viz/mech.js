/* Physics Ladder visuals made for Mechanics with Calculus (course key mech). Registered on window.MathLadder.viz; load
   after math/viz/core.js. Vanilla JavaScript, no libraries, no network requests. Follows the site's light or dark theme.

   mech-pivot-hit: a lump of clay flies into a rod hanging from a frictionless pivot and sticks; the rod and clay then
     swing up. Bars compare, just before and just after the impact, the angular momentum about the pivot (the same),
     the linear momentum (different: the pivot pushes during the impact, except at the center of percussion, 2L/3 below
     the pivot for a uniform rod) and the kinetic energy (some is lost: the clay sticks). A marker shows the pivot's push.
     opts:
       M: 2         rod mass (kg)                 L: 1        rod length (m)
       m: 0.2       clay mass (kg)                v: 10       clay speed (m/s)
       d: 1         where the clay hits, measured down from the pivot (m); a slider moves it from 0.1 L to L
       g: 9.8       gravitational field strength
       play: true   start the animation (nothing autoplays when the viewer prefers reduced motion)
       task, label  as for every visual
     Physics: angular momentum about the pivot, m v d = (M L²/3 + m d²) ω; then I θ″ = −(M g L/2 + m g d) sin θ,
     integrated with RK4 (exact energy check in node tests).                                                         */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, fm = V.fmt;

  if (!D.getElementById('mech-viz-css')) {
    var st = D.createElement('style'); st.id = 'mech-viz-css';
    st.textContent = '.mchv .mchv-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.mchv .ml-cv{box-shadow:inset 0 0 0 1px var(--mv-line)}.mchv .ml-ctl{align-items:center;gap:.45rem .8rem}.mchv .ml-ctl .ml-sl{flex:1 1 180px}' +
      '.mchv .mchv-play{min-width:6.2rem}.mchv .ml-readout b{font-variant-numeric:tabular-nums}';
    D.head.appendChild(st);
  }
  function num(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function arrow(ctx, x1, y1, x2, y2, col, w) {
    var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(10, L * 0.5);
    if (L < 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function text(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = (o.weight || 600) + ' ' + (o.size || 12) + 'px system-ui, sans-serif'; ctx.fillStyle = o.color || '#000';
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore();
  }
  // the physics, exposed for node tests
  function model(P) {
    var Irod = P.M * P.L * P.L / 3, I = Irod + P.m * P.d * P.d, w0 = P.m * P.v * P.d / I, gt = (P.M * P.L / 2 + P.m * P.d) * P.g;
    var p0 = P.m * P.v, p1 = (P.M * P.L / 2 + P.m * P.d) * w0, K0 = 0.5 * P.m * P.v * P.v, K1 = 0.5 * I * w0 * w0;
    var c = 1 - K1 / gt, thMax = c > -1 ? M.acos(c) : M.PI; // over the top if c <= -1
    return { I: I, w0: w0, gt: gt, L0: P.m * P.v * P.d, L1: I * w0, p0: p0, p1: p1, J: p1 - p0, K0: K0, K1: K1, thMax: thMax, over: c <= -1 };
  }
  ML.mechModels = { pivotHit: model };

  V.register('mech-pivot-hit', function (el, o) {
    var P = { M: num(o.M, 2), L: num(o.L, 1), m: num(o.m, 0.2), v: num(o.v, 10), d: num(o.d, 1), g: num(o.g, 9.8) };
    P.d = M.max(0.1 * P.L, M.min(P.L, P.d));
    el.classList.add('mchv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || 'Clay hitting a rod that hangs from a pivot');
    if (o.task) { var tk = V.el('p', 'mchv-task', o.task); el.appendChild(tk); if (ML.typeset) try { ML.typeset(tk); } catch (e) { } }
    var box = V.el('div', 'mchv-box'); el.appendChild(box);
    var co = { aspect: 1.75, min: 330, max: 440 }; co.height = (box.clientWidth || el.clientWidth || 600) < 560 ? 500 : undefined;
    var c = V.canvas(box, co);
    c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var out = V.readout(el);
    // state: phase 'fly' (clay approaching, s from 0 to 1), then 'swing' (theta, omega)
    var S = { phase: 'fly', s: 0, th: 0, w: 0 }, A = model(P);
    var playing = o.play !== false && !V.reduced;
    function reset() { A = model(P); S.phase = 'fly'; S.s = 0; S.th = 0; S.w = 0; draw(); }
    var playBtn = V.button(ctl, playing ? '❚❚ Pause' : '▶ Play', function () { playing = !playing; playBtn.textContent = playing ? '❚❚ Pause' : '▶ Play'; if (playing && S.phase === 'done') reset(); }, 'mchv-play');
    V.button(ctl, '↺ Again', function () { reset(); if (!playing) { playing = true; playBtn.textContent = '❚❚ Pause'; } });
    V.button(ctl, 'Step ›', function () { step(1 / 30); draw(); });
    V.slider(ctl, { label: 'Where the clay hits (from the pivot)', min: 0.1 * P.L, max: P.L, step: 0.01 * P.L, value: P.d, fmt: function (x) { return fm(x, 2) + ' m'; }, input: function (x) { P.d = x; reset(); } });
    V.slider(ctl, { label: 'Clay speed', min: 1, max: 20, step: 0.5, value: P.v, fmt: function (x) { return fm(x, 1) + ' m/s'; }, input: function (x) { P.v = x; reset(); } });

    function step(dt) {
      if (S.phase === 'fly') { S.s += dt / 0.9; if (S.s >= 1) { S.s = 1; S.phase = 'swing'; S.w = A.w0; S.t = 0; } return; }
      if (S.phase !== 'swing') return;
      var n = 8, h = dt / n;
      for (var i = 0; i < n; i++) { // RK4 on theta'' = -gt sin(theta) / I
        var f = function (th, w) { return [w, -A.gt * M.sin(th) / A.I]; };
        var k1 = f(S.th, S.w), k2 = f(S.th + h / 2 * k1[0], S.w + h / 2 * k1[1]), k3 = f(S.th + h / 2 * k2[0], S.w + h / 2 * k2[1]), k4 = f(S.th + h * k3[0], S.w + h * k3[1]);
        S.th += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); S.w += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      }
      S.t += dt;
    }
    var lp = V.loop(el, function (dt) { if (playing) { step(dt); draw(); } });
    void lp;

    function bars(ctx, k, r) {
      var groups = [
        { t: 'Angular momentum about the pivot', u: 'kg·m²/s', a: A.L0, b: A.L1, col: k.teal },
        { t: 'Linear momentum (sideways)', u: 'kg·m/s', a: A.p0, b: A.p1, col: k.blue },
        { t: 'Kinetic energy', u: 'J', a: A.K0, b: A.K1, col: k.green }];
      var gh = r.h / 3;
      groups.forEach(function (G, i) {
        var y0 = r.y + i * gh, mx = M.max(G.a, G.b, 1e-9), bw = r.w - 92, bh = M.min(14, gh * 0.2);
        text(ctx, G.t, r.x, y0 + 12, { size: 11.5, color: k.ink, weight: 700 });
        [['before', G.a, 0.55], ['after', G.b, 1]].forEach(function (q, j) {
          var y = y0 + 30 + j * (bh + 10), w = M.max(2, bw * q[1] / mx);
          text(ctx, q[0], r.x, y + bh / 2, { size: 11, color: k.muted, weight: 600 });
          ctx.save(); ctx.globalAlpha = q[2]; ctx.fillStyle = G.col; ctx.fillRect(r.x + 46, y, w, bh); ctx.restore();
          text(ctx, fm(q[1], 2), r.x + 50 + w, y + bh / 2, { size: 11, color: k.ink, weight: 700 });
        });
        text(ctx, G.u, r.x + r.w, y0 + 12, { size: 10.5, color: k.muted, align: 'right' });
      });
    }
    function draw() {
      var ctx = c.ctx, k = V.colors(), W0 = c.w, H0 = c.h;
      ctx.clearRect(0, 0, W0, H0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, W0, H0);
      var wide = W0 >= 560, sc = wide ? { x: 0, y: 0, w: W0 * 0.56, h: H0 } : { x: 0, y: 0, w: W0, h: H0 * 0.48 }, br = wide ? { x: W0 * 0.58, y: 14, w: W0 * 0.4, h: H0 - 24 } : { x: 12, y: H0 * 0.5, w: W0 - 24, h: H0 * 0.49 };
      // scene: pivot at top center of the scene box
      var px = sc.x + sc.w * 0.58, py = sc.y + 26, Lpx = M.min(sc.h - 60, sc.w * 0.62), s = Lpx / P.L;
      ctx.save(); ctx.fillStyle = k.grid; ctx.fillRect(px - 50, py - 16, 100, 8); ctx.restore();
      for (var hx = -48; hx < 50; hx += 8) { ctx.save(); ctx.strokeStyle = k.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + hx, py - 16); ctx.lineTo(px + hx + 6, py - 24); ctx.stroke(); ctx.restore(); }
      var th = S.th, ex = px + Lpx * M.sin(th), ey = py + Lpx * M.cos(th);
      // center of percussion mark (2L/3)
      var cpx = px + (2 / 3) * Lpx * M.sin(th), cpy = py + (2 / 3) * Lpx * M.cos(th);
      ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(cpx, cpy, 4, 0, 2 * M.PI); ctx.fill(); ctx.restore();
      text(ctx, 'sweet spot (2L/3)', cpx - 10, cpy, { size: 10.5, color: k.gold, align: 'right', weight: 700 });
      ctx.save(); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * M.PI); ctx.fill(); ctx.restore();
      text(ctx, 'pivot', px + 10, py + 2, { size: 11, color: k.muted });
      // the clay
      var hitx = px + P.d * s * M.sin(th), hity = py + P.d * s * M.cos(th), cr = 8 + 6 * M.min(1, P.m / 0.5);
      if (S.phase === 'fly') {
        var bx = sc.x + 20 + (hitx - cr - sc.x - 20) * S.s;
        ctx.save(); ctx.fillStyle = k.orange; ctx.beginPath(); ctx.arc(bx, hity, cr, 0, 2 * M.PI); ctx.fill(); ctx.restore();
        arrow(ctx, bx + cr + 2, hity, bx + cr + 36, hity, k.green, 2.5); text(ctx, 'v = ' + fm(P.v, 1) + ' m/s', bx, hity - cr - 10, { size: 11, color: k.green, align: 'center' });
      } else {
        ctx.save(); ctx.fillStyle = k.orange; ctx.beginPath(); ctx.arc(hitx - cr * M.cos(th), hity + cr * M.sin(th), cr, 0, 2 * M.PI); ctx.fill(); ctx.restore();
        if (S.t < 0.5) { // the pivot's push during the impact
          var J = A.J, len = M.max(-60, M.min(60, J / M.max(A.p0, 1e-9) * 80));
          if (M.abs(len) > 3) { arrow(ctx, px, py + 14, px + len, py + 14, k.red, 3); text(ctx, 'pivot pushes ' + (J > 0 ? 'forward' : 'backward'), px + len / 2, py + 30, { size: 11, color: k.red, align: 'center' }); }
          else text(ctx, 'no push from the pivot', px, py + 30, { size: 11, color: k.red, align: 'center' });
        }
      }
      bars(ctx, k, br);
      var deg = A.thMax * 180 / M.PI;
      var desc = 'A ' + fm(P.m, 2) + ' kg lump of clay at ' + fm(P.v, 1) + ' m/s hits a ' + fm(P.M, 1) + ' kg, ' + fm(P.L, 2) + ' m rod ' + fm(P.d, 2) + ' m below its pivot and sticks. ';
      c.cv.setAttribute('aria-label', desc + 'Angular velocity after: ' + fm(A.w0, 2) + ' rad/s.');
      out.set('Angular momentum about the pivot stays <b>' + fm(A.L0, 3) + ' kg·m²/s</b>, so ω = mvd/I = <b>' + fm(A.w0, 3) + ' rad/s</b> with I = ' + fm(A.I, 3) + ' kg·m². Linear momentum goes from ' + fm(A.p0, 3) + ' to ' + fm(A.p1, 3) + ' kg·m/s: ' +
        (M.abs(A.J) < 1e-3 * A.p0 ? 'unchanged, because the clay hit the sweet spot.' : 'the pivot ' + (A.J > 0 ? 'pushes forward' : 'pushes backward') + ' with an impulse of ' + fm(M.abs(A.J), 3) + ' N·s.') + ' Kinetic energy kept: ' + fm(100 * A.K1 / A.K0, 0) + '%. ' +
        (A.over ? 'It swings over the top.' : 'It swings up to <b>' + fm(deg, 1) + '°</b>.'));
    }
    V.onTheme(draw); c.onResize(function () { var want = c.w < 560 ? 500 : undefined; if (co.height !== want) { co.height = want; c.fit(); } draw(); }); draw();
    return { destroy: function () { playing = false; } };
  });
})(window, document);
