/* gb18.rousseau-discourses: visuals (gbw3, our own designs). */
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
/* gb-inequality: Rousseau's stages in the Discourse on the Origin of Inequality, Part II. */
ML.viz.register('gb-inequality', function (el, opts, V) {
  var F = frame(el, 400, 220, 'Rousseau\'s story of how inequality began'), sv = F.svg, ro = V.readout(el);
  var ST = [
    ['Alone in the forest', 'Natural man lives alone, with few needs, healthy and free. He feels <b>self-love</b> and <b>pity</b>, and has the power to change, <b>perfectibility</b>. Inequality is slight: only differences of strength and age.'],
    ['Huts and families', 'People build huts with stone tools and live in families. Small groups form; language grows. Rousseau calls this the happiest age, between idleness and our restless self-love.'],
    ['Comparing', 'Gathered under a tree to sing and dance, each wants to be looked at. The best singer, the strongest, the handsomest are esteemed: \"the first step towards inequality, and at the same time towards vice.\"'],
    ['Fields and iron', 'Agriculture and metalworking divide labor. People need each other; some work the land, others make tools. Talents now bring unequal rewards.'],
    ['The first fence', 'Someone encloses land and says \"This is mine.\" Property brings rich and poor, masters and servants, and quarrels.'],
    ['Laws for the rich', 'The rich propose laws and a government \"to guard the weak from oppression,\" which in fact fix property and inequality in place. In time, Rousseau says, it ends in despotism.']
  ];
  var s = Math.max(0, Math.min(ST.length - 1, opts.stage || 0));
  function tree(x, y, k) { S('rect', { x: x - 3 * k, y: y - 26 * k, width: 6 * k, height: 26 * k, 'class': 'gbx-wood' }, sv); S('circle', { cx: x, cy: y - 34 * k, r: 14 * k, 'class': 'gbx-leaf' }, sv); }
  function hut(x, y) { S('path', { d: 'M' + (x - 22) + ',' + y + ' v-22 l22,-18 l22,18 v22 z', 'class': 'gbx-land' }, sv); S('rect', { x: x - 5, y: y - 14, width: 10, height: 14, 'class': 'gbx-wood' }, sv); }
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 150, width: 400, height: 50, 'class': 'gbx-box-on' }, sv);
    if (s === 0) { tree(80, 150, 1.4); tree(300, 150, 1.2); tree(360, 150, 1); person(sv, 180, 160, 1.2); }
    if (s === 1) { hut(120, 150); hut(270, 150); tree(360, 150, 1.1); person(sv, 170, 162, 1.1); person(sv, 190, 162, .8, 'gbx-cloth2'); person(sv, 310, 162, 1.1, 'gbx-cloth3'); }
    if (s === 2) { tree(200, 150, 2); [110, 150, 250, 290].forEach(function (x, i) { person(sv, x, 168, 1, ['gbx-cloth', 'gbx-cloth2', 'gbx-cloth3', 'gbx-cloth'][i]); }); person(sv, 200, 175, 1.25, 'gbx-cloth2'); Tx(sv, 200, 84, '♪', 'lg acc'); S('path', { d: 'M150,118 L190,124 M250,118 L210,124', 'class': 'gbx-lead' }, sv); }
    if (s === 3) { for (var r = 0; r < 4; r++) S('line', { x1: 40, y1: 158 + r * 9, x2: 210, y2: 158 + r * 9, 'class': 'gbx-line' }, sv); person(sv, 120, 168, 1); S('rect', { x: 270, y: 120, width: 34, height: 30, 'class': 'gbx-mutf' }, sv); Tx(sv, 287, 112, 'forge', 'xs mut'); person(sv, 320, 168, 1, 'gbx-cloth3'); }
    if (s >= 4) { for (var f = 0; f < 9; f++) S('rect', { x: 30 + f * 22, y: 128, width: 4, height: 30, 'class': 'gbx-wood' }, sv); S('line', { x1: 30, y1: 136, x2: 210, y2: 136, 'class': 'gbx-ink' }, sv); S('line', { x1: 30, y1: 148, x2: 210, y2: 148, 'class': 'gbx-ink' }, sv); hut(110, 126); person(sv, 240, 168, 1.15, 'gbx-cloth2'); Tx(sv, 240, 108, '\"This is mine.\"', 'sm b acc'); person(sv, 320, 168, .95); person(sv, 350, 168, .95, 'gbx-cloth3'); }
    if (s === 5) { S('rect', { x: 250, y: 20, width: 140, height: 60, rx: 8, 'class': 'gbx-box-gold' }, sv); Tx(sv, 320, 42, 'LAWS', 'b'); Tx(sv, 320, 60, '\"for the good of all\"', 'xs mut'); }
    Tx(sv, 14, 24, (s + 1) + '. ' + ST[s][0], 'b', 'start');
    ro.set('<b>' + (s + 1) + '. ' + ST[s][0] + '.</b> ' + ST[s][1]);
  }
  V.seg(F.ctl, { label: 'Stage', items: ST.map(function (x, i) { return [i, (i + 1) + '. ' + x[0]]; }), value: s, change: function (v) { s = +v; draw(); } });
  draw();
});
