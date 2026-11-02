/* Music ∩ Patterns ∩ Chemistry: sand on a round vibrating plate (drum modes, Bessel functions) next to a slice through a
   hydrogen orbital drawn as a cloud of dots. Same counts of node lines and node circles. Our own drawing. */
Cx.viz('tri-orbitals', function (v) {
  function J(m, x) { var s = 0, K = 48; for (var i = 0; i < K; i++) { var t = (i + 0.5) / K * Math.PI; s += Math.cos(m * t - x * Math.sin(t)); } return s / K; }
  var O = [
    { id: '1s', m: 0, z: 2.404826, ext: 5, f: function (x, y, r) { return Math.exp(-r); } },
    { id: '2s', m: 0, z: 5.520078, ext: 13, f: function (x, y, r) { return (2 - r) * Math.exp(-r / 2); } },
    { id: '2p', m: 1, z: 3.831706, ext: 13, f: function (x, y, r) { return y * Math.exp(-r / 2); } },
    { id: '3s', m: 0, z: 8.653728, ext: 24, f: function (x, y, r) { return (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3); } },
    { id: '3p', m: 1, z: 7.015587, ext: 24, f: function (x, y, r) { return (6 - r) * y * Math.exp(-r / 3); } },
    { id: '3d', m: 2, z: 5.135622, ext: 22, f: function (x, y, r) { return x * y * Math.exp(-r / 3); } }];
  var cur = 2, rnd = v.rng(11), A = [], Bp = [];
  var wrap = document.createElement('div'); wrap.className = 'cx-split'; v.stage.appendChild(wrap);
  var d1 = document.createElement('div'), d2 = document.createElement('div'); wrap.appendChild(d1); wrap.appendChild(d2);
  var c1 = v.canvas({ aspect: 1, max: 420, parent: d1, label: 'Sand on a round vibrating plate: it collects on the lines and circles that stay still.' });
  var c2 = v.canvas({ aspect: 1, max: 420, parent: d2, label: 'A slice through the middle of a hydrogen orbital: dots are thick where the electron is likely to be, and missing on the nodes.' });
  var cap1 = Cx.el('span', 'cx-cap'), cap2 = Cx.el('span', 'cx-cap'); d1.appendChild(cap1); d2.appendChild(cap2);
  var ro = v.readout();
  function build() {
    var o = O[cur], R = [], i, N = 200; for (i = 0; i <= N; i++) R.push(J(o.m, o.z * i / N));
    function drum(x, y) { var r = Math.sqrt(x * x + y * y); if (r > 1) return null; var q = R[Math.round(r * N)], a = Math.atan2(y, x); return o.m ? q * Math.sin(o.m * a) : q; }
    A = []; var tries = 0; while (A.length < 2600 && tries < 200000) { tries++; var x = rnd() * 2 - 1, y = rnd() * 2 - 1, u = drum(x, y); if (u === null) continue; if (Math.abs(u) < 0.035 || Math.sqrt(x * x + y * y) > 0.975) A.push([x, y]); }
    var mx = 0; for (i = 0; i < 3000; i++) { var x2 = (rnd() * 2 - 1) * o.ext, y2 = (rnd() * 2 - 1) * o.ext, p = o.f(x2, y2, Math.sqrt(x2 * x2 + y2 * y2)); mx = Math.max(mx, p * p); }
    Bp = []; tries = 0; while (Bp.length < 3200 && tries < 400000) { tries++; var x3 = (rnd() * 2 - 1) * o.ext, y3 = (rnd() * 2 - 1) * o.ext, p3 = o.f(x3, y3, Math.sqrt(x3 * x3 + y3 * y3)); if (rnd() * mx * 0.6 < p3 * p3) Bp.push([x3 / o.ext, y3 / o.ext]); }
    var n = +o.id[0], l = o.m, rad = n - l - 1;
    cap1.textContent = 'Drum mode: ' + l + ' line' + (l === 1 ? '' : 's') + ', ' + rad + ' circle' + (rad === 1 ? '' : 's');
    cap2.textContent = o.id + ' orbital (slice)';
    ro.textContent = o.id + ': ' + l + ' flat node' + (l === 1 ? '' : 's') + ' (l = ' + l + ') and ' + rad + ' round node' + (rad === 1 ? '' : 's') + ' (n − l − 1 = ' + rad + '). The plate pattern with the same counts is on the left.';
  }
  v.draw(function (c) {
    [[c1, A, true], [c2, Bp, false]].forEach(function (q) {
      var cv = q[0], x = cv.ctx, s = Math.min(cv.w, cv.h) / 2 - 8, cx = cv.w / 2, cy = cv.h / 2;
      cv.clear(c.bg);
      if (q[2]) { x.fillStyle = c.dark ? '#2b2f33' : '#3b4046'; x.beginPath(); x.arc(cx, cy, s, 0, 7); x.fill(); x.fillStyle = c.dark ? '#f1dca4' : '#f5e3b0'; }
      else { x.strokeStyle = c.grid; x.lineWidth = 1; x.beginPath(); x.moveTo(cx - s, cy); x.lineTo(cx + s, cy); x.moveTo(cx, cy - s); x.lineTo(cx, cy + s); x.stroke(); x.fillStyle = c.chemistry; }
      for (var i = 0; i < q[1].length; i++) x.fillRect(cx + q[1][i][0] * s - 0.9, cy - q[1][i][1] * s - 0.9, 1.8, 1.8);
      if (!q[2]) { x.fillStyle = c.ink; x.beginPath(); x.arc(cx, cy, 2.5, 0, 7); x.fill(); }
    });
  });
  v.select('Orbital', O.map(function (o, i) { return [String(i), o.id]; }), '2', function (s) { cur = +s; build(); v.redraw(); v.say(ro.textContent); });
  v.button('♪ Ring the plate', function () { Cx.tone(140 * O[cur].z / 2.404826, 1.5, { gain: 0.2, release: 1.2 }); });
  build();
});
