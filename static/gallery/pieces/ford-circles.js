/* Math Gallery: Ford circles. A circle of radius 1/(2q²) rests on the line at every fraction p/q in lowest terms.
   Zoom toward a number (pi − 3, φ − 1, √2 − 1 or e − 2) and see the circles its convergents make; tap a circle to see
   the circles it touches (|ps − qr| = 1). The fuller version is Chapter VII of The Rhythm of Numbers. */
Gallery.piece('ford-circles', function (g) {
  var c = g.canvas({ aspect: 0.5, max: 420, min: 260, label: 'Ford circles: a circle on every fraction. Focus and use plus and minus to zoom, arrows to move, 0 to start over.' });
  var NUMS = { pi: ['π − 3', Math.PI - 3, [7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2]], phi: ['φ − 1', (Math.sqrt(5) - 1) / 2, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], sqrt2: ['√2 − 1', Math.SQRT2 - 1, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]], e: ['e − 2', Math.E - 2, [1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12, 1]] };
  var key = 'pi', v = { cx: 0.5, hw: 0.5 }, tap = null, list = [];
  var st = g.out();
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function convs() { var t = NUMS[key][2], P = [1, 0], Q = [0, 1], out = ['0/1']; for (var i = 0; i < t.length; i++) { P.push(t[i] * P[P.length - 1] + P[P.length - 2]); Q.push(t[i] * Q[Q.length - 1] + Q[Q.length - 2]); if (Q[Q.length - 1] > 1e8) break; out.push(P[P.length - 1] + '/' + Q[Q.length - 1]); } return out; }
  function zoom(f, at) { v.hw = Math.min(0.5, Math.max(1e-10, v.hw / f)); if (at != null) v.cx = at; v.cx = Math.max(-0.5 + v.hw, Math.min(1.5 - v.hw, v.cx)); g.redraw(); }
  g.button('Dive toward the number ›', function () { var a = NUMS[key][1]; zoom(4, a); }, { pri: true });
  g.button('− Zoom out', function () { zoom(0.25); });
  g.button('Start over', function () { v.cx = 0.5; v.hw = 0.5; tap = null; g.redraw(); });
  g.select({ label: 'Number', options: [['pi', 'π − 3'], ['phi', 'φ − 1 (golden)'], ['sqrt2', '√2 − 1'], ['e', 'e − 2']], value: 'pi', change: function (k) { key = k; v.cx = 0.5; v.hw = 0.5; tap = null; g.redraw(); } });
  g.keys(c.el, { '+': function () { zoom(2); }, '=': function () { zoom(2); }, '-': function () { zoom(0.5); }, ArrowLeft: function () { zoom(1, v.cx - v.hw / 4); }, ArrowRight: function () { zoom(1, v.cx + v.hw / 4); }, '0': function () { v.cx = 0.5; v.hw = 0.5; g.redraw(); } });
  c.el.addEventListener('click', function (e) {
    var b = c.el.getBoundingClientRect(), base = c.h - 20, sc = c.w / (2 * v.hw), X = v.cx - v.hw + (e.clientX - b.left) / sc, Y = (base - (e.clientY - b.top)) / sc, f = null;
    list.forEach(function (o) { var r = 1 / (2 * o[1] * o[1]), dx = X - o[0] / o[1], dy = Y - r; if (dx * dx + dy * dy < r * r) f = o; });
    if (f) { tap = f; g.say('Circle ' + f[0] + '/' + f[1] + ' selected.'); g.redraw(); } else zoom(2, X);
  });
  g.draw(function (col) {
    var x = c.ctx, w = c.w, H = c.h, base = H - 20, sc = w / (2 * v.hw), lo = v.cx - v.hw, hi = v.cx + v.hw, a = NUMS[key][1], CV = {};
    c.clear(col.bg); convs().forEach(function (s) { CV[s] = 1; });
    var Qmax = Math.min(300000, Math.floor(Math.sqrt(sc / 0.7))); list = [];
    for (var q = 1; q <= Qmax && list.length < 5000; q++) { var r = 1 / (2 * q * q); for (var p = Math.ceil((lo - r) * q); p <= Math.floor((hi + r) * q); p++) if (gcd(Math.abs(p), q) === 1) list.push([p, q]); }
    var X = function (t) { return (t - lo) * sc; }, touch = 0;
    x.save(); x.beginPath(); x.rect(0, 0, w, base); x.clip();
    list.forEach(function (o) {
      var p = o[0], q = o[1], R = sc / (2 * q * q), x0 = X(p / q), k = p + '/' + q, isC = CV[k], isT = tap && tap[0] === p && tap[1] === q, isN = tap && Math.abs(p * tap[1] - q * tap[0]) === 1;
      if (isN) touch++;
      x.beginPath();
      if (R < 3000) x.arc(x0, base - R, R, 0, 7);
      else { var go = false; for (var px = -2; px <= w + 2; px += 3) { var dx = px - x0; if (Math.abs(dx) >= R) continue; var yb = dx * dx / (R + Math.sqrt(R * R - dx * dx)); if (go) x.lineTo(px, base - yb); else { x.moveTo(px, base - yb); go = true; } } }
      if ((isC || isT || isN) && R < 3000) { x.fillStyle = col.a(isT || isN ? col.teal : col.green, isT ? 0.35 : 0.16); x.fill(); }
      x.strokeStyle = isT || isN ? col.teal : isC ? col.green : col.a(col.muted, 0.7); x.lineWidth = isC || isT ? 2 : 1; x.stroke(); x.lineWidth = 1;
      if (R > 13) { x.font = Math.min(13, 8 + R / 12) + 'px ui-monospace, Menlo, monospace'; x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillStyle = isC ? col.green : col.ink; x.fillText(k, x0, Math.max(14, base - Math.min(R * 0.9, H * 0.55))); }
    });
    x.restore();
    x.strokeStyle = col.ink; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, base); x.lineTo(w, base); x.stroke(); x.lineWidth = 1;
    if (a >= lo && a <= hi) { x.strokeStyle = col.orange; x.setLineDash([5, 4]); x.lineWidth = 1.5; x.beginPath(); x.moveTo(X(a), 0); x.lineTo(X(a), base + 6); x.stroke(); x.setLineDash([]); x.lineWidth = 1; }
    var hit = convs().filter(function (s) { var pq = s.split('/'), qq = +pq[1]; return qq < 2e6 && Math.abs(a - pq[0] / qq) < 1 / (2 * qq * qq); }).slice(0, 6);
    st.innerHTML = 'Zoom ×<b>' + g.fmt(0.5 / v.hw) + '</b> · ' + g.fmt(list.length) + ' circles · the line to <b>' + NUMS[key][0] + '</b> passes through ' + hit.join(', ') + ', …' + (tap ? ' · <b>' + tap[0] + '/' + tap[1] + '</b> touches ' + touch + ' circles in view' : '');
  });
});
