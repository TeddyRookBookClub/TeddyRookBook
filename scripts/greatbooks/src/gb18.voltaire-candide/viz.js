/* gb18.voltaire-candide: visuals (gbw3, our own designs). */
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
/* gb-candide-map: Candide's journey, a schematic map (positions roughly by longitude and latitude; El Dorado is imaginary). */
ML.viz.register('gb-candide-map', function (el, opts, V) {
  var F = frame(el, 400, 260, 'A schematic map of Candide\'s journey'), sv = F.svg, ro = V.readout(el);
  function P(lon, lat) { return [16 + (lon + 80) / 125 * 368, 16 + (62 - lat) / 102 * 228]; }
  var LAND = [
    [[-10, 36], [-9, 43], [-2, 48], [-5, 58], [8, 58], [10, 54], [20, 55], [30, 60], [40, 58], [42, 42], [30, 37], [26, 41], [20, 40], [12, 38], [15, 45], [8, 44], [3, 43], [-6, 36]],
    [[-17, 21], [-10, 35], [10, 37], [32, 31], [35, 28], [43, 12], [51, 11], [40, -15], [30, -34], [18, -34], [12, -15], [10, 4], [-8, 5]],
    [[-80, 8], [-75, 11], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-66, -55], [-74, -48], [-71, -18], [-81, -5]],
    [[-6, 50], [-3, 56], [1, 53], [1, 51]]
  ];
  var ST = [
    [8, 52, 'Westphalia', 'The castle of Thunder-ten-Tronckh, where Pangloss teaches that all is for the best. Candide is kicked out for kissing Cunégonde (ch. I).'],
    [6, 51.5, 'The Bulgar army and Holland', 'Forced into an army, Candide sees a war in which both kings sing hymns of victory. In Holland a kind Anabaptist, Jacques, helps him (ch. II–IV). Target: war.'],
    [-9, 38.7, 'Lisbon', 'A storm, a shipwreck and the great earthquake of 1755. Pangloss explains why it had to be (ch. V–VI). Targets: optimism and persecution.'],
    [-6.3, 36.5, 'Cádiz', 'Candide sails for the New World with Cunégonde and the old woman, who tells a tale of misfortunes (ch. X–XII).'],
    [-58.4, -34.6, 'Buenos Aires', 'The vain governor wants Cunégonde; Candide must flee (ch. XIII). Target: pride and power.'],
    [-56, -24, 'Paraguay', 'The Jesuit colony, where Candide meets Cunégonde\'s brother (ch. XIV–XV).'],
    [-72, -8, 'El Dorado', 'A hidden, peaceful land where gold is pebbles, all worship together without quarrels, and there are no prisons. Candide leaves anyway (ch. XVII–XVIII). An imaginary place.'],
    [-55, 5.8, 'Surinam', 'Candide meets an enslaved man who has been cruelly maimed, and for the first time calls optimism a madness (ch. XIX). Target: slavery.'],
    [2.3, 48.9, 'Paris', 'Cheats and flatterers take his money (ch. XXII). Target: high society.'],
    [-1.1, 50.8, 'Portsmouth', 'From the ship Candide sees an admiral executed \"to encourage the others\" (ch. XXIII). Target: cruelty of the powerful.'],
    [12.3, 45.4, 'Venice', 'A rich senator who is bored with every book and painting (ch. XXIV–XXVI).'],
    [29, 41, 'The garden near Constantinople', 'The friends settle on a small farm. Work keeps away boredom, vice and need: \"we must cultivate our garden\" (ch. XXX).']
  ];
  var s = Math.max(0, Math.min(ST.length - 1, opts.stop || 0));
  function draw() {
    clear(sv);
    S('rect', { x: 8, y: 8, width: 384, height: 244, rx: 10, 'class': 'gbx-sea' }, sv);
    LAND.forEach(function (p) { S('path', { d: 'M' + p.map(function (q) { var c = P(q[0], q[1]); return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' L') + ' Z', 'class': 'gbx-land' }, sv); });
    var pts = ST.map(function (x) { return P(x[0], x[1]); });
    S('path', { d: 'M' + pts.slice(0, s + 1).map(function (c) { return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' L'), 'class': 'gbx-route' }, sv);
    pts.forEach(function (c, i) {
      var g = S('g', { 'class': 'gbx-hit', tabindex: 0, role: 'button', 'aria-label': (i + 1) + '. ' + ST[i][2] }, sv);
      S('circle', { cx: c[0], cy: c[1], r: i === s ? 8 : 5.5, 'class': i === s ? 'gbx-dot-on' : 'gbx-dot' }, g);
      S('circle', { cx: c[0], cy: c[1], r: 11, 'class': 'gbx-hitbox' }, g);
      g.addEventListener('click', function () { s = i; draw(); });
      g.addEventListener('keydown', function (k) { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); s = i; draw(); sv.querySelectorAll('.gbx-hit')[i].focus(); } });
    });
    var c = pts[s]; Tx(sv, Math.max(60, Math.min(340, c[0])), c[1] < 40 ? c[1] + 24 : c[1] - 13, (s + 1) + '. ' + ST[s][2], 'sm b');
    Tx(sv, 384, 246, 'schematic map', 'xs mut', 'end');
    ro.set('<b>' + (s + 1) + '. ' + ST[s][2] + '.</b> ' + ST[s][3]);
  }
  var row = document.createElement('div'); row.className = 'gbx-row'; F.ctl.appendChild(row);
  V.button(row, '◀ Back', function () { s = Math.max(0, s - 1); draw(); });
  V.button(row, 'Next stop ▶', function () { s = Math.min(ST.length - 1, s + 1); draw(); });
  draw();
});
