/* Music ∩ Math: Euclidean rhythms (Toussaint, 2005): spread k beats as evenly as possible over n steps. Our own drawing. */
Cx.viz('mm-euclid', function (v) {
  var n = 8, k = 3, rot = 0, cur = -1, timer = 0, NS = 'http://www.w3.org/2000/svg';
  var P = [['3,8', 'Tresillo E(3,8)'], ['5,8', 'Cinquillo E(5,8)'], ['2,5', 'E(2,5)'], ['3,7', 'E(3,7)'], ['4,9', 'E(4,9)'], ['5,12', 'E(5,12)'], ['7,16', 'E(7,16)'], ['4,12', 'E(4,12): even beats']];
  function pat() { var a = []; for (var i = 0; i < n; i++) a.push((i * k) % n < k); var b = []; for (i = 0; i < n; i++) b.push(a[(i + rot) % n]); return b; }
  var s = v.svg('-150 -150 300 300', 'A circle of steps. Filled dots are beats, spread as evenly as possible.');
  s.style.maxWidth = '380px'; s.style.margin = '0 auto';
  var ro = v.readout();
  function E(t, a) { var e = document.createElementNS(NS, t); for (var q in a) e.setAttribute(q, a[q]); s.appendChild(e); return e; }
  v.draw(function (c) {
    s.innerHTML = ''; var p = pat(), pts = [];
    E('circle', { r: 110, fill: 'none', stroke: c.grid, 'stroke-width': 2 });
    for (var i = 0; i < n; i++) { var a = i / n * 2 * Math.PI - Math.PI / 2; if (p[i]) pts.push((110 * Math.cos(a)).toFixed(1) + ',' + (110 * Math.sin(a)).toFixed(1)); }
    if (pts.length > 2) E('polygon', { points: pts.join(' '), fill: c.a(c.math, 0.15), stroke: c.math, 'stroke-width': 2 });
    for (i = 0; i < n; i++) {
      var a2 = i / n * 2 * Math.PI - Math.PI / 2;
      E('circle', { cx: 110 * Math.cos(a2), cy: 110 * Math.sin(a2), r: i === cur ? 15 : 11, fill: p[i] ? (i === cur ? c.gold : c.music) : c.bg, stroke: i === cur ? c.gold : c.muted, 'stroke-width': 2 });
    }
    var t = E('text', { x: 0, y: 6, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: c.ink, 'font-family': 'system-ui,sans-serif' }); t.textContent = 'E(' + k + ',' + n + ')';
    ro.textContent = p.map(function (b) { return b ? 'x' : '·'; }).join(' ');
  });
  var sk, sn;
  function clampK() { if (k > n) k = n; sk.max = n; sk.value = k; sk.show(); }
  sn = v.slider('Steps n', 2, 16, 1, n, function (x) { n = x; rot = rot % n; clampK(); v.redraw(); });
  sk = v.slider('Beats k', 0, 16, 1, k, function (x) { k = Math.min(x, n); clampK(); v.redraw(); });
  v.select('Try', P, '3,8', function (x) { var q = x.split(','); k = +q[0]; n = +q[1]; rot = 0; sn.value = n; sn.show(); clampK(); v.redraw(); });
  v.button('↻ Rotate', function () { rot = (rot + 1) % n; v.redraw(); });
  function stop() { clearInterval(timer); timer = 0; cur = -1; pb.textContent = '▶ Play the rhythm'; pb.setAttribute('aria-pressed', 'false'); v.redraw(); }
  var pb = v.button('▶ Play the rhythm', function () {
    if (timer) return stop();
    var i = 0; pb.textContent = '■ Stop'; pb.setAttribute('aria-pressed', 'true');
    function beat() { var p = pat(); cur = i % n; if (p[cur]) Cx.tone(cur === 0 ? 880 : 660, 0.09, { type: 'square', gain: 0.12, attack: 0.002, release: 0.07 }); else Cx.tone(1760, 0.03, { gain: 0.03, attack: 0.001, release: 0.02 }); v.redraw(); i++; }
    beat(); timer = setInterval(beat, 190);
  }, { pri: true });
  Cx.onStop(function () { if (timer) stop(); });
  v.onShow(function (on) { if (!on && timer) stop(); });
});
