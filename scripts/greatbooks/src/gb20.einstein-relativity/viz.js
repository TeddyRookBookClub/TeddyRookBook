/* gb-light-clock: two pictures from Einstein's Relativity, drawn our own way.
   View "clock": a light clock (a flash bouncing between two mirrors) at rest beside one carried along at speed v.
   Seen from the ground the moving flash runs a longer, slanted path, so the moving clock ticks slower by
   γ = 1 / √(1 − v²/c²).
   View "lightning": Einstein's train and embankment. Lightning strikes at A and B at the same moment for the
   observer M on the embankment. The observer M′ on the train rides toward B, meets B's light first, and so judges
   that B struck first. opts: view: 'clock' | 'lightning'; v: 0–0.95 (fraction of c). */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math;
  V.register('gb-light-clock', function (el, o) {
    o = o || {};
    var view = o.view || 'clock', beta = o.v == null ? 0.6 : +o.v, t = 0, playing = false;
    var c = V.canvas(el, { aspect: 1.8, min: 230, max: 330 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Picture', items: [['clock', 'Light clocks'], ['lightning', 'Lightning and the train']], value: view, change: function (v) { view = v; t = 0; draw(); } });
    V.slider(ctl, { label: 'Speed of the moving clock or train', min: 0, max: 0.95, step: 0.05, value: beta, fmt: function (v) { return V.fmt(v, 2) + ' c'; }, input: function (v) { beta = v; t = 0; draw(); } });
    V.button(ctl, 'Play', function () { t = 0; playing = true; lp.start(); if (V.reduced) { t = view === 'clock' ? 12 : 1 / (1 - M.min(beta, 0.95)) + 0.2; playing = false; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    var lp = V.loop(el, function (dt) { if (!playing) return; t += dt * (view === 'clock' ? 1.6 : 0.5); var end = view === 'clock' ? 12 : 1 / (1 - beta) + 0.15; if (t >= end) { t = end; playing = false; } draw(); });
    function gam() { return 1 / M.sqrt(1 - beta * beta); }
    function bg(k) { var g = c.ctx; g.save(); g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); g.fillStyle = k.bg; g.fillRect(0, 0, c.w, c.h); g.restore(); }
    function tri(x) { var f = x % 2; return f < 1 ? f : 2 - f; } // 0 → 1 → 0, one round trip every 2 units
    function clock(k, x, top, H, s, label, ticks) {
      var g = c.ctx;
      g.strokeStyle = k.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 18, top); g.lineTo(x + 18, top); g.moveTo(x - 18, top + H); g.lineTo(x + 18, top + H); g.stroke();
      g.fillStyle = k.gold; g.beginPath(); g.arc(x, top + H - s * H, 6, 0, 2 * M.PI); g.fill();
      g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'center'; var lx = M.max(56, M.min(c.w - 56, x)); g.fillText(label, lx, top + H + 20); g.fillText(ticks + ' ticks', lx, top + H + 36);
    }
    function drawClock(k) {
      var g = c.ctx, w = c.w, h = c.h, top = 26, H = h - 90, G = gam();
      // the clock at rest
      clock(k, w * 0.14, top, H, tri(t), 'at rest', M.floor(t / 2));
      // the moving clock: in ground time, one crossing takes γ units; it moves β·γ·H pixels sideways per crossing
      var span = w * 0.66, x0 = w * 0.3, run = beta * G * H, path = t / G, px = x0 + ((path * run) % span);
      if (beta > 0) { // the slanted trail behind the flash
        g.strokeStyle = k.gold; g.globalAlpha = 0.45; g.lineWidth = 2; g.beginPath();
        for (var s = path, first = true; s >= M.max(0, path - 6); s -= 0.02) {
          var xs = px - (path - s) * run; if (xs < x0) break;
          var ys = top + H - tri(s) * H; if (first) { g.moveTo(xs, ys); first = false; } else g.lineTo(xs, ys);
        }
        g.stroke(); g.globalAlpha = 1;
      }
      clock(k, px, top, H, tri(path), 'moving at ' + V.fmt(beta, 2) + ' c', M.floor(path / 2));
      c.cv.setAttribute('aria-label', 'A light clock at rest and one moving at ' + V.fmt(beta, 2) + ' times the speed of light');
      out.set('γ = 1/√(1 − ' + V.fmt(beta, 2) + '²) = <b>' + V.fmt(G, 3) + '</b>. Seen from the ground, the moving flash must run a longer, slanted path at the same speed of light, so the moving clock ticks <b>' + V.fmt(G, 2) + ' times slower</b>: while the resting clock ticks 10 times, the moving one ticks about ' + V.fmt(10 / G, 1) + ' times. To someone riding with it, it ticks normally.');
    }
    function drawLightning(k) {
      var g = c.ctx, w = c.w, h = c.h, L = w * 0.4, mx = w / 2, yE = h * 0.72, yT = h * 0.42;
      var tB = 1 / (1 + beta), tA = 1 / (1 - beta), tM = 1;
      g.strokeStyle = k.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(10, yE); g.lineTo(w - 10, yE); g.stroke();
      // the train, its middle M′ starting beside M
      var tx = mx + beta * t * L, tw = w * 0.5;
      g.fillStyle = k.greenSoft; g.strokeStyle = k.green; g.lineWidth = 2; g.fillRect(tx - tw / 2, yT - 22, tw, 44); g.strokeRect(tx - tw / 2, yT - 22, tw, 44);
      g.fillStyle = k.ink; g.font = '700 13px system-ui,sans-serif'; g.textAlign = 'center';
      g.fillText('A', mx - L, yE + 22); g.fillText('B', mx + L, yE + 22); g.fillText('M', mx, yE + 22); g.fillText('M′', tx, yT + 5);
      // flashes and the light from them (c = 1 unit of half-distance per unit time)
      if (t < 0.15) { g.fillStyle = k.gold; [mx - L, mx + L].forEach(function (x) { g.beginPath(); g.moveTo(x - 6, yE - 60); g.lineTo(x + 4, yE - 30); g.lineTo(x - 2, yE - 30); g.lineTo(x + 6, yE); g.lineTo(x - 4, yE - 26); g.lineTo(x + 2, yE - 26); g.closePath(); g.fill(); }); }
      g.fillStyle = k.orange;
      [[-1, tA], [1, tB]].forEach(function (s) { var x = mx + s[0] * L * (1 - M.min(t, 2)); if (t <= 2) { g.beginPath(); g.arc(x, yE - 6, 5, 0, 2 * M.PI); g.fill(); g.beginPath(); g.arc(x, yT + 26, 4, 0, 2 * M.PI); g.fill(); } });
      g.font = '12px system-ui,sans-serif'; g.fillStyle = k.ink; g.textAlign = 'left';
      var lines = [];
      if (t >= tB) lines.push('M′ sees B’s flash');
      if (t >= tM) lines.push('M sees both flashes together');
      if (t >= tA) lines.push('M′ sees A’s flash, later');
      lines.forEach(function (s, i) { g.fillText(s, 12, 18 + i * 16); });
      c.cv.setAttribute('aria-label', 'Lightning strikes at A and B; a train moves toward B at ' + V.fmt(beta, 2) + ' times the speed of light');
      out.set(beta === 0 ? 'With the train standing still, M and M′ are side by side and both see the two flashes together.' :
        'For M on the embankment the strokes are simultaneous. M′ rides toward B, meets its light after ' + V.fmt(tB, 2) + ' units of time and A’s after ' + V.fmt(tA, 2) + '. Since light runs at the same speed for M′ too, M′ concludes that B struck first. Two observers, two verdicts, and neither is wrong.');
    }
    function draw() { var k = V.colors(); bg(k); if (view === 'clock') drawClock(k); else drawLightning(k); }
    c.onResize(draw); V.onTheme(draw); t = view === 'clock' ? 5 : 0.7; draw(); t = 0;
    return {};
  });
})();
