/* Music ∩ Math ∩ Patterns: a sound wave built from harmonics (a Fourier series). Drag the bars to set each harmonic's
   strength; the faint curves are the harmonics, the bold one their sum. Plays through a Web Audio PeriodicWave. Our own drawing. */
Cx.viz('tri-fourier', function (v) {
  var N = 10, amp = [], f0 = 196, t = 0;
  var PRE = { pure: function (n) { return n === 1 ? 1 : 0; }, clar: function (n) { return n % 2 ? 1 / n : 0; }, saw: function (n) { return 1 / n; }, tri: function (n) { return n % 2 ? 1 / (n * n) : 0; }, organ: function (n) { return [0, 1, 0.6, 0, 0.5, 0, 0, 0, 0.35, 0, 0][n] || 0; } };
  function preset(k) { for (var n = 1; n <= N; n++) amp[n] = PRE[k](n); }
  preset('clar');
  var cv = v.canvas({ aspect: 0.62, max: 460, min: 320, label: 'Top: a wave and the harmonics that add up to it. Bottom: a bar for each harmonic; drag a bar to change it.' });
  var showParts = true;
  function geo() { var h = cv.h; return { top: h * 0.6, bars: h * 0.62, bh: h * 0.34 }; }
  v.draw(function (c) {
    var x = cv.ctx, w = cv.w, h = cv.h, G = geo(), mid = G.top / 2, sc = G.top * 0.36, sum = 0, n, i;
    cv.clear(c.bg);
    for (n = 1; n <= N; n++) sum += Math.abs(amp[n] || 0); sum = sum || 1;
    x.strokeStyle = c.grid; x.lineWidth = 1; x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
    var K = 360;
    if (showParts) for (n = 1; n <= N; n++) { if (!amp[n]) continue; x.strokeStyle = c.a(c.music, 0.35); x.lineWidth = 1; x.beginPath(); for (i = 0; i <= K; i++) { var p = i / K * 2 * 2 * Math.PI + t; x.lineTo(i / K * w, mid - sc * amp[n] / sum * Math.sin(n * p)); } x.stroke(); }
    x.strokeStyle = c.math; x.lineWidth = 2.6; x.beginPath();
    for (i = 0; i <= K; i++) { var q = i / K * 2 * 2 * Math.PI + t, y = 0; for (n = 1; n <= N; n++) if (amp[n]) y += amp[n] * Math.sin(n * q); x.lineTo(i / K * w, mid - sc * y / sum * 1.6); }
    x.stroke();
    var bw = w / N;
    for (n = 1; n <= N; n++) {
      var a = amp[n] || 0, bx = (n - 1) * bw;
      x.fillStyle = c.panel; x.fillRect(bx + 4, G.bars, bw - 8, G.bh);
      x.fillStyle = c.music; x.fillRect(bx + 4, G.bars + G.bh * (1 - a), bw - 8, G.bh * a);
      x.fillStyle = c.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(String(n), bx + bw / 2, h - 3);
    }
    x.textAlign = 'left';
  });
  function setFrom(e) {
    var r = cv.el.getBoundingClientRect(), G = geo(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (py < G.bars - 20) return false;
    var n = Math.min(N, Math.max(1, Math.floor(px / r.width * N) + 1)); amp[n] = Math.max(0, Math.min(1, 1 - (py - G.bars) / G.bh)); if (amp[n] < 0.04) amp[n] = 0; v.redraw(); return true;
  }
  var drag = false;
  cv.el.addEventListener('pointerdown', function (e) { if (setFrom(e)) { drag = true; try { cv.el.setPointerCapture(e.pointerId); } catch (x) { } } });
  cv.el.addEventListener('pointermove', function (e) { if (drag) setFrom(e); });
  cv.el.addEventListener('pointerup', function () { drag = false; });
  cv.el.style.touchAction = 'pan-y';
  var sel = v.select('Start from', [['clar', 'Odd harmonics (hollow, clarinet-like)'], ['saw', 'All harmonics, 1/n (bright, sawtooth)'], ['tri', 'Odd harmonics, 1/n² (soft)'], ['organ', 'A few chosen harmonics'], ['pure', 'One pure tone']], 'clar', function (k) { preset(k); v.redraw(); });
  v.button('♪ Hear this wave', function () {
    var a = Cx.audio(); if (!a) return; var re = new Float32Array(N + 1), im = new Float32Array(N + 1), n;
    for (n = 1; n <= N; n++) im[n] = amp[n] || 0;
    var o = a.ctx.createOscillator(), g = a.ctx.createGain(), t0 = a.ctx.currentTime;
    o.setPeriodicWave(a.ctx.createPeriodicWave(re, im)); o.frequency.value = f0;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.22, t0 + 0.03); g.gain.setValueAtTime(0.22, t0 + 1.3); g.gain.linearRampToValueAtTime(0, t0 + 1.6);
    o.connect(g); g.connect(a.out); o.start(t0); o.stop(t0 + 1.7);
  }, { pri: true });
  v.toggle('Show the harmonics', true, function (on) { showParts = on; v.redraw(); });
  v.loop(function (dt) { t -= dt * 1.2; v.redraw(); }, { label: 'Move' });
  cv.el.tabIndex = 0;
  cv.el.addEventListener('keydown', function (e) { var n = +e.key; if (n === 0) n = 10; if (n >= 1 && n <= N) { amp[n] = amp[n] > 0 ? 0 : 1 / n; v.redraw(); e.preventDefault(); } });
  v.say('Drag the bars, or press keys 1 to 0 to switch harmonics on and off.');
});
