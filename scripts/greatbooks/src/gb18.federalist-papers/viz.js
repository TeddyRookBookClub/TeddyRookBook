/* gb18.federalist-papers: visuals (gbw3, our own designs). */
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
/* gb-factions: Madison's argument in Federalist No. 10: the more interests a republic contains, the harder for one to form a majority. Shares are a made-up illustration. */
ML.viz.register('gb-factions', function (el, opts, V) {
  var F = frame(el, 400, 230, 'Interests in a small and a large republic'), sv = F.svg, ro = V.readout(el);
  var n = opts.n || 3, seed = 7;
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var NAMES = ['farmers', 'merchants', 'artisans', 'lenders', 'debtors', 'sailors', 'planters', 'shippers', 'millers', 'printers', 'fishers', 'lawyers', 'grocers', 'builders', 'miners', 'weavers', 'brewers', 'teachers', 'tanners', 'smiths', 'coopers', 'bakers', 'carters', 'clerks'];
  function shares() { var r = rnd(seed * 97 + n), w = [], t = 0, i; for (i = 0; i < n; i++) { var x = .4 + r() * (i === 0 ? 1.4 : 1); w.push(x); t += x; } return w.map(function (x, i) { return [NAMES[i % NAMES.length], x / t]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  function draw() {
    clear(sv); var sh = shares(), bw = Math.min(40, 340 / n), top = sh[0][1];
    S('line', { x1: 30, y1: 190 - .5 * 300, x2: 390, y2: 190 - .5 * 300, 'class': 'gbx-lead' }, sv); Tx(sv, 388, 190 - 150 - 5, 'majority (50%)', 'xs acc', 'end');
    sh.forEach(function (s, i) { var h = s[1] * 300, x = 34 + i * (340 / n);
      S('rect', { x: x, y: 190 - h, width: bw - 3, height: h, rx: 2, 'class': s[1] > .5 ? 'gbx-redf' : 'gbx-g', opacity: .8 }, sv);
      if (n <= 8) Tx(sv, x + bw / 2, 204, s[0], 'xs mut'); });
    S('line', { x1: 30, y1: 190, x2: 390, y2: 190, 'class': 'gbx-ink' }, sv);
    var k = 0, acc = 0; while (acc <= .5) { acc += sh[k][1]; k++; }
    Tx(sv, 34, 20, n + ' interests · largest has ' + Math.round(top * 100) + '%', 'sm b', 'start');
    ro.set(top > .5 ? 'With only <b>' + n + '</b> interests, the largest, the ' + sh[0][0] + ', holds a majority by itself and could outvote everyone else. Madison: in a small republic a faction is more likely to be a majority.' : 'With <b>' + n + '</b> interests, the largest holds only ' + Math.round(top * 100) + '%. To make a majority, at least <b>' + k + '</b> different interests must agree, which, Madison argues, is less likely when the aim is to \"invade the rights of other citizens.\" \"Extend the sphere.\"');
  }
  V.slider(F.ctl, { label: 'Number of interests', min: 2, max: 24, step: 1, value: n, input: function (v) { n = v; draw(); } });
  V.button(F.ctl, 'Another republic', function () { seed++; draw(); });
  draw();
});
