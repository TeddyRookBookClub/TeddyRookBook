/* All four: a drumhead vibrating in one mode (Bessel functions) next to an orbital with the same shape of nodes, both
   shown as + and − waves; and a strip of the order in which electrons fill those wave shapes across the periodic table.
   Our own drawing. */
Cx.viz('all-drum', function (v) {
  function J(m, x) { var s = 0, K = 48; for (var i = 0; i < K; i++) { var t = (i + 0.5) / K * Math.PI; s += Math.cos(m * t - x * Math.sin(t)); } return s / K; }
  var L = [
    { k: 's', name: 's', m: 0, z: 2.404826, orb: '1s', ext: 5, f: function (x, y, r) { return Math.exp(-r); } },
    { k: 'p', name: 'p', m: 1, z: 3.831706, orb: '2p', ext: 12, f: function (x, y, r) { return y * Math.exp(-r / 2); } },
    { k: 'd', name: 'd', m: 2, z: 5.135622, orb: '3d', ext: 20, f: function (x, y, r) { return x * y * Math.exp(-r / 3); } },
    { k: 'f', name: 'f', m: 3, z: 6.380162, orb: '4f', ext: 30, f: function (x, y, r) { return (x * x * x - 3 * x * y * y) * Math.exp(-r / 4); } }];
  var cur = 1, t = 0, RES = 96, P1, P2, rad;
  var wrap = Cx.el('div', 'cx-split'); v.stage.appendChild(wrap);
  var d1 = Cx.el('div'), d2 = Cx.el('div'); wrap.appendChild(d1); wrap.appendChild(d2);
  var c1 = v.canvas({ aspect: 1, max: 380, parent: d1, label: 'A round drumhead vibrating: one color is up, the other is down, and the still lines between them are nodes.' });
  var c2 = v.canvas({ aspect: 1, max: 380, parent: d2, label: 'A slice through an atomic orbital, colored the same way: the wave is positive in one color and negative in the other.' });
  var cap1 = Cx.el('span', 'cx-cap'), cap2 = Cx.el('span', 'cx-cap'); d1.appendChild(cap1); d2.appendChild(cap2);
  var off = document.createElement('canvas'); off.width = off.height = RES; var oc = off.getContext('2d'), img = oc.createImageData(RES, RES);
  function build() {
    var o = L[cur], N = 200, R = [], i, j; for (i = 0; i <= N; i++) R.push(J(o.m, o.z * i / N));
    P1 = new Float32Array(RES * RES); P2 = new Float32Array(RES * RES); var mx = 0;
    for (j = 0; j < RES; j++) for (i = 0; i < RES; i++) {
      var x = (i + 0.5) / RES * 2 - 1, y = 1 - (j + 0.5) / RES * 2, r = Math.sqrt(x * x + y * y), a = Math.atan2(y, x);
      P1[j * RES + i] = r > 1 ? NaN : R[Math.round(r * N)] * (o.m ? Math.sin(o.m * a) : 1);
      var X = x * o.ext, Y = y * o.ext, q = o.f(X, Y, Math.sqrt(X * X + Y * Y)); P2[j * RES + i] = q; mx = Math.max(mx, Math.abs(q));
    }
    var m1 = 0; for (i = 0; i < P1.length; i++) if (P1[i] === P1[i]) m1 = Math.max(m1, Math.abs(P1[i]));
    for (i = 0; i < P1.length; i++) { P1[i] /= m1; P2[i] /= mx; }
    cap1.textContent = 'Drum: ' + o.m + ' node line' + (o.m === 1 ? '' : 's');
    cap2.textContent = o.orb + ' orbital: ' + o.m + ' node plane' + (o.m === 1 ? '' : 's');
    strip();
  }
  function hex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function paint(cv, P, amp, c, round) {
    var bg = hex(c.bg), pc = hex(c.dark ? '#e2c072' : '#b8862b'), nc = hex(c.dark ? '#86b4ff' : '#2c63c7'), d = img.data;
    for (var k = 0; k < P.length; k++) {
      var p = P[k], o = k * 4;
      if (p !== p) { d[o] = bg[0]; d[o + 1] = bg[1]; d[o + 2] = bg[2]; d[o + 3] = 0; continue; }
      var s = p * amp, a = Math.min(1, Math.pow(Math.abs(s), 0.6)), col = s >= 0 ? pc : nc;
      d[o] = bg[0] + (col[0] - bg[0]) * a; d[o + 1] = bg[1] + (col[1] - bg[1]) * a; d[o + 2] = bg[2] + (col[2] - bg[2]) * a; d[o + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    var x = cv.ctx, S = Math.min(cv.w, cv.h) - 16, x0 = (cv.w - S) / 2, y0 = (cv.h - S) / 2;
    cv.clear(c.bg); x.imageSmoothingEnabled = true; x.drawImage(off, x0, y0, S, S);
    if (round) { x.strokeStyle = c.muted; x.lineWidth = 3; x.beginPath(); x.arc(cv.w / 2, cv.h / 2, S / 2, 0, 7); x.stroke(); }
  }
  v.draw(function (c) { paint(c1, P1, Math.cos(t * 2 * Math.PI * 0.5), c, true); paint(c2, P2, 1, c, false); });
  // the strip: filling order, each piece as wide as the electrons it holds (2, 6, 10, 14)
  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
  var sv = Cx.el('div', 'cx-fill'); sv.setAttribute('role', 'group'); sv.setAttribute('aria-label', 'The order in which electrons fill orbitals, 1s to 7p. Each piece is as wide as the number of electrons it holds.'); v.stage.appendChild(sv);
  var note = Cx.el('p', 'cx-fill-n', 'Filling order, left to right. Each piece is as wide as the electrons it holds: s 2, p 6, d 10, f 14. Those widths are the blocks of the periodic table.'); v.stage.appendChild(note);
  function strip() {
    var W = { s: 2, p: 6, d: 10, f: 14 };
    sv.innerHTML = '';
    ORDER.forEach(function (o) {
      var k = o[1], b = Cx.el('button', 'cx-fb cx-fb-' + k, o); b.type = 'button';
      b.style.flex = W[k] + ' 1 ' + (W[k] * 0.4) + 'rem'; b.setAttribute('aria-pressed', k === L[cur].k ? 'true' : 'false');
      b.title = o + ': holds ' + W[k] + ' electrons'; b.addEventListener('click', function () { pick('spdf'.indexOf(k)); }); sv.appendChild(b);
    });
  }
  var selEl;
  function pick(i) { cur = i; selEl.value = String(i); build(); v.redraw(); v.say(L[i].orb + ' and the drum mode with ' + L[i].m + ' node lines.'); }
  selEl = v.select('Wave shape', L.map(function (o, i) { return [String(i), o.name + ': ' + o.orb + ' and drum mode (' + o.m + ', 1)']; }), '1', function (s) { pick(+s); });
  v.loop(function (dt) { t += dt; v.redraw(); }, { label: 'Vibrate' });
  v.button('♪ Strike the drum', function () {
    var Z = [[2.404826, 1], [3.831706, 0.7], [5.135622, 0.5], [5.520078, 0.45], [6.380162, 0.35], [7.015587, 0.3], [7.588342, 0.22], [8.417244, 0.18]];
    Z.forEach(function (q) { Cx.tone(110 * q[0] / 2.404826, 1.6 / Math.sqrt(q[0] / 2.4), { gain: 0.16 * q[1], attack: 0.003, release: 1.2 / Math.sqrt(q[0] / 2.4) }); });
  }, { pri: true });
  v.button('♪ This mode alone', function () { Cx.tone(110 * L[cur].z / 2.404826, 1.5, { gain: 0.2, release: 1.1 }); });
  build();
});
