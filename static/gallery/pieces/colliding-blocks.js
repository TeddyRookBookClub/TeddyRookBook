/* Math Gallery: colliding blocks (G. Galperin, "Playing pool with pi", Regular and Chaotic Dynamics 8, 2003).
   A big block (mass r times the small one) slides at a small block that rests near a wall. Every clack is computed
   exactly, event by event (no small time steps): the time to the next hit is solved directly, then the elastic-collision
   formulas give the new speeds. The count is the number of whole steps of 2*theta that fit in pi, theta = atan(1/sqrt r):
   ceil(pi/theta) - 1, which is 3, 31, 314, 3141 for r = 1, 100, 10^4, 10^6.
   Playback slows down during the burst of clacks (at most a set number per frame) so even 3,141 clacks can be seen.
   The right panel is velocity space scaled by the square roots of the masses, where energy is a circle and each clack a
   reflection ("the hidden circle"). Sound: a short click per clack, made only after a tap, throttled; it sends the window
   event 'trb:sound-start' so the background music ducks. Gallery.clacks(r) is the bare simulation (used by the tests). */
(function () {
  'use strict';
  var W1 = 0.2; // the small block's width in world units (the wall is at x = 0)
  // the whole run for mass ratio r: arrays of event times, positions (left edges) and speeds after each event
  function simulate(r, keep) {
    var t = 0, p1 = 1, p2 = 2.2, v1 = 0, v2 = -1, ev = keep ? { t: [0], p1: [p1], p2: [p2], v1: [v1], v2: [v2], kind: [0] } : null, n = 0, eps = 1e-12;
    for (;;) {
      var tb = v1 > v2 + eps ? (p2 - p1 - W1) / (v1 - v2) : Infinity, tw = v1 < -eps ? p1 / -v1 : Infinity, k;
      if (tb === Infinity && tw === Infinity) break;
      if (tb <= tw) {
        if (tb < 0) tb = 0; t += tb; p1 += v1 * tb; p2 += v2 * tb; p1 = Math.min(p1, p2 - W1);
        var a = ((1 - r) * v1 + 2 * r * v2) / (r + 1), b = ((r - 1) * v2 + 2 * v1) / (r + 1); v1 = a; v2 = b; k = 1;
      } else {
        if (tw < 0) tw = 0; t += tw; p1 = 0; p2 += v2 * tw; v1 = -v1; k = 2;
      }
      n++;
      if (keep) { ev.t.push(t); ev.p1.push(p1); ev.p2.push(p2); ev.v1.push(v1); ev.v2.push(v2); ev.kind.push(k); }
      if (n > 5e6) break;
    }
    return keep ? { n: n, ev: ev } : n;
  }
  function predicted(r) { return Math.ceil(Math.PI / Math.atan(1 / Math.sqrt(r))) - 1; }
  var G = window.Gallery = window.Gallery || {};
  G.clacks = simulate; G.clacksPredicted = predicted;
  if (!G.piece) return;

  G.piece('colliding-blocks', function (g) {
    var M = Math, RATIOS = [1, 100, 10000, 1000000], NAMES = ['1', '100', '10,000', '1,000,000'];
    var opts = { aspect: 0.5, max: 470, min: 300, label: 'Left: a wall, a small block and a big block sliding toward it, with a count of the collisions. Right: the hidden circle, the speeds of the two blocks drawn as one point that hops around a circle.' };
    function shape() { var w = g.stage.clientWidth || 600; opts.aspect = w < 640 ? 1.5 : 0.52; opts.max = w < 640 ? 720 : 480; }
    shape(); window.addEventListener('resize', shape);
    var c = g.canvas(opts);
    var ri = 1, r, run, N, i, tNow, done, endT, th;
    function load() {
      r = RATIOS[ri]; run = simulate(r, true); N = run.n; i = 0; tNow = 0; done = false; th = M.atan(1 / M.sqrt(r));
      endT = run.ev.t[N] + 4; say(); g.redraw();
    }
    function pos(k, t) { var e = run.ev, d = t - e.t[k]; return [M.max(0, e.p1[k] + e.v1[k] * d), e.p2[k] + e.v2[k] * d]; }

    // sound
    var AC = null, soundOn = true, lastClick = 0, ssT = 0;
    function audio() {
      if (AC || !soundOn) return;
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      try { AC = new C(); } catch (e) { AC = null; }
    }
    function click(many) {
      if (!AC || !soundOn) return;
      var now = AC.currentTime; if (now - lastClick < 0.035) return; lastClick = now;
      var nw = Date.now(); if (nw - ssT > 1500) { ssT = nw; try { window.dispatchEvent(new Event('trb:sound-start')); } catch (e) { } }
      try {
        var o = AC.createOscillator(), gn = AC.createGain();
        o.type = 'triangle'; o.frequency.value = many ? 2400 : 1900;
        gn.gain.setValueAtTime(0.0001, now); gn.gain.exponentialRampToValueAtTime(many ? 0.08 : 0.16, now + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        o.connect(gn); gn.connect(AC.destination); o.start(now); o.stop(now + 0.05);
      } catch (e) { }
    }

    // playback: world time runs at 1 unit per second, but at most `cap` clacks happen per frame
    function advance(dt) {
      if (done) return false;
      // during a long quiet stretch before the next clack, the clock speeds up (up to 5 times)
      var quiet = i < N ? tNow - run.ev.t[i] : 0, speed = 1 + M.min(4, M.max(0, quiet - 0.8) * 3);
      var cap = M.max(1, M.ceil(N / 150)), target = tNow + dt * speed, k = 0;
      while (i < N && run.ev.t[i + 1] <= target && k < cap) { i++; k++; }
      if (k) click(k > 1);
      tNow = (k === cap && i < N) ? run.ev.t[i] : target;
      if (i >= N && tNow >= endT) { done = true; say(); }
      g.redraw();
      return !done;
    }
    function nextClack() {
      if (i < N) { i++; tNow = run.ev.t[i]; click(false); } else { tNow = M.min(endT, tNow + 0.5); if (tNow >= endT) done = true; }
      say(); g.redraw();
    }
    var L = g.loop(function (dt) {
      if (!L.playing()) { nextClack(); return; }
      return advance(dt);
    }, { auto: false, stepText: 'Next clack' });
    var playBtn = g.bar.querySelector('.gx-play');
    playBtn.addEventListener('click', function () { audio(); if (done) load(); }, true);
    g.button('Reset', function () { L.pause(); load(); });
    g.select({ label: 'Big block’s mass ÷ small block’s', value: '1', options: RATIOS.map(function (v, k) { return [String(k), NAMES[k]]; }), change: function (v) { ri = +v; L.pause(); load(); } });
    g.toggle('Sound', true, function (on) { soundOn = on; if (on) audio(); });
    var st = g.out();
    g.keys(c.el, {
      ' ': function () { audio(); if (done) load(); L.toggle(); },
      'n': function () { audio(); L.pause(); nextClack(); },
      'r': function () { L.pause(); load(); }
    });
    c.el.setAttribute('aria-keyshortcuts', 'Space N R');

    function say() {
      var msg = 'Mass ratio ' + NAMES[ri] + '. ' + (done ? 'Finished: ' + g.fmt(N) + ' clacks.' : g.fmt(i) + ' clacks so far.');
      g.say(msg);
    }
    function digits() { var s = String(N); return s.length > 1 ? s[0] + '.' + s.slice(1) : s; }

    g.draw(function (col) {
      var x = c.ctx, Wd = c.w, H = c.h, wide = Wd >= 640;
      c.clear(col.bg);
      var bw = wide ? M.round(Wd * 0.6) : Wd, bh = wide ? H : M.round(H * 0.38);
      var cx0 = wide ? bw + 8 : 0, cy0 = wide ? 0 : bh + 8, cw = wide ? Wd - bw - 8 : Wd, chh = wide ? H : H - bh - 8;
      // ---- blocks panel
      x.fillStyle = col.panel; x.fillRect(0, 0, bw, bh);
      var floorY = bh - 34, wallX = 22, view = 3.6, sc = (bw - wallX - 8) / view;
      x.strokeStyle = col.axis; x.lineWidth = 2; x.beginPath(); x.moveTo(wallX, floorY); x.lineTo(bw, floorY); x.moveTo(wallX, 14); x.lineTo(wallX, floorY); x.stroke();
      x.lineWidth = 1; x.beginPath();
      for (var hy = 18; hy < floorY; hy += 10) { x.moveTo(wallX, hy); x.lineTo(wallX - 8, hy + 8); }
      for (var hx = wallX; hx < bw; hx += 12) { x.moveTo(hx, floorY); x.lineTo(hx - 8, floorY + 8); }
      x.stroke();
      var P = pos(i, tNow), lg = M.log(r) / M.LN10, w2 = 0.2 + 0.06 * lg;
      var s1 = W1 * sc, s2 = w2 * sc, x1 = wallX + P[0] * sc, x2 = wallX + P[1] * sc;
      x.fillStyle = col.blue; x.fillRect(x1, floorY - s1, s1, s1);
      x.fillStyle = col.green; x.fillRect(x2, floorY - s2, s2, s2);
      x.font = '12px system-ui,sans-serif'; x.textBaseline = 'bottom'; x.textAlign = 'center'; x.fillStyle = col.ink;
      if (x1 < bw) x.fillText('1 kg', x1 + s1 / 2, floorY - s1 - 3);
      if (x2 < bw) x.fillText(NAMES[ri] + ' kg', M.min(bw - 40, M.max(x2 + s2 / 2, x1 + s1 + 34)), floorY - s2 - 3);
      x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = col.muted; x.font = '13px system-ui,sans-serif';
      x.fillText('Clacks', wallX + 14, 12);
      x.fillStyle = col.ink; x.font = 'bold ' + (wide ? 40 : 32) + 'px ui-monospace,Menlo,Consolas,monospace';
      x.fillText(g.fmt(i), wallX + 14, 28);
      if (done) { x.font = '13px system-ui,sans-serif'; x.fillStyle = col.gold; x.fillText('π = ' + digits() + '…', wallX + 14, wide ? 74 : 66); }
      // ---- the hidden circle
      x.fillStyle = col.panel; x.fillRect(cx0, cy0, cw, chh);
      var R = M.max(40, M.min(cw - 24, chh - 96) / 2), ox = cx0 + cw / 2, oy = cy0 + 52 + (chh - 96) / 2 + 2;
      x.strokeStyle = col.grid; x.lineWidth = 1; x.beginPath(); x.moveTo(ox - R - 10, oy); x.lineTo(ox + R + 10, oy); x.moveTo(ox, oy - R - 10); x.lineTo(ox, oy + R + 10); x.stroke();
      // the "finished" wedge: both blocks moving right, the big one at least as fast (angle 0 to theta)
      x.fillStyle = col.a(col.gold, 0.35); x.beginPath(); x.moveTo(ox, oy); x.arc(ox, oy, R, -M.max(th, 0.004), 0); x.closePath(); x.fill();
      x.strokeStyle = col.axis; x.lineWidth = 1.5; x.beginPath(); x.arc(ox, oy, R, 0, 2 * M.PI); x.stroke();
      var e = run.ev, sr = M.sqrt(r), k;
      function PX(k) { return ox + e.v2[k] * R; } function PY(k) { return oy - e.v1[k] / sr * R; }
      if (N <= 40) { // spokes: the dots sit 2 theta apart around the circle
        x.strokeStyle = col.a(col.muted, 0.35); x.lineWidth = 1; x.beginPath();
        for (k = 0; k <= i; k++) { x.moveTo(ox, oy); x.lineTo(PX(k), PY(k)); }
        x.stroke();
      }
      // the hops: all of them for small counts, the latest 24 for big ones (older hops would paint the disk solid)
      var from = N <= 40 ? 0 : M.max(0, i - 24);
      x.strokeStyle = col.a(col.red, 0.85); x.lineWidth = 1.5; x.beginPath(); x.moveTo(PX(from), PY(from));
      for (k = from + 1; k <= i; k++) x.lineTo(PX(k), PY(k));
      x.stroke();
      // every dot so far, on the rim
      x.fillStyle = col.a(col.red, 0.9); var ds = N > 400 ? 1.2 : 2.2;
      for (k = 0; k <= i; k++) { x.beginPath(); x.arc(PX(k), PY(k), ds, 0, 2 * M.PI); x.fill(); }
      x.fillStyle = col.red; x.beginPath(); x.arc(PX(i), PY(i), 4.5, 0, 2 * M.PI); x.fill();
      x.fillStyle = col.ink; x.font = 'bold 13px system-ui,sans-serif'; x.textBaseline = 'top'; x.textAlign = 'left';
      x.fillText('The hidden circle', cx0 + 8, cy0 + 8);
      x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif';
      x.fillText('→ big block’s speed', cx0 + 8, cy0 + 26);
      x.fillText('↑ small block’s speed, scaled', cx0 + 8, cy0 + 41);
      x.textBaseline = 'bottom'; x.fillStyle = col.ink;
      x.fillText('θ = ' + (th * 180 / M.PI).toPrecision(3) + '°   π ÷ θ = ' + (M.PI / th).toFixed(3), cx0 + 8, cy0 + chh - 24);
      x.fillStyle = col.gold; x.fillText('gold wedge: no more clacks', cx0 + 8, cy0 + chh - 7);
      st.innerHTML = 'Mass ratio <b>' + NAMES[ri] + '</b> · <b>' + g.fmt(i) + '</b> of ' + (done ? '<b>' + g.fmt(N) + '</b>' : '?') + ' clacks' +
        (done ? ' · the count spells π: <b>' + digits() + '</b>' : (i === 0 ? ' · press Play' : ''));
    });
    c.onresize = function () { g.redraw(); };
    load();
  });
})();
