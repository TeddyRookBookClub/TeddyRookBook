/* gb18.kant-moral-philosophy: visuals (gbw3, our own designs). */
/* gbw3 shared SVG helpers (copied into each gb18 rung by gbw3; styles in gb18.locke-government-and-toleration/viz.css) */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gb-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbx-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function wrap(s, n) { var w = s.split(' '), out = [], line = ''; w.forEach(function (x) { if ((line + ' ' + x).trim().length > n) { if (line) out.push(line); line = x; } else line = (line + ' ' + x).trim(); }); if (line) out.push(line); return out; }
function Tw(par, x, y, s, n, lh, cls, anc) { wrap(s, n).forEach(function (l, i) { Tx(par, x, y + i * lh, l, cls, anc); }); }
function person(g, x, y, s, cls) { /* a generic standing figure, feet at y, in the site's cartoon skin color */
  s = s || 1;
  S('rect', { x: x - 6 * s, y: y - 30 * s, width: 12 * s, height: 18 * s, rx: 5 * s, 'class': cls || 'gbx-cloth' }, g);
  S('rect', { x: x - 5 * s, y: y - 13 * s, width: 4 * s, height: 13 * s, rx: 2 * s, 'class': cls || 'gbx-cloth' }, g);
  S('rect', { x: x + 1 * s, y: y - 13 * s, width: 4 * s, height: 13 * s, rx: 2 * s, 'class': cls || 'gbx-cloth' }, g);
  S('circle', { cx: x, cy: y - 36 * s, r: 6.5 * s, 'class': 'gbx-skin' }, g);
}
function btns(ctl, V, items, cur, fn) { /* a row of toggle-free choice buttons via V.seg */ return V.seg(ctl, { label: items.label, items: items.list, value: cur, change: fn }); }
/* a timeline with focusable markers: ev = [{ y, lab, txt, lane? }] */
function timeline(el, V, ev, o) {
  o = o || {};
  var lanes = o.lanes || null, W = 400, H = lanes ? 210 : 170, F = frame(el, W, H, o.label || 'A timeline'), sv = F.svg, ro = V.readout(el);
  var y0 = o.y0, y1 = o.y1, X = function (y) { return 24 + (y - y0) / (y1 - y0) * (W - 48); }, sel = Math.max(0, Math.min(ev.length - 1, o.sel || 0));
  function laneY(e) { return lanes ? 112 + (e.lane || 0) * 50 : 120; }
  function draw() {
    clear(sv);
    if (lanes) lanes.forEach(function (l, i) {
      var ly = 112 + i * 50; S('line', { x1: X(l.from), y1: ly, x2: X(l.to), y2: ly, 'class': 'gbx-lane gbx-lane' + i }, sv);
      Tx(sv, X(l.from), ly - 10, l.name, 'sm b', 'start');
    }); else S('line', { x1: 20, y1: 120, x2: W - 20, y2: 120, 'class': 'gbx-axis' }, sv);
    var ty = lanes ? H - 12 : 150;
    (o.ticks || []).forEach(function (t) { S('line', { x1: X(t), y1: ty - 26, x2: X(t), y2: ty - 20, 'class': 'gbx-tick' }, sv); Tx(sv, X(t), ty, (t < 0 ? (-t) + ' BC' : (o.ad ? 'AD ' : '') + t), 'sm mut'); });
    ev.forEach(function (e, i) {
      var g = S('g', { 'class': 'gbx-hit', tabindex: 0, role: 'button', 'aria-label': e.lab + ', ' + e.when }, sv), on = i === sel;
      S('circle', { cx: X(e.y), cy: laneY(e), r: on ? 8 : 5.5, 'class': on ? 'gbx-dot-on' : 'gbx-dot' }, g);
      S('rect', { x: X(e.y) - 9, y: laneY(e) - 12, width: 18, height: 24, 'class': 'gbx-hitbox' }, g);
      g.addEventListener('click', function () { sel = i; draw(); });
      g.addEventListener('keydown', function (k) { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); sel = i; draw(); var n = sv.querySelectorAll('.gbx-hit')[i]; if (n) n.focus(); } });
    });
    var e = ev[sel], cx = Math.max(110, Math.min(W - 110, X(e.y)));
    S('line', { x1: X(e.y), y1: laneY(e) - 9, x2: cx, y2: 62, 'class': 'gbx-lead' }, sv);
    Tx(sv, cx, 36, e.when, 'b acc');
    Tw(sv, cx, 54, e.lab, 34, 14, 'b', 'middle');
    ro.set('<b>' + e.when + ': ' + e.lab + '.</b> ' + e.txt);
  }
  var row = document.createElement('div'); row.className = 'gbx-row'; F.ctl.appendChild(row);
  V.button(row, '◀ Earlier', function () { sel = Math.max(0, sel - 1); draw(); });
  V.button(row, 'Later ▶', function () { sel = Math.min(ev.length - 1, sel + 1); draw(); });
  draw();
}
/* gb-maxim-test: Kant's universal-law test (Fundamental Principles, Second Section), with his own examples and everyday ones. */
ML.viz.register('gb-maxim-test', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Kant\'s test: could this maxim be a universal law?'), sv = F.svg, ro = V.readout(el);
  var MX = [
    ['When I need money, I\'ll make a promise I don\'t mean to keep.', 'Everyone makes false promises when in need.', 'No one would believe a promise, so no one could even make one.', 'fails', 'can\'t even be thought as a law', 'Kant\'s own example: the maxim destroys the very practice it relies on.'],
    ['I\'ll cut in line whenever I\'m in a hurry.', 'Everyone cuts in line when in a hurry.', 'There would be no lines left to cut into.', 'fails', 'can\'t even be thought as a law', 'Like the lying promise, it works only if most people don\'t do it.'],
    ['I\'ll never help anyone in need, though I could.', 'No one ever helps anyone.', 'Such a world could exist, but I can\'t will it, since I will need help someday.', 'fails', 'can\'t be willed without contradiction', 'Kant\'s example of a wider duty: helping others.'],
    ['I\'ll let my talents rust and just amuse myself.', 'No one ever develops any talent.', 'Such a world could exist, but a rational being necessarily wills that his abilities be developed.', 'fails', 'can\'t be willed without contradiction', 'Kant\'s example of a duty to oneself.'],
    ['I\'ll keep my promises.', 'Everyone keeps promises.', 'Promises become completely reliable.', 'passes', 'can be a universal law', 'The maxim is consistent as a law for all.'],
    ['I\'ll return what I borrow.', 'Everyone returns what they borrow.', 'Lending works better than ever.', 'passes', 'can be a universal law', 'Consistent as a law for all.']
  ];
  var m = Math.max(0, Math.min(MX.length - 1, opts.m || 0));
  function box(y, lab, txt, cls) { S('rect', { x: 14, y: y, width: 372, height: 50, rx: 9, 'class': cls }, sv); Tx(sv, 26, y + 15, lab, 'xs mut', 'start'); Tw(sv, 26, y + 31, txt, 58, 14, 'sm', 'start'); }
  function draw() {
    clear(sv); var x = MX[m], pass = x[3] === 'passes';
    box(6, '1. My maxim (the rule behind my action)', x[0], 'gbx-box');
    S('path', { d: 'M200,57 v8 m-4,-4 l4,4 l4,-4', 'class': 'gbx-arrow' }, sv);
    box(68, '2. Imagine it as a law of nature for everyone', x[1], 'gbx-box-gold');
    S('path', { d: 'M200,119 v8 m-4,-4 l4,4 l4,-4', 'class': 'gbx-arrow' }, sv);
    box(130, '3. What would that world be like?', x[2], 'gbx-box');
    S('rect', { x: 90, y: 196, width: 220, height: 42, rx: 21, 'class': pass ? 'gbx-box-on' : 'gbx-box-red' }, sv);
    Tx(sv, 200, 214, pass ? 'PASSES' : 'FAILS', 'b ' + (pass ? 'g' : 'red')); Tx(sv, 200, 230, x[4], 'xs');
    ro.set('<b>' + (pass ? 'Passes.' : 'Fails.') + '</b> ' + x[5] + ' Kant\'s formula: act only on a maxim you can at the same time will to be a universal law.');
  }
  V.seg(F.ctl, { label: 'Maxim', items: MX.map(function (x, i) { return [i, ['Lying promise', 'Cutting in line', 'Never helping', 'Wasting talents', 'Keeping promises', 'Returning loans'][i]]; }), value: m, change: function (v) { m = +v; draw(); } });
  draw();
});
