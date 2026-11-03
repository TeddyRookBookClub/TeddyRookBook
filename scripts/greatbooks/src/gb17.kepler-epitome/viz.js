/* gb-kepler: Kepler's first two laws, and his third.
   "Equal areas": an ellipse with the Sun at one focus. The planet moves by Kepler's own equation (M = E - e sin E),
   and the orbit is cut into slices that take equal times; each slice has the same area. Slide the eccentricity.
   "Third law": the six planets Kepler knew, with period squared against distance cubed (they fall on one line).
   opts: e: 0.3; mode: "areas" | "third"; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  var PLAN = [['Mercury', 0.387, 0.241], ['Venus', 0.723, 0.615], ['Earth', 1, 1], ['Mars', 1.524, 1.881], ['Jupiter', 5.203, 11.86], ['Saturn', 9.537, 29.46]];
  function solveE(Mm, e) { var E = Mm; for (var i = 0; i < 30; i++) E = E - (E - e * M.sin(E) - Mm) / (1 - e * M.cos(E)); return E; }
  V.register('gb-kepler', function (el, o) {
    o = o || {};
    var e = o.e == null ? 0.3 : +o.e, mode = o.mode || 'areas', t = 0, playing = false, N = 8, pick = 3;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.45, min: 240, max: 420 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var sg = V.seg(ctl, { label: 'Law', items: [['areas', 'Ellipse and equal areas'], ['third', 'The third law']], value: mode, change: function (v) { mode = v; show(); draw(); } });
    var se = V.slider(ctl, { label: 'Eccentricity', min: 0, max: 0.7, step: 0.01, value: e, input: function (v) { e = v; draw(); } });
    var st = V.slider(ctl, { label: 'Time (part of a year)', min: 0, max: 1, step: 0.005, value: 0, input: function (v) { t = v; draw(); } });
    var pb = V.button(ctl, 'Play', function () { playing = !playing; pb.textContent = playing ? 'Pause' : 'Play'; if (playing) lp.start(); });
    var sp = V.seg(ctl, { label: 'Planet', items: PLAN.map(function (p, i) { return [String(i), p[0]]; }), value: String(pick), change: function (v) { pick = +v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function show() { var a = mode === 'areas'; se.el.hidden = !a; st.el.hidden = !a; pb.hidden = !a; sp.el.hidden = a; }
    show();
    var lp = V.loop(el, function (dt) { if (!playing || mode !== 'areas') return; t += dt * 0.12; if (t > 1) t -= 1; st.set(t); draw(); });
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function pos(f) { var E = solveE(TAU * f, e); return [M.cos(E) - e, M.sqrt(1 - e * e) * M.sin(E)]; } // a = 1, Sun at the origin (a focus)
    function draw() { var k = V.colors(); clear(k); if (mode === 'areas') areas(k); else third(k); }
    function areas(k) {
      var g = c.ctx, w = c.w, h = c.h, b = M.sqrt(1 - e * e), s = M.min((w - 30) / 2, (h - 30) / (2 * b));
      var cx = w / 2 + e * s, cy = h / 2;
      function X(p) { return cx + s * p[0]; } function Y(p) { return cy - s * p[1]; }
      for (var i = 0; i < N; i++) {
        g.beginPath(); g.moveTo(cx, cy);
        for (var j = 0; j <= 40; j++) { var p = pos((i + j / 40) / N); g.lineTo(X(p), Y(p)); }
        g.closePath(); g.fillStyle = i % 2 ? k.goldSoft : k.greenSoft; g.fill();
      }
      g.strokeStyle = k.ink; g.lineWidth = 2; g.beginPath();
      for (j = 0; j <= 200; j++) { p = pos(j / 200); if (j) g.lineTo(X(p), Y(p)); else g.moveTo(X(p), Y(p)); } g.stroke();
      // the empty focus
      g.strokeStyle = k.muted; g.lineWidth = 1.5; var fx = cx - 2 * e * s; g.beginPath(); g.moveTo(fx - 5, cy - 5); g.lineTo(fx + 5, cy + 5); g.moveTo(fx + 5, cy - 5); g.lineTo(fx - 5, cy + 5); g.stroke();
      g.fillStyle = k.gold; g.beginPath(); g.arc(cx, cy, 8, 0, TAU); g.fill();
      g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('Sun', cx + 10, cy + 16);
      var P = pos(t); g.strokeStyle = k.blue; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(X(P), Y(P)); g.stroke();
      g.fillStyle = k.blue; g.beginPath(); g.arc(X(P), Y(P), 6, 0, TAU); g.fill();
      var r = M.hypot(P[0], P[1]), ratio = (1 + e) / (1 - e);
      c.cv.setAttribute('aria-label', 'Ellipse with eccentricity ' + V.fmt(e) + ', cut into ' + N + ' slices of equal time and equal area');
      out.set('Each colored slice takes 1/' + N + ' of the year and has the same area. Eccentricity ' + V.fmt(e) + ': nearest the Sun ' + V.fmt(1 - e) +
        ', farthest ' + V.fmt(1 + e) + ' (in units of the half-long axis). The planet is now ' + V.fmt(r) + ' away, and it moves ' + V.fmt(ratio, 1) + ' times faster at its nearest than at its farthest.');
    }
    function third(k) {
      var g = c.ctx, w = c.w, h = c.h, L = 54, R = 14, T = 24, B = 40;
      // log-log axes: distance a (AU) from 0.3 to 12, period T (years) from 0.15 to 45
      var ax0 = M.log(0.3), ax1 = M.log(12), ay0 = M.log(0.15), ay1 = M.log(45);
      function X(a) { return L + (w - L - R) * (M.log(a) - ax0) / (ax1 - ax0); } function Y(p) { return h - B - (h - T - B) * (M.log(p) - ay0) / (ay1 - ay0); }
      g.strokeStyle = k.axis; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, T); g.lineTo(L, h - B); g.lineTo(w - R, h - B); g.stroke();
      g.fillStyle = k.muted; g.font = '12px system-ui,sans-serif'; g.textAlign = 'center';
      [0.5, 1, 2, 5, 10].forEach(function (a) { g.fillText(String(a), X(a), h - B + 15); });
      g.fillText('distance from the Sun (Earth = 1)', (L + w - R) / 2, h - 8);
      g.textAlign = 'right'; [0.2, 1, 5, 30].forEach(function (p) { g.fillText(String(p), L - 6, Y(p) + 4); });
      g.save(); g.translate(14, (T + h - B) / 2); g.rotate(-M.PI / 2); g.textAlign = 'center'; g.fillText('years per orbit', 0, 0); g.restore();
      g.strokeStyle = k.green; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0.3), Y(M.pow(0.3, 1.5))); g.lineTo(X(12), Y(M.pow(12, 1.5))); g.stroke();
      PLAN.forEach(function (p, i) {
        g.fillStyle = i === pick ? k.red : k.blue; g.beginPath(); g.arc(X(p[1]), Y(p[2]), i === pick ? 7 : 5, 0, TAU); g.fill();
        var LP = [[8, -8, 'left'], [8, 12, 'left'], [-9, -9, 'right'], [9, 13, 'left'], [-9, -8, 'right'], [-9, 12, 'right']][i];
        g.fillStyle = k.ink; g.textAlign = LP[2]; g.font = (i === pick ? '700 ' : '') + '12px system-ui,sans-serif'; g.fillText(p[0], X(p[1]) + LP[0], Y(p[2]) + LP[1]);
      });
      var p = PLAN[pick], a3 = M.pow(p[1], 3), T2 = p[2] * p[2];
      c.cv.setAttribute('aria-label', 'Chart of period against distance for six planets, on one straight line');
      out.set(p[0] + ': distance ' + p[1] + ', so distance cubed = ' + V.fmt(a3, 3) + '; period ' + p[2] + ' years, so period squared = ' + V.fmt(T2, 3) + '. Nearly equal: <b>period² = distance³</b> when years and Earth-distances are the units.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
