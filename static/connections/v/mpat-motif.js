/* Music ∩ Patterns: a short tune and its mirror images: transposition (slide), inversion (flip upside down),
   retrograde (play backwards), retrograde inversion (turn half way round). Our own tune and drawing. */
Cx.viz('mpat-motif', function (v) {
  var T = [0, 2, 4, 7, 5, 9, 7, 4, 2, 5, 4, 0], mode = 'P', shift = 5, NS = 'http://www.w3.org/2000/svg', C4 = 261.63;
  var NAMES = { P: 'Original', T: 'Transposed', I: 'Inversion', R: 'Retrograde', RI: 'Retrograde inversion' };
  var DESC = { P: 'the tune as written', T: 'every note moved up by the same amount: a slide', I: 'every leap up becomes the same leap down: a mirror across a horizontal line', R: 'the notes in reverse order: a mirror across a vertical line', RI: 'backwards and upside down: a half turn' };
  function form(md) {
    var a = T.slice(), p0 = T[0];
    if (md === 'T') a = a.map(function (p) { return p + shift; });
    if (md === 'I' || md === 'RI') a = a.map(function (p) { return 2 * p0 - p; });
    if (md === 'R' || md === 'RI') a.reverse();
    return a;
  }
  var s = v.svg('0 0 600 300', 'A grid of notes: time runs left to right, pitch goes up. The faint dots are the original tune; the bold ones the chosen form.');
  var ro = v.readout(), cur = -1;
  function E(t, a, txt) { var e = document.createElementNS(NS, t); for (var q in a) e.setAttribute(q, a[q]); if (txt) e.textContent = txt; s.appendChild(e); return e; }
  v.draw(function (c) {
    s.innerHTML = ''; var A = form(mode), lo = -10, hi = 14, W = 600, H = 300, x0 = 40, dx = (W - x0 - 20) / T.length;
    function Y(p) { return 20 + (hi - p) / (hi - lo) * (H - 40); }
    for (var p = lo; p <= hi; p++) E('line', { x1: x0, x2: W - 10, y1: Y(p), y2: Y(p), stroke: c.grid, 'stroke-width': p % 12 === 0 ? 1.6 : 0.6 });
    E('text', { x: 6, y: Y(0) + 4, 'font-size': 12, fill: c.muted, 'font-family': 'system-ui,sans-serif' }, 'C4');
    E('text', { x: 6, y: Y(12) + 4, 'font-size': 12, fill: c.muted, 'font-family': 'system-ui,sans-serif' }, 'C5');
    if (mode === 'I' || mode === 'RI') E('line', { x1: x0, x2: W - 10, y1: Y(T[0]), y2: Y(T[0]), stroke: c.gold, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    if (mode === 'R' || mode === 'RI') E('line', { x1: x0 + dx * T.length / 2, x2: x0 + dx * T.length / 2, y1: 10, y2: H - 10, stroke: c.gold, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    function path(a, col, w, op) { E('polyline', { points: a.map(function (p, i) { return (x0 + dx * (i + 0.5)).toFixed(1) + ',' + Y(p).toFixed(1); }).join(' '), fill: 'none', stroke: col, 'stroke-width': w, opacity: op }); a.forEach(function (p, i) { E('rect', { x: x0 + dx * i + 4, y: Y(p) - 5, width: dx - 8, height: 10, rx: 4, fill: col, opacity: op }); }); }
    if (mode !== 'P') path(T, c.muted, 1.5, 0.35);
    path(A, c.music, 2.2, 1);
    if (cur >= 0) E('rect', { x: x0 + dx * cur + 2, y: Y(A[cur]) - 8, width: dx - 4, height: 16, rx: 5, fill: 'none', stroke: c.gold, 'stroke-width': 3 });
    ro.textContent = NAMES[mode] + ': ' + DESC[mode] + '.';
  });
  var btns = {};
  ['P', 'T', 'I', 'R', 'RI'].forEach(function (k) { btns[k] = v.button(NAMES[k], function () { mode = k; for (var q in btns) btns[q].setAttribute('aria-pressed', q === k ? 'true' : 'false'); v.redraw(); v.say(ro.textContent); }); btns[k].setAttribute('aria-pressed', k === 'P' ? 'true' : 'false'); });
  var tm = [];
  v.button('♪ Play', function () {
    tm.forEach(clearTimeout); tm = []; var A = form(mode);
    A.forEach(function (p, i) { Cx.tone(C4 * Math.pow(2, p / 12), 0.3, { type: 'triangle', gain: 0.2, when: i * 0.28 }); tm.push(setTimeout(function () { cur = i; v.redraw(); }, i * 280)); });
    tm.push(setTimeout(function () { cur = -1; v.redraw(); }, A.length * 280));
  }, { pri: true });
  Cx.onStop(function () { tm.forEach(clearTimeout); cur = -1; v.redraw(); });
});
