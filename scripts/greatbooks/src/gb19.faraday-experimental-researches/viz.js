/* Faraday: a bar magnet and a coil joined to a galvanometer (his paragraph 39). The flux through the coil is modeled from
   the magnet's position; the meter shows the induced voltage, N times the rate of change of flux. Our own design. */
(function () {
  function isReduced(V) { return typeof V.reduced === 'function' ? V.reduced() : !!V.reduced; }
  ML.viz.register('gb-faraday-induction', function (el, o, V) {
    o = o || {};
    var RM = isReduced(V);
    var st = { x: 0, N: o.young ? 100 : 100, target: null, emf: 0, needle: 0, last: 0, dragging: false, wig: 0, wigOn: false };
    var c = V.canvas(el, { aspect: 1.7, max: 330, min: 210 });
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    V.button(ctl, 'Push in', function () { st.target = 1; st.wigOn = false; kick(); });
    V.button(ctl, 'Pull out', function () { st.target = 0; st.wigOn = false; kick(); });
    if (!o.young) {
      V.button(ctl, 'Wiggle', function () { st.wigOn = !st.wigOn; st.target = null; kick(); });
      V.slider(ctl, { label: 'Turns of wire', min: 10, max: 200, step: 10, value: st.N, fmt: function (v) { return v + ' turns'; }, input: function (v) { st.N = v; draw(); } });
    }
    var out = V.readout(el);
    // x = 0: magnet far out to the left; x = 1: magnet fully inside the coil
    function flux(x) { var d = (1 - x) * 3.2; return 1e-4 / Math.pow(1 + d * d, 1.5); } // Wb per turn
    function geom() { var w = c.w, h = c.h, coilX = w * 0.62, coilW = Math.min(w * 0.26, 170), cy = h * 0.62, magL = Math.min(w * 0.3, 160), magH = Math.max(18, h * 0.11);
      var x0 = coilX - coilW / 2 - magL - w * 0.22, x1 = coilX - magL / 2; return { w: w, h: h, coilX: coilX, coilW: coilW, cy: cy, magL: magL, magH: magH, mx: x0 + (x1 - x0) * st.x, x0: x0, x1: x1 }; }
    var prevPhi = flux(0), loop = V.loop(el, step);
    function kick() { loop.start(); }
    function step(dt) {
      if (!dt) return;
      if (st.wigOn) { st.wig += dt * 2.2; st.x = 0.55 + 0.45 * Math.sin(st.wig * Math.PI); }
      else if (st.target !== null && !st.dragging) {
        var sp = 2.2 * dt; if (Math.abs(st.target - st.x) <= sp) { st.x = st.target; st.target = null; } else st.x += sp * Math.sign(st.target - st.x);
      }
      var phi = flux(st.x), e = st.N * (phi - prevPhi) / dt; // sign: pushing in reads + prevPhi = phi;
      st.emf += (e - st.emf) * Math.min(1, dt * 18);
      var tgt = Math.max(-1, Math.min(1, st.emf / 0.25));
      st.needle += (tgt - st.needle) * Math.min(1, dt * 10);
      draw();
      if (!st.dragging && !st.wigOn && st.target === null && Math.abs(st.needle) < 0.002 && Math.abs(st.emf) < 1e-5) { st.needle = 0; st.emf = 0; draw(); loop.stop(); }
    }
    V.drag(c.cv, {
      hit: function (px, py) { var g = geom(); return px > g.mx - 10 && px < g.mx + g.magL + 10 && Math.abs(py - g.cy) < g.magH ? 1 : null; },
      start: function () { st.dragging = true; st.target = null; st.wigOn = false; kick(); },
      move: function (h, px) { var g = geom(); st.x = Math.max(0, Math.min(1, (px - g.magL / 2 - g.x0) / (g.x1 - g.x0))); },
      end: function () { st.dragging = false; }
    });
    function draw() {
      var k = V.colors(), x = c.ctx, g = geom(), w = g.w, h = g.h;
      x.clearRect(0, 0, w, h); x.fillStyle = k.bg; x.fillRect(0, 0, w, h);
      var top = g.cy - g.magH * 1.6, bot = g.cy + g.magH * 1.6, turns = Math.max(4, Math.round(st.N / 12));
      // back half of the coil
      x.strokeStyle = k.orange; x.lineWidth = 2;
      for (var i = 0; i < turns; i++) { var cx = g.coilX - g.coilW / 2 + g.coilW * (i + 0.5) / turns; x.beginPath(); x.ellipse(cx, g.cy, 7, (bot - top) / 2, 0, Math.PI * 0.5, Math.PI * 1.5); x.stroke(); }
      // magnet
      var mx = g.mx, my = g.cy - g.magH / 2;
      x.fillStyle = k.red; x.fillRect(mx + g.magL / 2, my, g.magL / 2, g.magH); x.fillStyle = k.blue; x.fillRect(mx, my, g.magL / 2, g.magH);
      x.fillStyle = '#fff'; x.font = '700 13px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('S', mx + g.magL * 0.25, g.cy); x.fillText('N', mx + g.magL * 0.75, g.cy);
      // front half of the coil
      x.strokeStyle = k.orange; x.lineWidth = 2.2;
      for (i = 0; i < turns; i++) { cx = g.coilX - g.coilW / 2 + g.coilW * (i + 0.5) / turns; x.beginPath(); x.ellipse(cx, g.cy, 7, (bot - top) / 2, 0, -Math.PI * 0.5, Math.PI * 0.5); x.stroke(); }
      // wires to the galvanometer
      var gx = g.coilX, gy = Math.max(46, top - 52), gr = Math.min(40, (top - 10) * 0.6);
      x.strokeStyle = k.muted; x.lineWidth = 1.5; x.beginPath(); x.moveTo(g.coilX - g.coilW / 2, top); x.lineTo(g.coilX - g.coilW / 2, gy); x.lineTo(gx - gr, gy); x.moveTo(g.coilX + g.coilW / 2, top); x.lineTo(g.coilX + g.coilW / 2, gy); x.lineTo(gx + gr, gy); x.stroke();
      // galvanometer
      x.fillStyle = k.panel; x.strokeStyle = k.ink; x.lineWidth = 2; x.beginPath(); x.arc(gx, gy, gr, Math.PI, 0); x.closePath(); x.fill(); x.stroke();
      x.strokeStyle = k.muted; x.lineWidth = 1; for (var t = -4; t <= 4; t++) { var a = -Math.PI / 2 + t * 0.3; x.beginPath(); x.moveTo(gx + Math.cos(a) * gr * 0.82, gy + Math.sin(a) * gr * 0.82); x.lineTo(gx + Math.cos(a) * gr * 0.95, gy + Math.sin(a) * gr * 0.95); x.stroke(); }
      var na = -Math.PI / 2 + st.needle * 1.2; x.strokeStyle = k.red; x.lineWidth = 2.5; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + Math.cos(na) * gr * 0.9, gy + Math.sin(na) * gr * 0.9); x.stroke();
      x.fillStyle = k.ink; x.beginPath(); x.arc(gx, gy, 3, 0, 7); x.fill();
      x.fillStyle = k.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText(o.young ? 'Drag the magnet' : 'Drag the magnet, or use the buttons', 8, 6);
      var mv = st.emf * 1000;
      out.set(o.young ? (Math.abs(mv) < 0.3 ? 'The magnet is not moving, so the meter reads zero.' : mv > 0 ? 'The needle kicks one way!' : 'The needle kicks the other way!') :
        'Flux through each turn: ' + (flux(st.x) * 1e6).toFixed(0) + ' µWb · induced voltage: <b>' + (Math.abs(mv) < 0.05 ? '0' : (mv > 0 ? '+' : '−') + Math.abs(mv).toFixed(1)) + ' mV</b> with ' + st.N + ' turns' + (Math.abs(mv) < 0.05 ? '. Nothing is changing, so nothing is induced.' : '.'));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    if (RM) { /* motion only when the reader presses a button or drags */ }
    return { update: draw };
  });
})();
