/* Music ∩ Chemistry: the three ways a water molecule vibrates, where they sit on an infrared spectrum, and an artistic
   sonification: the real frequencies (about 10^14 Hz) divided by 2^38, which keeps their ratios. Our own drawing. */
Cx.viz('mch-ir', function (v) {
  var MODES = [{ k: 'sym', n: 'Symmetric stretch', w: 3657 }, { k: 'bend', n: 'Bend', w: 1595 }, { k: 'asym', n: 'Asymmetric stretch', w: 3756 }];
  var cur = 0, t = 0, C = 2.99792458e10, DIV = Math.pow(2, 38);
  var cv = v.canvas({ aspect: 0.5, max: 340, min: 260, label: 'A water molecule vibrating, and a strip showing where its three vibrations absorb infrared light.' });
  var ro = v.readout();
  function hz(m) { return m.w * C; }
  function info() { var m = MODES[cur], f = hz(m); ro.textContent = m.n + ': ' + m.w + ' cm⁻¹ = ' + (f / 1e14).toFixed(2) + ' × 10¹⁴ vibrations a second. Played 38 octaves lower: ' + (f / DIV).toFixed(0) + ' Hz.'; }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, m = MODES[cur], s = Math.sin(t * 2 * Math.PI * 0.7), A = 0.22;
    cv.clear(c.bg);
    var cx = w / 2, cy = h * 0.38, L = Math.min(w, h) * 0.3, half = 104.5 / 2 * Math.PI / 180;
    var la = 1, lb = 1, ang = half;
    if (m.k === 'sym') { la = lb = 1 + A * s; }
    if (m.k === 'asym') { la = 1 + A * s; lb = 1 - A * s; }
    if (m.k === 'bend') { ang = half * (1 + 0.28 * s); }
    var oy = cy - (m.k === 'sym' ? A * s * L * 0.12 : m.k === 'bend' ? -0.05 * s * L : 0), ox = cx + (m.k === 'asym' ? -A * s * L * 0.1 : 0);
    var H1 = [ox - Math.sin(ang) * L * la, oy + Math.cos(ang) * L * la], H2 = [ox + Math.sin(ang) * L * lb, oy + Math.cos(ang) * L * lb];
    x.strokeStyle = c.muted; x.lineWidth = 5; x.beginPath(); x.moveTo(H1[0], H1[1]); x.lineTo(ox, oy); x.lineTo(H2[0], H2[1]); x.stroke();
    function ball(p, r, col, lab) { x.fillStyle = col; x.beginPath(); x.arc(p[0], p[1], r, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '700 ' + Math.round(r * 0.9) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(lab, p[0], p[1] + r * 0.32); }
    ball([ox, oy], L * 0.3, c.dark ? '#d6455d' : '#c92a3a', 'O'); ball(H1, L * 0.19, c.dark ? '#7e8a96' : '#6b7682', 'H'); ball(H2, L * 0.19, c.dark ? '#7e8a96' : '#6b7682', 'H');
    x.textAlign = 'left';
    // the spectrum strip: 4000 to 400 per cm, high on the left as chemists draw it
    var y0 = h * 0.8, x0 = 30, x1 = w - 20;
    function X(nu) { return x0 + (4000 - nu) / 3600 * (x1 - x0); }
    x.strokeStyle = c.axis; x.lineWidth = 1.2; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y0); x.stroke();
    x.fillStyle = c.muted; x.font = '12px system-ui,sans-serif';
    [4000, 3000, 2000, 1000, 400].forEach(function (nu) { x.fillRect(X(nu), y0, 1, 5); x.fillText(String(nu), X(nu) - 12, y0 + 18); });
    x.fillText('wavenumber, cm⁻¹ (infrared)', x0, y0 + 34 > h - 2 ? h - 2 : y0 + 34);
    MODES.forEach(function (q, i) { x.strokeStyle = i === cur ? c.gold : c.chemistry; x.lineWidth = i === cur ? 4 : 2.5; x.beginPath(); x.moveTo(X(q.w), y0); x.lineTo(X(q.w), y0 - h * 0.13); x.stroke(); });
  });
  v.select('Vibration', MODES.map(function (m, i) { return [String(i), m.n]; }), '0', function (s) { cur = +s; info(); v.redraw(); v.say(ro.textContent); });
  v.loop(function (dt) { t += dt; v.redraw(); }, { label: 'Vibrate' });
  v.button('♪ Hear it (art)', function () { Cx.tone(hz(MODES[cur]) / DIV, 1.4, { gain: 0.2 }); }, { pri: true });
  v.button('♪ All three together', function () { MODES.forEach(function (m) { Cx.tone(hz(m) / DIV, 2, { gain: 0.13 }); }); });
  info();
});
