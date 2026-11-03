/* gb-sky: the same motion of Mars (or Jupiter) told two ways.
   Sun-centered: Earth and the planet circle the Sun; the line of sight from Earth to the planet points at the star band.
   Earth-centered: the same sight line drawn from a fixed Earth, which turns into a deferent circle plus an epicycle.
   "In our sky": the planet's direction against the stars over time, so the backward (retrograde) loop shows.
   opts: planet: "mars" | "jupiter"; view: "sun" | "earth" | "sky"; quiet: true hides the readout.
   Circular orbits only (a first picture, as in Copernicus's Book I); real orbits are slightly oval. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  var PL = { mars: { name: 'Mars', r: 1.524, T: 687 }, jupiter: { name: 'Jupiter', r: 5.203, T: 4333 } };
  V.register('gb-sky', function (el, o) {
    o = o || {};
    var pk = PL[o.planet] ? o.planet : 'mars', view = o.view || 'sun', day = 0, playing = false;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.25, min: 260, max: 460 });
    c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'View', items: [['sun', 'Sun at the center'], ['earth', 'Earth at the center'], ['sky', 'In our sky']], value: view, change: function (v) { view = v; draw(); } });
    V.seg(ctl, { label: 'Planet', items: [['mars', 'Mars'], ['jupiter', 'Jupiter']], value: pk, change: function (v) { pk = v; sl.input.max = span(); if (day > span()) day = 0; sl.set(day); draw(); } });
    var sl = V.slider(ctl, { label: 'Days', min: 0, max: span(), step: 1, value: 0, fmt: function (v) { return M.round(v) + ' days'; }, input: function (v) { day = v; draw(); } });
    var pb = V.button(ctl, 'Play', function () { playing = !playing; pb.textContent = playing ? 'Pause' : 'Play'; if (playing) lp.start(); });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function span() { return pk === 'mars' ? 1600 : 1460; }
    function ang(T, d) { return TAU * d / T; }
    function earth(d) { var a = ang(365.25, d); return [M.cos(a), M.sin(a)]; }
    function planet(d) { var p = PL[pk], a = ang(p.T, d) + 0.6; return [p.r * M.cos(a), p.r * M.sin(a)]; }
    function lon(d) { var e = earth(d), p = planet(d); return M.atan2(p[1] - e[1], p[0] - e[0]); }
    function moving(d) { var a = lon(d + 1) - lon(d); while (a > M.PI) a -= TAU; while (a < -M.PI) a += TAU; return a; }
    var lp = V.loop(el, function (dt) {
      if (!playing) return;
      day += dt * (pk === 'mars' ? 120 : 160); if (day > span()) day = 0; sl.set(M.round(day)); draw();
    });
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function dot(x, y, r, col) { var g = c.ctx; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    function ring(x, y, r, col, dash) { var g = c.ctx; g.save(); g.strokeStyle = col; g.lineWidth = 1.3; g.setLineDash(dash || []); g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); }
    function label(s, x, y, col, al) { var g = c.ctx; g.fillStyle = col; g.font = '600 12px system-ui,sans-serif'; g.textAlign = al || 'left'; g.textBaseline = 'middle'; g.fillText(s, x, y); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, cx = w / 2, cy = h / 2, p = PL[pk];
      clear(k);
      var back = moving(day) < 0;
      if (view === 'sky') { drawSky(k); }
      else {
        var R = M.min(w, h) / 2 - 26, outer = p.r + (view === 'earth' ? 1 : 0), s = R * 0.86 / outer;
        // star band
        ring(cx, cy, R, k.muted, [2, 5]);
        for (var i = 0; i < 48; i++) { var a = i * TAU / 48; dot(cx + (R + 8) * M.cos(a), cy - (R + 8) * M.sin(a), 1.3, k.muted); }
        var E = earth(day), P = planet(day);
        if (view === 'sun') {
          ring(cx, cy, s, k.blue); ring(cx, cy, s * p.r, k.red);
          // trail of sight-line marks on the star band
          for (var d = M.max(0, day - 500); d <= day; d += 8) { var L = lon(d); dot(cx + R * M.cos(L), cy - R * M.sin(L), 2.2, moving(d) < 0 ? k.orange : k.green); }
          var ex = cx + s * E[0], ey = cy - s * E[1], px = cx + s * P[0], py = cy - s * P[1], L0 = lon(day);
          g.save(); g.strokeStyle = k.gold; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(ex, ey); g.lineTo(cx + R * M.cos(L0), cy - R * M.sin(L0)); g.stroke(); g.restore();
          dot(cx, cy, 9, k.gold); label('Sun', cx + 12, cy - 10, k.ink);
          dot(ex, ey, 6, k.blue); label('Earth', ex + 9, ey + 10, k.blue);
          dot(px, py, 6, k.red); label(p.name, px + 9, py - 10, k.red);
        } else {
          // Earth fixed: deferent radius r about Earth carries the epicycle center; epicycle radius 1 (= Earth's orbit, the same size for every outer planet)
          var D = [P[0], P[1]], Epi = [-E[0], -E[1]];
          var dx = cx + s * D[0], dy = cy - s * D[1];
          ring(cx, cy, s * p.r, k.purple);
          ring(dx, dy, s, k.teal, [4, 3]);
          g.save(); g.strokeStyle = k.red; g.lineWidth = 1.8; g.beginPath();
          for (var t = M.max(0, day - 800), first = true; t <= day; t += 4) { var q = planet(t), e2 = earth(t), X = cx + s * (q[0] - e2[0]), Y = cy - s * (q[1] - e2[1]); if (first) { g.moveTo(X, Y); first = false; } else g.lineTo(X, Y); }
          g.stroke(); g.restore();
          var mx = cx + s * (P[0] - E[0]), my = cy - s * (P[1] - E[1]);
          g.save(); g.strokeStyle = k.muted; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(dx, dy); g.lineTo(mx, my); g.stroke(); g.restore();
          dot(dx, dy, 3, k.teal);
          dot(cx, cy, 8, k.blue); label('Earth', cx + 11, cy + 12, k.blue);
          dot(mx, my, 6, k.red); label(p.name, mx + 9, my - 10, k.red);
          label('deferent', cx - s * p.r * 0.72, cy - s * p.r * 0.72 - 6, k.purple, 'center');
          label('epicycle', dx, dy - s - 10, k.teal, 'center');
        }
      }
      c.cv.setAttribute('aria-label', (view === 'sun' ? 'Sun-centered picture of Earth and ' : view === 'earth' ? 'Earth-centered picture with a deferent and an epicycle for ' : 'Chart of the direction of ') + p.name + ', day ' + M.round(day) + (back ? ', moving backward' : ', moving forward'));
      out.set('Day ' + M.round(day) + ': ' + p.name + ' is ' + (back ? '<b>moving backward</b> against the stars (retrograde). Earth is passing it on the inside track.' : 'moving forward (eastward) against the stars.') +
        (view === 'earth' ? ' The epicycle turns once a year, the same as Earth’s orbit in the other view.' : ''));
    }
    function drawSky(k) {
      var g = c.ctx, w = c.w, h = c.h, L = 44, Rr = 12, T = 24, B = 34, N = span();
      g.fillStyle = k.ink; g.font = '700 13px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('Direction of ' + PL[pk].name + ' among the stars', L, 14);
      // unwrap longitude over the whole span
      var pts = [], prev = lon(0), acc = prev;
      for (var d = 0; d <= N; d += 2) { var v = lon(d), dv = v - prev; while (dv > M.PI) dv -= TAU; while (dv < -M.PI) dv += TAU; acc += dv; prev = v; pts.push([d, acc]); }
      var lo = pts[0][1], hi = pts[pts.length - 1][1];
      pts.forEach(function (q) { lo = M.min(lo, q[1]); hi = M.max(hi, q[1]); });
      function X(d) { return L + (w - L - Rr) * d / N; } function Y(a) { return h - B - (h - T - B - 10) * (a - lo) / (hi - lo || 1); }
      g.strokeStyle = k.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(L, T + 6); g.lineTo(L, h - B); g.lineTo(w - Rr, h - B); g.stroke();
      g.fillStyle = k.muted; g.font = '12px system-ui,sans-serif'; g.textAlign = 'center';
      for (var y = 0; y <= N; y += 365) g.fillText(y + ' d', X(y), h - B + 16);
      g.save(); g.translate(14, (T + h - B) / 2); g.rotate(-M.PI / 2); g.fillText('eastward →', 0, 0); g.restore();
      for (var i = 1; i < pts.length; i++) { g.strokeStyle = pts[i][1] < pts[i - 1][1] ? k.orange : k.green; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(pts[i - 1][0]), Y(pts[i - 1][1])); g.lineTo(X(pts[i][0]), Y(pts[i][1])); g.stroke(); }
      var cur = pts[M.min(pts.length - 1, M.round(day / 2))];
      g.strokeStyle = k.gold; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(day), T + 6); g.lineTo(X(day), h - B); g.stroke(); g.setLineDash([]);
      g.fillStyle = k.red; g.beginPath(); g.arc(X(cur[0]), Y(cur[1]), 5, 0, TAU); g.fill();
      g.fillStyle = k.orange; g.textAlign = 'right'; g.font = '600 12px system-ui,sans-serif'; g.fillText('orange = backward (retrograde)', w - Rr, h - 6);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: function (q) { if (q && q.view) { view = q.view; draw(); } } };
  });
})();
