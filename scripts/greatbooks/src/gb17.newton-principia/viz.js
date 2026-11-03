/* Newton: the cannonball on the mountain (paths computed from the inverse-square law) and the Moon test. Our own designs. */
(function () {
  function isReduced(V) { return typeof V.reduced === 'function' ? V.reduced() : !!V.reduced; }
  var GM = 3.986e14, RE = 6.371e6, HM = 600e3; // the mountain is imagined 600 km tall, far above the air

  /* gb-newton-cannon */
  ML.viz.register('gb-newton-cannon', function (el, o, V) {
    o = o || {};
    var RM = isReduced(V), r0 = RE + HM, vc = Math.sqrt(GM / r0), ve = Math.sqrt(2 * GM / r0);
    var st = { v: o.young ? 6 : 7, shots: [], cur: null }, vcs = (vc / 1000).toFixed(2);
    var c = V.canvas(el, { aspect: 1.1, max: 420, min: 260 });
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    var sl;
    if (o.young) {
      V.seg(ctl, { label: 'Launch speed', items: [['3', 'Slow'], ['6', 'Fast'], [vcs, 'Orbit'], ['9.5', 'Faster']], value: '6', change: function (v) { st.v = +v; } });
    } else {
      sl = V.slider(ctl, { label: 'Launch speed', min: 1, max: 12, step: 0.05, value: st.v, fmt: function (v) { return v.toFixed(2) + ' km/s'; }, input: function (v) { st.v = v; } });
    }
    V.button(ctl, 'Fire', fire);
    V.button(ctl, 'Clear', function () { st.shots = []; st.cur = null; draw(); });
    var out = V.readout(el);
    // integrate the path (RK4); returns points and the outcome
    function path(v) {
      var x = 0, y = r0, vx = v * 1000, vy = 0, pts = [[x, y]], t = 0, dt = 4, maxT = 4e5, res = 'orbit', ang = 0, lastA = 0;
      function acc(px, py) { var r2 = px * px + py * py, r = Math.sqrt(r2), a = -GM / (r2 * r); return [a * px, a * py]; }
      while (t < maxT) {
        var a1 = acc(x, y), k1 = [vx, vy, a1[0], a1[1]];
        var a2 = acc(x + k1[0] * dt / 2, y + k1[1] * dt / 2), k2 = [vx + k1[2] * dt / 2, vy + k1[3] * dt / 2, a2[0], a2[1]];
        var a3 = acc(x + k2[0] * dt / 2, y + k2[1] * dt / 2), k3 = [vx + k2[2] * dt / 2, vy + k2[3] * dt / 2, a3[0], a3[1]];
        var a4 = acc(x + k3[0] * dt, y + k3[1] * dt), k4 = [vx + k3[2] * dt, vy + k3[3] * dt, a4[0], a4[1]];
        x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        vx += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]); vy += dt / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
        t += dt; pts.push([x, y]);
        var r = Math.hypot(x, y);
        if (r < RE) { res = 'land'; break; }
        var a = Math.atan2(x, y); if (a < 0) a += 2 * Math.PI; if (a < lastA - 3) { res = 'orbit'; break; } lastA = a;
        if (r > 14 * RE) { res = (vx * vx + vy * vy) / 2 - GM / r < 0 ? 'far' : 'escape'; break; }
        dt = r > 3 * RE ? 20 : 4;
      }
      var dist = res === 'land' ? Math.atan2(x, y) : 0; if (dist < 0) dist += 2 * Math.PI;
      return { pts: pts, res: res, dist: dist * RE / 1000, v: v };
    }
    function viewR() {
      var m = 1.55 * RE;
      st.shots.forEach(function (s) { if (s.res === 'orbit') s.pts.forEach(function (p) { m = Math.max(m, Math.hypot(p[0], p[1]) * 1.08); }); else if (s.res === 'escape' || s.res === 'far') m = Math.max(m, 4 * RE); });
      return Math.min(m, 9 * RE);
    }
    var anim = null;
    function fire() {
      var s = path(st.v); st.shots.push(s); if (st.shots.length > 5) st.shots.shift();
      if (RM) { s.n = s.pts.length; draw(); say(s); return; }
      s.n = 1; st.cur = s; say(null);
      if (!anim) anim = V.loop(el, function (dt) {
        if (!st.cur) return;
        st.cur.n = Math.min(st.cur.pts.length, st.cur.n + Math.max(2, Math.round(st.cur.pts.length * dt / 3.2)));
        draw(); if (st.cur.n >= st.cur.pts.length) { var done = st.cur; st.cur = null; say(done); }
      });
      anim.start();
    }
    function say(s) {
      if (!s) { out.set('Fire!'); return; }
      var v = s.v.toFixed(2) + ' km/s';
      if (s.res === 'land') out.set(o.young ? 'It landed ' + Math.round(s.dist).toLocaleString('en-US') + ' km away. Try faster!' : 'At ' + v + ' the ball lands <b>' + Math.round(s.dist).toLocaleString('en-US') + ' km</b> around the Earth.');
      else if (s.res === 'orbit') out.set(o.young ? 'It went all the way around: an orbit!' : 'At ' + v + ' the ball <b>orbits</b>' + (Math.abs(s.v - vc / 1000) < 0.08 ? ' in a circle (circular speed here is ' + (vc / 1000).toFixed(2) + ' km/s).' : ' on an ellipse, coming back to the mountain top.'));
      else if (s.res === 'far') out.set(o.young ? 'It flew very far out, and will come back one day!' : 'At ' + v + ' the ball climbs far beyond the picture on a long ellipse, and would come back to the mountain top.');
      else out.set(o.young ? 'So fast it flew away into space!' : 'At ' + v + ' the ball <b>escapes</b>: faster than ' + (ve / 1000).toFixed(1) + ' km/s, gravity can never bring it back.');
    }
    function draw() {
      var k = V.colors(), x = c.ctx, w = c.w, h = c.h, R0 = viewR(), s = Math.min(w, h) / 2 / R0, cx = w / 2, cy = h / 2;
      x.clearRect(0, 0, w, h); x.fillStyle = k.bg; x.fillRect(0, 0, w, h);
      function X(px) { return cx + px * s; } function Y(py) { return cy - py * s; }
      // Earth
      x.beginPath(); x.arc(cx, cy, RE * s, 0, 7); x.fillStyle = k.blueSoft; x.fill(); x.strokeStyle = k.blue; x.lineWidth = 2; x.stroke();
      // mountain (exaggerated)
      var mtop = Y(r0), base = Y(RE * 0.97), hw = Math.max(8, (base - mtop) * 0.8);
      x.beginPath(); x.moveTo(cx - hw, base); x.lineTo(cx, mtop); x.lineTo(cx + hw, base); x.closePath(); x.fillStyle = k.greenSoft; x.fill(); x.strokeStyle = k.green; x.lineWidth = 1.5; x.stroke();
      // cannon
      x.fillStyle = k.ink; x.fillRect(cx - 7, mtop - 6, 14, 6); x.fillRect(cx, mtop - 5, 10, 3);
      // shots
      st.shots.forEach(function (sh, i) {
        var n = sh.n || sh.pts.length, fade = st.shots.length - 1 - i;
        x.beginPath(); for (var j = 0; j < n; j++) { var p = sh.pts[j]; if (j) x.lineTo(X(p[0]), Y(p[1])); else x.moveTo(X(p[0]), Y(p[1])); }
        x.strokeStyle = sh.res === 'land' ? k.red : sh.res === 'orbit' || sh.res === 'far' ? k.gold : k.purple; x.globalAlpha = Math.max(0.3, 1 - fade * 0.18); x.lineWidth = 2.2; x.stroke(); x.globalAlpha = 1;
        if (n < sh.pts.length || i === st.shots.length - 1) { var q = sh.pts[n - 1]; x.beginPath(); x.arc(X(q[0]), Y(q[1]), 4, 0, 7); x.fillStyle = k.ink; x.fill(); }
      });
      x.fillStyle = k.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top';
      x.fillText(o.young ? 'The mountain is drawn much too tall.' : 'Mountain 600 km tall, far above the air', 8, 8);
    }
    c.onResize(draw); V.onTheme(draw); draw(); say(null);
    out.set(o.young ? 'Pick a speed and press Fire.' : 'Choose a launch speed and press Fire. Circular speed at the mountain top is ' + (vc / 1000).toFixed(2) + ' km/s; escape speed is ' + (ve / 1000).toFixed(1) + ' km/s.');
    return { update: draw };
  });

  /* gb-newton-moon: gravity against distance, g(r) = 9.8 / r^2 (r in Earth radii), on a log scale */
  ML.viz.register('gb-newton-moon', function (el, o, V) {
    o = o || {};
    var st = { r: 1 };
    var c = V.canvas(el, { aspect: 1.7, max: 320, min: 210 });
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Distance from the Earth’s center', min: 1, max: 64, step: 0.5, value: 1, fmt: function (v) { return v + ' Earth radii'; }, input: function (v) { st.r = v; draw(); } });
    V.button(ctl, 'Go to the Moon (60)', function () { st.r = 60; ctl.querySelector('input').value = 60; ctl.querySelector('input').dispatchEvent(new Event('input')); });
    var out = V.readout(el);
    function draw() {
      var k = V.colors(), x = c.ctx, w = c.w, h = c.h, L = 44, Rt = 12, T = 14, B = h - 30;
      x.clearRect(0, 0, w, h); x.fillStyle = k.bg; x.fillRect(0, 0, w, h);
      function X(r) { return L + (r - 1) / 63 * (w - L - Rt); }
      function Y(g) { var lg = Math.log10(g); return T + (1 - (lg + 3) / 4) * (B - T); } // 10 .. 0.001
      x.strokeStyle = k.grid; x.lineWidth = 1; x.fillStyle = k.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle';
      [10, 1, 0.1, 0.01, 0.001].forEach(function (g) { var y = Y(g); x.beginPath(); x.moveTo(L, y); x.lineTo(w - Rt, y); x.stroke(); x.fillText(String(g), L - 4, y); });
      x.textAlign = 'center'; x.textBaseline = 'top';
      [1, 10, 20, 30, 40, 50, 60].forEach(function (r) { var xx = X(r); x.fillText(String(r), xx, B + 4); });
      x.fillText('distance (Earth radii)', (L + w) / 2, B + 16 > h - 12 ? h - 12 : B + 16);
      x.save(); x.translate(10, (T + B) / 2); x.rotate(-Math.PI / 2); x.textBaseline = 'top'; x.fillText('pull, m/s²', 0, 0); x.restore();
      x.beginPath(); for (var i = 0; i <= 300; i++) { var r = 1 + 63 * i / 300, y = Y(9.8 / (r * r)); if (i) x.lineTo(X(r), y); else x.moveTo(X(r), y); }
      x.strokeStyle = k.blue; x.lineWidth = 2.5; x.stroke();
      // the Moon marker
      x.fillStyle = k.gold; x.beginPath(); x.arc(X(60), Y(9.8 / 3600), 6, 0, 7); x.fill();
      x.fillStyle = k.ink; x.textAlign = 'right'; x.textBaseline = 'bottom'; x.fillText('Moon', X(60) - 8, Y(9.8 / 3600) - 4);
      var g = 9.8 / (st.r * st.r);
      x.fillStyle = k.red; x.beginPath(); x.arc(X(st.r), Y(g), 5, 0, 7); x.fill();
      var fall = 0.5 * g; // meters fallen in the first second
      out.set('At ' + st.r + ' Earth radii the pull is $9.8/' + (st.r * st.r).toLocaleString('en-US') + '$ = <b>' + (g >= 0.01 ? g.toPrecision(3) : (g * 1000).toPrecision(3) + ' mm/s²') + (g >= 0.01 ? ' m/s²' : '') + '</b>. A body there falls ' + (fall >= 0.01 ? fall.toPrecision(3) + ' m' : (fall * 1000).toPrecision(3) + ' mm') + ' in its first second' + (st.r === 60 ? ', and 4.9 m in its first minute: what an apple falls in a second.' : '.'));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  });
})();
