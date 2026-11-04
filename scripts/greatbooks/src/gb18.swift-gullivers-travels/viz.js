/* gb18.swift-gullivers-travels: visuals (gbw3, our own designs). */
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
/* gb-gulliver-scale: Gulliver beside a Lilliputian (1 : 12) and a Brobdingnagian (12 : 1); lengths scale by k, areas by k², volumes by k³ (Part I ch. III's 1728). */
ML.viz.register('gb-gulliver-scale', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Gulliver and the people of Lilliput and Brobdingnag'), sv = F.svg, ro = V.readout(el);
  var voy = opts.voyage || 0, k = 12;
  function draw() {
    clear(sv);
    S('line', { x1: 10, y1: 232, x2: 390, y2: 232, 'class': 'gbx-ink' }, sv);
    var big = 200, small = big / k, gx = 150, nx = 280;
    if (voy === 0) { person(sv, gx, 232, big / 43, 'gbx-cloth2'); person(sv, nx, 232, small / 43, 'gbx-cloth3'); Tx(sv, gx, 246, 'Gulliver', 'sm b'); Tx(sv, nx, 246, 'a Lilliputian', 'sm b'); S('path', { d: 'M' + (nx + 14) + ',' + (232 - small) + ' h40', 'class': 'gbx-lead' }, sv); Tx(sv, nx + 58, 232 - small + 4, '1/' + k + ' as tall', 'xs acc', 'start'); }
    else { person(sv, gx, 232, big / 43, 'gbx-cloth3'); person(sv, nx, 232, small / 43, 'gbx-cloth2'); Tx(sv, gx, 246, 'a Brobdingnagian', 'sm b'); Tx(sv, nx, 246, 'Gulliver', 'sm b'); S('path', { d: 'M' + (nx + 14) + ',' + (232 - small) + ' h40', 'class': 'gbx-lead' }, sv); Tx(sv, nx + 58, 232 - small + 4, k + '× smaller', 'xs acc', 'start'); }
    var k2 = k * k, k3 = k2 * k;
    S('rect', { x: 250, y: 12, width: 140, height: 76, rx: 9, 'class': 'gbx-box-gold' }, sv);
    Tx(sv, 320, 30, 'scale factor ' + k, 'sm b'); Tx(sv, 320, 47, 'height × ' + k, 'xs'); Tx(sv, 320, 62, 'skin (area) × ' + k2.toLocaleString('en-US'), 'xs'); Tx(sv, 320, 77, 'body (volume) × ' + k3.toLocaleString('en-US'), 'xs');
    ro.set(voy === 0 ? 'In <b>Lilliput</b> Gulliver is ' + k + ' times taller. Being the same shape, his body holds ' + k + ' × ' + k + ' × ' + k + ' = <b>' + k3.toLocaleString('en-US') + '</b> times as much, so ' + (k === 12 ? 'the emperor\'s mathematicians rightly allowed him food for <b>1,728</b> Lilliputians.' : 'he would need ' + k3.toLocaleString('en-US') + ' Lilliputians\' rations.') : 'In <b>Brobdingnag</b> everyone is ' + k + ' times taller than Gulliver, so a giant\'s body is ' + k3.toLocaleString('en-US') + ' times his. Galileo showed that a giant\'s bones, whose strength grows only as the area (× ' + k2.toLocaleString('en-US') + '), would struggle to carry a weight that grows as the volume (× ' + k3.toLocaleString('en-US') + ').');
  }
  V.seg(F.ctl, { label: 'Voyage', items: [[0, 'I. Lilliput'], [1, 'II. Brobdingnag']], value: voy, change: function (v) { voy = +v; draw(); } });
  V.slider(F.ctl, { label: 'Scale factor', min: 2, max: 12, step: 1, value: k, fmt: function (v) { return v + '×'; }, input: function (v) { k = v; draw(); } });
  draw();
});
