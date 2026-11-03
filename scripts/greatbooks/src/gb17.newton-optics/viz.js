/* Newton: a beam of sunlight through a prism in a dark room, with the second prism of the crucial experiment.
   Rays are traced with the law of refraction; the glass index follows a Cauchy formula n = A + B / lambda^2. Our own design. */
(function () {
  var BANDS = [['red', 680, '#ff4b3e'], ['orange', 610, '#ff9a2e'], ['yellow', 580, '#ffe24a'], ['green', 530, '#4cd964'], ['blue', 470, '#3fa9ff'], ['indigo', 440, '#6c63ff'], ['violet', 405, '#b26bff']];
  function nGlass(l) { return 1.590 + 14000 / (l * l); } // a very dense flint glass, so the spread is easy to see
  function refr(d, nrm, n1, n2) { // unit direction d, unit normal nrm pointing against d's side; returns new dir or null (total reflection)
    var cos = -(d[0] * nrm[0] + d[1] * nrm[1]); if (cos < 0) { nrm = [-nrm[0], -nrm[1]]; cos = -cos; }
    var r = n1 / n2, k = 1 - r * r * (1 - cos * cos); if (k < 0) return null;
    var t = r * cos - Math.sqrt(k); return [r * d[0] + t * nrm[0], r * d[1] + t * nrm[1]];
  }
  function hit(p, d, a, b) { // ray p + s d against segment a-b: returns s or -1
    var ex = b[0] - a[0], ey = b[1] - a[1], den = d[0] * ey - d[1] * ex; if (Math.abs(den) < 1e-12) return -1;
    var s = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den, u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
    return s > 1e-9 && u >= 0 && u <= 1 ? s : -1;
  }
  function tri(cx, cy, size, rot) { var p = []; for (var i = 0; i < 3; i++) { var a = rot + Math.PI / 2 + i * 2 * Math.PI / 3; p.push([cx + size * Math.cos(a), cy - size * Math.sin(a)]); } return p; }
  function through(p, d, poly, n) { // enter and leave a prism; returns [entry, exit, dirOut] or null
    var best = -1, bi = -1, i, s;
    for (i = 0; i < 3; i++) { s = hit(p, d, poly[i], poly[(i + 1) % 3]); if (s > 0 && (best < 0 || s < best)) { best = s; bi = i; } }
    if (bi < 0) return null;
    var e = [p[0] + best * d[0], p[1] + best * d[1]];
    function nrmOf(i) { var a = poly[i], b = poly[(i + 1) % 3], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey); return [ey / L, -ex / L]; }
    var d2 = refr(d, nrmOf(bi), 1, n); if (!d2) return null;
    var best2 = -1, bj = -1;
    for (i = 0; i < 3; i++) { if (i === bi) continue; s = hit(e, d2, poly[i], poly[(i + 1) % 3]); if (s > 0 && (best2 < 0 || s < best2)) { best2 = s; bj = i; } }
    if (bj < 0) return null;
    var x = [e[0] + best2 * d2[0], e[1] + best2 * d2[1]], d3 = refr(d2, nrmOf(bj), n, 1);
    if (!d3) return [e, x, null];
    return [e, x, d3];
  }
  ML.viz.register('gb-newton-prism', function (el, o, V) {
    o = o || {};
    var st = { rot: 0, crucis: false, pick: 0 };
    var c = V.canvas(el, { aspect: 1.75, max: 360, min: 200 });
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    if (!o.young) {
      V.slider(ctl, { label: 'Turn the prism', min: -14, max: 14, step: 0.5, value: 0, fmt: function (v) { return (v > 0 ? '+' : '') + v + '°'; }, input: function (v) { st.rot = v; draw(); } });
      V.seg(ctl, { label: 'Second prism', items: [['off', 'One prism'], ['on', 'Crucial experiment']], value: 'off', change: function (v) { st.crucis = v === 'on'; draw(); } });
      var pk = V.seg(ctl, { label: 'Color through the slit', items: BANDS.map(function (b, i) { return [String(i), b[0]]; }), value: '0', change: function (v) { st.pick = +v; draw(); } });
      pk.el.classList.add('gbsc-colors');
    }
    var out = V.readout(el);
    function draw() {
      var k = V.colors(), x = c.ctx, w = c.w, h = c.h;
      x.clearRect(0, 0, w, h);
      x.fillStyle = '#0d1114'; x.fillRect(0, 0, w, h); // the dark chamber, dark in both themes
      var s = Math.min(w / 10, h / 5.6), px = w * 0.30, py = h * 0.64, size = s * 1.05;
      var rot = Math.PI + st.rot * Math.PI / 180, poly = tri(px, py, size, rot);
      var n0 = nGlass(580), half = (2 * Math.asin(n0 * 0.5) - Math.PI / 3) / 2; // half the least deviation
      var mX = px - 0.433 * size, mY = py + 0.25 * size, hy = Math.max(8, mY - (mX - 10) * Math.tan(half));
      // shutter and hole
      x.fillStyle = '#3a3226'; x.fillRect(0, 0, 10, h); x.fillStyle = '#ffe9a8'; x.fillRect(0, hy - 3, 10, 6);
      var start = [10, hy], dir = [Math.cos(half), Math.sin(half)];
      var screenX = st.crucis ? w * 0.56 : w - 14, ends = [];
      // incoming white beam
      var first = through(start, dir, poly, nGlass(580));
      if (first) { x.strokeStyle = '#fff8e6'; x.lineWidth = 3; x.beginPath(); x.moveTo(start[0], start[1]); x.lineTo(first[0][0], first[0][1]); x.stroke(); }
      BANDS.forEach(function (b, i) {
        var r = through(start, dir, poly, nGlass(b[1])); if (!r || !r[2]) return;
        x.strokeStyle = b[2]; x.globalAlpha = 0.85; x.lineWidth = 1.6; x.beginPath(); x.moveTo(r[0][0], r[0][1]); x.lineTo(r[1][0], r[1][1]);
        var sx = (screenX - r[1][0]) / r[2][0], ey = r[1][1] + sx * r[2][1]; x.lineTo(screenX, ey); x.stroke(); x.globalAlpha = 1;
        ends.push([ey, b, r]);
      });
      // prism glass
      x.beginPath(); x.moveTo(poly[0][0], poly[0][1]); x.lineTo(poly[1][0], poly[1][1]); x.lineTo(poly[2][0], poly[2][1]); x.closePath();
      x.fillStyle = 'rgba(170,210,255,0.16)'; x.fill(); x.strokeStyle = '#cfe3ff'; x.lineWidth = 1.5; x.stroke();
      // screen
      x.fillStyle = '#e9e4d8'; x.fillRect(screenX, 0, 4, h);
      if (ends.length) {
        var y0 = Math.min.apply(null, ends.map(function (e) { return e[0]; })), y1 = Math.max.apply(null, ends.map(function (e) { return e[0]; }));
        ends.forEach(function (e, i) { x.fillStyle = e[1][2]; x.fillRect(screenX - 3, e[0] - 3, 7, 6); });
        x.fillStyle = '#e9e4d8'; x.font = '12px system-ui,sans-serif'; x.textAlign = 'right'; x.textBaseline = 'middle';
        if (!st.crucis) { x.fillText('red', screenX - 8, ends[0][0]); x.fillText('violet', screenX - 8, ends[ends.length - 1][0]); }
      }
      var msg = '';
      if (st.crucis && ends.length) {
        // a slit in the first screen lets one color through, onto a second prism
        var e = ends.filter(function (q) { return q[1] === BANDS[st.pick]; })[0] || ends[0];
        var sy = e[0], d0 = e[2][2], L2 = w * 0.15 / d0[0], R2 = size * 0.85, rot2 = -Math.atan2(d0[1], d0[0]) - half,
          cr = Math.cos(rot2), sr = Math.sin(rot2), ox = -0.433 * R2, oy = 0.25 * R2, offx = ox * cr - oy * sr, offy = ox * sr + oy * cr,
          Mx = screenX + 4 + d0[0] * L2, My = sy + d0[1] * L2, p2 = tri(Mx - offx, My + offy, R2, rot2); // turned to its angle of least deviation
        x.fillStyle = '#0d1114'; x.fillRect(screenX - 1, sy - 4, 6, 8);
        var r2 = through([screenX + 4, sy], d0, p2, nGlass(e[1][1]));
        x.strokeStyle = e[1][2]; x.lineWidth = 2;
        if (r2 && r2[2]) {
          x.beginPath(); x.moveTo(screenX + 4, sy); x.lineTo(r2[0][0], r2[0][1]); x.lineTo(r2[1][0], r2[1][1]);
          var sx2 = (w - 10 - r2[1][0]) / r2[2][0]; x.lineTo(w - 10, r2[1][1] + sx2 * r2[2][1]); x.stroke();
          x.fillStyle = e[1][2]; x.fillRect(w - 13, r2[1][1] + sx2 * r2[2][1] - 4, 8, 8);
          msg = 'Only <b>' + e[1][0] + '</b> passes the slit. The second prism bends it again, but it stays ' + e[1][0] + ': no new colors appear.';
        } else { x.beginPath(); x.moveTo(screenX + 4, sy); x.lineTo(screenX + 4 + 60 * d0[0], sy + 60 * d0[1]); x.stroke(); msg = 'Only ' + e[1][0] + ' passes the slit.'; }
        x.beginPath(); x.moveTo(p2[0][0], p2[0][1]); x.lineTo(p2[1][0], p2[1][1]); x.lineTo(p2[2][0], p2[2][1]); x.closePath();
        x.fillStyle = 'rgba(170,210,255,0.16)'; x.fill(); x.strokeStyle = '#cfe3ff'; x.lineWidth = 1.5; x.stroke();
      }
      if (!msg) {
        if (ends.length > 1) {
          var dv = ends.map(function (q) { return Math.atan2(q[2][2][1], q[2][2][0]); }), spread = Math.abs(dv[dv.length - 1] - dv[0]) * 180 / Math.PI;
          msg = o.young ? 'White light in, a rainbow out: violet bends the most, red the least.' : 'The colors leave the prism spread over about <b>' + spread.toFixed(1) + '°</b>. In this very dense flint glass $n$ runs from ' + nGlass(680).toFixed(3) + ' (red) to ' + nGlass(405).toFixed(3) + ' (violet).';
        } else msg = 'Turn the prism back: at this angle the light is reflected inside the glass.';
      }
      out.set(msg);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  });
})();
