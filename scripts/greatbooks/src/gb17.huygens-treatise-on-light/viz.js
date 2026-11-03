/* Huygens: a straight wave front meets a boundary; every point it touches starts a wavelet; the line touching the
   wavelets is the new front (refracted below, or reflected above). Our own design. */
(function () {
  function isReduced(V) { return typeof V.reduced === 'function' ? V.reduced() : !!V.reduced; }
  ML.viz.register('gb-huygens-wavelets', function (el, o, V) {
    o = o || {};
    var RM = isReduced(V), D2R = Math.PI / 180;
    var st = { th: 40, v2: o.young ? 0.6 : 0.66, t: 0.62, mode: 'refr', play: false };
    var c = V.canvas(el, { aspect: 1.45, max: 400, min: 230 });
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    var tsl = V.slider(ctl, { label: 'Time', min: 0, max: 1, step: 0.01, value: st.t, fmt: function (v) { return Math.round(v * 100) + '%'; }, input: function (v) { st.t = v; draw(); } });
    if (!o.young) {
      V.slider(ctl, { label: 'Angle of the incoming wave', min: 10, max: 70, step: 1, value: st.th, fmt: function (v) { return v + '°'; }, input: function (v) { st.th = v; draw(); } });
      V.slider(ctl, { label: 'Speed below ÷ speed above', min: 0.4, max: 1, step: 0.01, value: st.v2, fmt: function (v) { return v.toFixed(2); }, input: function (v) { st.v2 = v; draw(); } });
      V.seg(ctl, { label: 'Show', items: [['refr', 'Refraction'], ['refl', 'Reflection']], value: 'refr', change: function (v) { st.mode = v; draw(); } });
    }
    var playBtn = V.button(ctl, 'Play', function () { st.play = !st.play; playBtn.textContent = st.play ? 'Pause' : 'Play'; if (st.play) { if (st.t >= 1) st.t = 0; loop.start(); } });
    var out = V.readout(el);
    var loop = V.loop(el, function (dt) { if (!st.play) { loop.stop(); return; } st.t += dt / 5; if (st.t >= 1) { st.t = 1; st.play = false; playBtn.textContent = 'Play'; } tsl.set(st.t); draw(); });
    if (RM) loop.stop();
    function draw() {
      var k = V.colors(), x = c.ctx, w = c.w, h = c.h, by = h * 0.5;
      x.clearRect(0, 0, w, h); x.fillStyle = k.bg; x.fillRect(0, 0, w, h);
      var refl = st.mode === 'refl';
      if (!refl) { x.fillStyle = k.blueSoft; x.fillRect(0, by, w, h - by); }
      x.strokeStyle = k.axis; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, by); x.lineTo(w, by); x.stroke();
      x.fillStyle = k.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top';
      x.fillText(refl ? 'air' : 'air: fast', 8, 6); if (!refl) x.fillText('glass: slower', 8, by + 6); else x.fillText('mirror', 8, by + 6);
      var th = st.th * D2R, v1 = 1, v2 = refl ? 1 : st.v2;
      // geometry in px: the front crosses the boundary from xa to xb over the full time; time unit chosen so xb - xa fits
      var xa = w * 0.14, xb = w * 0.80, span = xb - xa, Tt = span * Math.sin(th) / v1; // time for the hit point to go xa -> xb
      var t = st.t * Tt, xh = xa + v1 * t / Math.sin(th);
      var d1 = [Math.sin(th), Math.cos(th)]; // incoming direction in px coords (y down): right and down
      // the incoming front: a line through (xh, by) perpendicular to d1, drawn above the boundary
      var fdir = [Math.cos(th), -Math.sin(th)]; // along the front, pointing up-right
      function seg(p, q, col, wid, dash) { x.strokeStyle = col; x.lineWidth = wid; x.setLineDash(dash || []); x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); x.setLineDash([]); }
      // part of the incoming front still above the boundary: from (xh, by) going up-left (direction -fdir... the part not yet arrived is to the right/up)
      var Lf = Math.max(w, h) * 1.2;
      seg([xh, by], [xh + fdir[0] * Lf, by + fdir[1] * Lf], k.ink, 2.5);
      // older fronts, faint
      for (var j = 1; j <= 3; j++) { var tt = t - j * Tt / 4; if (tt < -Tt * 0.6) break; var xx = xa + v1 * tt / Math.sin(th); seg([xx, by], [xx + fdir[0] * Lf, by + fdir[1] * Lf], k.muted, 1, [4, 4]); }
      // wavelets from points between xa and xh
      var N = 7, sgn = refl ? -1 : 1;
      x.strokeStyle = k.gold; x.lineWidth = 1.3;
      for (var i = 0; i <= N; i++) {
        var px = xa + span * i / N; if (px > xh + 0.5) break;
        var ti = (px - xa) * Math.sin(th) / v1, rr = v2 * (t - ti);
        x.beginPath(); x.arc(px, by, Math.max(0, rr), refl ? Math.PI : 0, refl ? 2 * Math.PI : Math.PI); x.stroke();
        x.fillStyle = k.gold; x.beginPath(); x.arc(px, by, 2.5, 0, 7); x.fill();
      }
      // the new front: tangent from (xh, by) to the first wavelet (center xa, radius v2 t)
      var r0 = v2 * t, s2 = Math.min(1, v2 / v1 * Math.sin(th)), th2 = Math.asin(s2);
      if (t > 0 && xh > xa) {
        var dl = xh - xa, tang = Math.sqrt(Math.max(0, dl * dl - r0 * r0));
        // tangent point on the circle: angle from the boundary
        var ang = Math.acos(r0 / dl), tx = xa + r0 * Math.cos(ang), ty = by + sgn * r0 * Math.sin(ang);
        seg([xh, by], [tx, ty], refl ? k.purple : k.green, 3);
        // the ray through the first point, to show the direction
        seg([xa, by], [tx, ty], refl ? k.purple : k.green, 1.5, [5, 4]);
      }
      // incoming ray toward xa
      seg([xa - d1[0] * h * 0.45, by - d1[1] * h * 0.45], [xa, by], k.red, 1.5, [5, 4]);
      var out2 = refl ? 'The reflected front leaves at the same angle it came in: <b>' + st.th + '°</b> on both sides.' :
        'Incoming at <b>' + st.th + '°</b>, continuing at <b>' + (th2 / D2R).toFixed(1) + '°</b>. Check: $\\sin ' + st.th + '^\\circ / \\sin ' + (th2 / D2R).toFixed(1) + '^\\circ = ' + (Math.sin(th) / Math.sin(th2)).toFixed(2) + '$, the ratio of the speeds $' + (1 / v2).toFixed(2) + '$.';
      out.set(o.young ? 'The little ripples in the slow layer are smaller, so the new wave (green) tips over and bends.' : out2);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  });
})();
