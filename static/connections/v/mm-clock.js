/* Music ∩ Math: the circle of fifths as clock arithmetic (mod 12), and why twelve pure fifths miss by a comma. Our own drawing. */
Cx.viz('mm-clock', function (v) {
  var NM = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], C4 = 261.63;
  var step = 7, k = 0, pure = false, NS = 'http://www.w3.org/2000/svg';
  var s = v.svg('-160 -160 320 320', 'A clock with the twelve notes. Each step adds the chosen number of half steps, wrapping around after 12.');
  s.style.maxWidth = '420px'; s.style.margin = '0 auto';
  function E(t, a, p) { var e = document.createElementNS(NS, t); for (var q in a) e.setAttribute(q, a[q]); (p || s).appendChild(e); return e; }
  var ro = v.readout();
  function pos(n, r) { var a = n / 12 * 2 * Math.PI - Math.PI / 2; return [r * Math.cos(a), r * Math.sin(a)]; }
  function cents(j) { return 1200 * Math.log2(Math.pow(1.5, j) / Math.pow(2, Math.floor(Math.log2(Math.pow(1.5, j))))); }
  v.draw(function (c) {
    s.innerHTML = ''; E('circle', { r: 128, fill: 'none', stroke: c.grid, 'stroke-width': 2 });
    var pts = [];
    for (var j = 0; j <= k; j++) {
      var n = (j * step) % 12, rr = 112;
      if (pure && step === 7) { var dc = cents(j) - n * 100; if (dc < -600) dc += 1200; n = n + dc / 100; rr = 112 - j * 2.2; }
      pts.push(pos(n, rr));
    }
    if (pts.length > 1) E('polyline', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: 'none', stroke: c.music, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    for (var i = 0; i < 12; i++) {
      var p = pos(i, 140), hit = false; for (var j2 = 0; j2 <= k; j2++) if ((j2 * step) % 12 === i) hit = true;
      E('circle', { cx: pos(i, 112)[0], cy: pos(i, 112)[1], r: 5, fill: hit ? c.music : c.bg, stroke: c.muted, 'stroke-width': 1.5 });
      var t = E('text', { x: p[0], y: p[1] + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': hit ? 700 : 400, fill: hit ? c.ink : c.muted, 'font-family': 'system-ui,sans-serif' }); t.textContent = NM[i];
    }
    var last = pts[pts.length - 1]; E('circle', { cx: last[0], cy: last[1], r: 8, fill: c.gold });
    var n0 = (k * step) % 12, msg = k + ' × ' + step + ' = ' + k * step + ' ≡ ' + n0 + ' (mod 12): ' + NM[n0];
    if (pure && step === 7) msg += k === 12 ? ' · twelve pure fifths overshoot seven octaves by 23.5 cents (the Pythagorean comma)' : ' · pure 3:2 fifths';
    var t2 = E('text', { x: 0, y: 5, 'text-anchor': 'middle', 'font-size': 13, fill: c.muted, 'font-family': 'system-ui,sans-serif' }); t2.textContent = k ? 'step ' + k : 'start';
    ro.textContent = msg;
  });
  function freq(j) { if (pure && step === 7) { var f = C4 * Math.pow(1.5, j); while (f > 2 * C4) f /= 2; return f; } return C4 * Math.pow(2, ((j * step) % 12) / 12); }
  v.select('Step', [['7', '+7 half steps (fifths)'], ['1', '+1 half step'], ['5', '+5 (fourths)'], ['4', '+4 (major thirds)'], ['3', '+3'], ['2', '+2']], '7', function (x) { step = +x; k = 0; v.redraw(); });
  v.button('Step ▸', function () { if (k < 12) k++; Cx.tone(freq(k), 0.5, { type: 'triangle', gain: 0.2 }); v.redraw(); v.say(ro.textContent); }, { pri: true });
  v.button('Walk all 12', function () { k = 0; v.redraw(); for (var j = 1; j <= 12; j++) (function (j) { Cx.tone(freq(j), 0.4, { type: 'triangle', gain: 0.18, when: j * 0.42 - 0.42 }); setTimeout(function () { k = j; v.redraw(); }, (j - 1) * 420); })(j); });
  v.button('Reset', function () { k = 0; v.redraw(); });
  v.toggle('Pure 3:2 fifths', false, function (on) { pure = on; v.redraw(); });
});
