/* gb-terrella: Gilbert's "little earth". A round magnet with its poles; small compass needles placed around it
   tilt more and more as they go from the equator toward a pole (the dip). Drag the needle around the globe, or use
   the slider. For a simple bar-magnet (dipole) field the dip I at magnetic latitude L obeys tan I = 2 tan L.
   opts: lat: 40 (degrees); lines: true (field lines); quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI, RAD = M.PI / 180;
  V.register('gb-terrella', function (el, o) {
    o = o || {};
    var lat = o.lat == null ? 40 : +o.lat, lines = o.lines !== false, ring = true;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.3, min: 260, max: 440 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    var sl = V.slider(ctl, { label: 'Latitude of the needle', min: -90, max: 90, step: 1, value: lat, fmt: function (v) { return M.abs(v) + '° ' + (v > 0 ? 'north' : v < 0 ? 'south' : '(equator)'); }, input: function (v) { lat = v; draw(); } });
    V.seg(ctl, { label: 'Show', items: [['1', 'Field lines on'], ['0', 'Field lines off']], value: lines ? '1' : '0', change: function (v) { lines = v === '1'; draw(); } });
    V.seg(ctl, { label: 'Needles', items: [['1', 'Ring of needles'], ['0', 'One needle']], value: '1', change: function (v) { ring = v === '1'; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function geo() { var w = c.w, h = c.h, R = M.min(w, h) * 0.27; return { cx: w / 2, cy: h / 2, R: R }; }
    function dip(L) { return M.atan(2 * M.tan(L * RAD)) / RAD; }
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    // field direction of a dipole pointing "north up" (the needle's north end points along B); Earth's north geographic pole is a magnetic south pole
    function field(x, y) { var r2 = x * x + y * y, r = M.sqrt(r2), r5 = r2 * r2 * r; // moment m = (0, -1): B ~ 3(m.r)r/r^5 - m/r^3
      var mr = -y; return [3 * mr * x / r5, 3 * mr * y / r5 + 1 / (r2 * r)]; }
    function needle(x, y, ang, len, k, big) {
      var g = c.ctx, dx = M.cos(ang) * len / 2, dy = M.sin(ang) * len / 2;
      g.lineCap = 'round'; g.lineWidth = big ? 5 : 3.5;
      g.strokeStyle = k.red; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, y - dy); g.stroke();
      g.strokeStyle = k.muted; g.beginPath(); g.moveTo(x, y); g.lineTo(x - dx, y + dy); g.stroke();
      g.fillStyle = k.ink; g.beginPath(); g.arc(x, y, big ? 3 : 2, 0, TAU); g.fill();
    }
    function draw() {
      var k = V.colors(), g = c.ctx, G = geo(), cx = G.cx, cy = G.cy, R = G.R;
      clear(k);
      if (lines) {
        g.strokeStyle = k.blueSoft; g.lineWidth = 1.5;
        [1.25, 1.7, 2.4, 3.6, 6].forEach(function (Lm) { // r = Lm cos^2(lat) in units of R
          [-1, 1].forEach(function (side) {
            g.beginPath(); var first = true;
            for (var t = -88; t <= 88; t += 2) { var la = t * RAD, r = Lm * M.cos(la) * M.cos(la); if (r < 1) { first = true; continue; } var X = cx + side * r * R * M.cos(la), Y = cy - r * R * M.sin(la); if (first) { g.moveTo(X, Y); first = false; } else g.lineTo(X, Y); }
            g.stroke();
          });
        });
      }
      // the terrella
      var grd = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      grd.addColorStop(0, k.panel); grd.addColorStop(1, k.grid); g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
      g.strokeStyle = k.ink; g.lineWidth = 2; g.stroke();
      g.strokeStyle = k.muted; g.lineWidth = 1; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.stroke(); g.setLineDash([]);
      g.fillStyle = k.ink; g.font = '700 12px system-ui,sans-serif'; g.textAlign = 'center';
      g.fillText('N', cx, cy - R * 0.72); g.fillText('S', cx, cy + R * 0.78);
      g.font = '12px system-ui,sans-serif'; g.fillStyle = k.muted; g.fillText('equator', cx - R * 0.55, cy - 6);
      function place(Ldeg, side, len, big) {
        var la = Ldeg * RAD, x = side * M.cos(la) * 1.12, y = M.sin(la) * 1.12, B = field(x, y), ang = M.atan2(B[1], B[0]);
        needle(cx + x * R, cy - y * R, ang, len, k, big);
      }
      if (ring) { for (var L = -80; L <= 80; L += 20) { place(L, 1, 18, false); place(L, -1, 18, false); } }
      place(lat, 1, 34, true);
      var I = dip(lat);
      c.cv.setAttribute('aria-label', 'A round magnet with compass needles around it. At latitude ' + lat + ' degrees the needle dips ' + V.fmt(M.abs(I), 0) + ' degrees');
      out.set('At ' + M.abs(lat) + '° ' + (lat > 0 ? 'north' : lat < 0 ? 'south' : '') + ' the needle dips <b>' + V.fmt(M.abs(I), 0) + '°</b> ' + (lat > 0 ? '(north end down)' : lat < 0 ? '(north end up)' : '(it lies flat)') +
        '. Gilbert found the same pattern on his terrella that sailors found on the earth. (Rule for a simple magnet: tan dip = 2 × tan latitude.)');
    }
    var hit = function (px, py) { var G = geo(), r = M.hypot(px - G.cx, py - G.cy); return r > G.R * 0.7 && r < G.R * 1.6 ? 1 : null; };
    V.drag(c.cv, { hit: hit, move: function (hh, px, py) { var G = geo(), a = M.atan2(G.cy - py, M.abs(px - G.cx)) / RAD; lat = M.round(M.max(-90, M.min(90, a))); sl.set(lat); draw(); } });
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
