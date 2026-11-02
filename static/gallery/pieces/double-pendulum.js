/* Math Gallery: the double pendulum. Two pendulums start a hair apart (a tiny difference in the first angle) and are
   drawn on top of each other, each with a fading trail of its lower bob. The strip below plots how far apart they are
   (the difference of the lower angles, on a log scale). Equal rods (1 m) and bobs; no friction; RK4 steps of 1/600 s. */
Gallery.piece('double-pendulum', function (g) {
  var c = g.canvas({ aspect: 0.78, max: 600, min: 380, label: 'Two double pendulums that start almost the same, and a chart of how far apart they drift' });
  var G9 = 9.81, P, t, hist, a0 = 120, dExp = -6, trails;
  function deriv(s) {
    var a = s[0], b = s[1], wa = s[2], wb = s[3], d = a - b, den = 3 - Math.cos(2 * d);
    return [wa, wb,
      (-3 * G9 * Math.sin(a) - G9 * Math.sin(a - 2 * b) - 2 * Math.sin(d) * (wb * wb + wa * wa * Math.cos(d))) / den,
      (2 * Math.sin(d) * (2 * wa * wa + 2 * G9 * Math.cos(a) + wb * wb * Math.cos(d))) / den];
  }
  function rk4(s, h) {
    var k1 = deriv(s), k2 = deriv(add(s, k1, h / 2)), k3 = deriv(add(s, k2, h / 2)), k4 = deriv(add(s, k3, h));
    for (var i = 0; i < 4; i++) s[i] += h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  function add(s, k, h) { return [s[0] + k[0] * h, s[1] + k[1] * h, s[2] + k[2] * h, s[3] + k[3] * h]; }
  function wrap(x) { x = (x + Math.PI) % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return x - Math.PI; }
  function reset() {
    var r = a0 * Math.PI / 180, e = Math.pow(10, dExp);
    P = [[r, r, 0, 0], [r + e, r, 0, 0]]; t = 0; hist = []; trails = [[], []]; sample(); g.redraw();
    g.say('Reset. Both start at ' + a0 + ' degrees; the second is ' + Math.pow(10, dExp) + ' radians further.');
  }
  function gap() { return Math.abs(wrap(P[0][1] - P[1][1])) + Math.abs(wrap(P[0][0] - P[1][0])); }
  function sample() { hist.push([t, Math.max(1e-12, gap())]); }
  function bob(s, L, ox, oy) { var x1 = ox + L * Math.sin(s[0]), y1 = oy + L * Math.cos(s[0]); return [x1, y1, x1 + L * Math.sin(s[1]), y1 + L * Math.cos(s[1])]; }

  var L = g.loop(function (dt) {
    var n = Math.round(dt * 600);
    for (var i = 0; i < n; i++) { rk4(P[0], 1 / 600); rk4(P[1], 1 / 600); t += 1 / 600; if (i % 10 === 0) sample(); }
    if (t > 60) { L.pause(); g.say('One minute of motion shown. Press Reset to start again.'); }
    g.redraw();
  }, { stepSize: 1 / 15 });
  g.button('↺ Reset', reset);
  g.slider({ label: 'Start angle', min: 30, max: 175, step: 5, value: a0, fmt: function (v) { return v + '°'; }, input: function (v) { a0 = v; reset(); } });
  g.slider({ label: 'Difference', min: -9, max: -1, step: 1, value: dExp, fmt: function (v) { return sup(v) + ' rad'; }, input: function (v) { dExp = v; reset(); } });
  var st = g.out();

  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, ch = Math.max(90, H * 0.24), ph = H - ch - 8, Lr = Math.min(W / 4.4, ph / 4.3), ox = W / 2, oy = ph / 2 - Lr * 0.05;
    c.clear(col.bg);
    var cols = [col.accent, col.orange];
    // trails
    for (var k = 0; k < 2; k++) {
      var b = bob(P[k], Lr, ox, oy), tr = trails[k]; tr.push([b[2], b[3]]); if (tr.length > 140) tr.shift();
      x.lineWidth = 1.6;
      for (var i = 1; i < tr.length; i++) { x.strokeStyle = col.a(cols[k], i / tr.length * 0.7); x.beginPath(); x.moveTo(tr[i - 1][0], tr[i - 1][1]); x.lineTo(tr[i][0], tr[i][1]); x.stroke(); }
    }
    // rods and bobs (second pendulum drawn dashed over the first)
    for (k = 1; k >= 0; k--) {
      b = bob(P[k], Lr, ox, oy);
      x.strokeStyle = cols[k]; x.lineWidth = k ? 3 : 5; x.setLineDash(k ? [6, 5] : []);
      x.beginPath(); x.moveTo(ox, oy); x.lineTo(b[0], b[1]); x.lineTo(b[2], b[3]); x.stroke(); x.setLineDash([]);
      x.fillStyle = cols[k];
      x.beginPath(); x.arc(b[0], b[1], k ? 6 : 9, 0, 7); x.fill();
      x.beginPath(); x.arc(b[2], b[3], k ? 7 : 11, 0, 7); x.fill();
    }
    x.fillStyle = col.ink; x.beginPath(); x.arc(ox, oy, 4, 0, 7); x.fill();
    // legend
    x.font = '13px system-ui,sans-serif'; x.textBaseline = 'middle';
    x.fillStyle = cols[0]; x.fillRect(10, 12, 14, 4); x.fillStyle = col.ink; x.fillText('Pendulum A', 30, 14);
    x.fillStyle = cols[1]; x.fillRect(10, 30, 14, 4); x.fillStyle = col.ink; x.fillText('Pendulum B (dashed)', 30, 32);
    // chart: gap on a log scale, 1e-10 .. 10, over 0..max(20, t) seconds
    var cy = ph + 8, cl = 46, cw = W - cl - 10, T = Math.max(20, Math.ceil(t / 10) * 10);
    x.fillStyle = col.panel; x.fillRect(0, cy, W, ch);
    function Y(v) { var lg = Math.log(v) / Math.LN10; return cy + 8 + (1 - (lg + 10) / 11) * (ch - 26); }
    x.strokeStyle = col.grid; x.lineWidth = 1; x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'right';
    [-10, -5, 0].forEach(function (e) { var yy = Y(Math.pow(10, e)); x.beginPath(); x.moveTo(cl, yy); x.lineTo(W - 10, yy); x.stroke(); x.fillText(e === 0 ? '1' : sup(e), cl - 5, yy); });
    x.textAlign = 'left'; x.fillText('How far apart (radians, log scale) · time 0 to ' + T + ' s', cl, cy + ch - 8);
    x.strokeStyle = col.red; x.lineWidth = 2; x.beginPath();
    for (i = 0; i < hist.length; i++) { var px = cl + hist[i][0] / T * cw, py = Y(hist[i][1]); if (i) x.lineTo(px, py); else x.moveTo(px, py); }
    x.stroke();
    st.innerHTML = 'Time <b>' + t.toFixed(1) + ' s</b> · apart by <b>' + fmtE(gap()) + ' rad</b>';
  });
  function sup(n) { return '10' + String(n).replace(/-/g, '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }); }
  function fmtE(v) { if (v >= 0.01) return v.toFixed(2); var e = Math.floor(Math.log(v) / Math.LN10), m = v / Math.pow(10, e); return m.toFixed(1) + ' × ' + sup(e); }
  c.onresize = function () { trails = [[], []]; };
  reset();
});
