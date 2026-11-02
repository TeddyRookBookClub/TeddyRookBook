/* Music ∩ Patterns: Chladni figures. Sand on a vibrating square plate drifts to the still lines (nodes) of the mode
   z = cos(nπx)cos(mπy) ± cos(mπx)cos(nπy), the classic approximate formula for a square plate. Our own drawing. */
Cx.viz('mpat-chladni', function (v) {
  var n = 1, m = 2, sg = -1, N = 0, X, Y, rnd = v.rng(7), PI = Math.PI;
  var box = document.createElement('div'); box.style.cssText = 'max-width:420px;margin:0 auto'; v.stage.appendChild(box);
  var cv = v.canvas({ aspect: 1, parent: box, label: 'A square plate seen from above. Grains of sand gather along the lines that do not move.' });
  function z(x, y) { return Math.cos(n * PI * x) * Math.cos(m * PI * y) + sg * Math.cos(m * PI * x) * Math.cos(n * PI * y); }
  function scatter() { N = cv.w < 360 ? 4000 : 6000; X = new Float32Array(N); Y = new Float32Array(N); for (var i = 0; i < N; i++) { X[i] = rnd(); Y[i] = rnd(); } }
  function shake(steps) {
    for (var s = 0; s < steps; s++) for (var i = 0; i < N; i++) {
      var a = Math.abs(z(X[i], Y[i])) * 0.05; if (a < 0.0004) continue;
      var x = X[i] + (rnd() - 0.5) * a, y = Y[i] + (rnd() - 0.5) * a;
      X[i] = x < 0 ? -x : x > 1 ? 2 - x : x; Y[i] = y < 0 ? -y : y > 1 ? 2 - y : y;
    }
  }
  scatter();
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, p = 10, S = Math.min(w, h) - 2 * p;
    cv.clear(c.bg);
    x.fillStyle = c.dark ? '#2b2f33' : '#3b4046'; x.fillRect(p, p, S, S);
    x.fillStyle = c.dark ? '#f1dca4' : '#f5e3b0';
    for (var i = 0; i < N; i++) x.fillRect(p + X[i] * S - 0.8, p + Y[i] * S - 0.8, 1.6, 1.6);
    x.fillStyle = c.ink; x.beginPath(); x.arc(p + S / 2, p + S / 2, 3, 0, 7); x.fill();
  });
  function hz() { return Math.round(40 * (n * n + m * m)); }
  var ro = v.readout();
  function info() { ro.textContent = 'Mode (' + n + ', ' + m + ') ' + (sg < 0 ? '−' : '+') + ' · in this model the pitch grows with n² + m², so we play it at ' + hz() + ' Hz'; }
  var MODES = [['1,2,-1', '(1, 2) −'], ['1,2,1', '(1, 2) +'], ['1,3,-1', '(1, 3) −'], ['1,3,1', '(1, 3) +'], ['2,3,-1', '(2, 3) −'], ['1,4,1', '(1, 4) +'], ['2,4,-1', '(2, 4) −'], ['3,4,1', '(3, 4) +'], ['1,5,-1', '(1, 5) −'], ['3,5,1', '(3, 5) +'], ['2,5,-1', '(2, 5) −'], ['4,5,1', '(4, 5) +']];
  v.select('Mode', MODES, '1,2,-1', function (s) { var q = s.split(','); n = +q[0]; m = +q[1]; sg = +q[2]; scatter(); info(); v.redraw(); if (v.reduced || !L.on) { shake(220); v.redraw(); } });
  var L = v.loop(function () { shake(5); v.redraw(); }, { label: 'Vibrate' });
  v.button('Settle now', function () { shake(250); v.redraw(); v.say('The sand has settled on the still lines.'); });
  v.button('Scatter sand', function () { scatter(); v.redraw(); });
  v.button('♪ Hear the mode', function () { Cx.tone(hz(), 1.4, { type: 'sine', gain: 0.2 }); });
  if (v.reduced) shake(220);
  info();
  cv.onresize = function () { };
});
