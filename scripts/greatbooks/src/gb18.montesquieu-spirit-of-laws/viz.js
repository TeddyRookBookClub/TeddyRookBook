/* gb18.montesquieu-spirit-of-laws: visuals (gbw3, our own designs). */
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
/* gb-three-powers: Montesquieu's three powers (Spirit of Laws XI.6), separate or joined in one hand. */
ML.viz.register('gb-three-powers', function (el, opts, V) {
  var F = frame(el, 400, 230, 'The legislative, executive and judging powers'), sv = F.svg, ro = V.readout(el);
  var PW = [['L', 'Legislative', 'makes the laws'], ['E', 'Executive', 'carries them out'], ['J', 'Judging', 'tries cases']];
  var OPT = [
    [[], 'All three separate', 'Each power is in different hands, and power checks power. This, for Montesquieu, is the condition of political liberty: no citizen need fear another.'],
    [['L', 'E'], 'Legislative + executive joined', '\"There can be no liberty,\" because the same monarch or senate might make tyrannical laws and carry them out tyrannically.'],
    [['L', 'J'], 'Legislative + judging joined', '"The life and liberty of the subject would be exposed to arbitrary control; for the judge would be then the legislator."'],
    [['E', 'J'], 'Executive + judging joined', '"The judge might behave with violence and oppression."'],
    [['L', 'E', 'J'], 'All three in one hand', '\"There would be an end of everything\": the same person or body makes the laws, carries them out and judges. This is Montesquieu\'s picture of despotism.']
  ];
  var o = Math.max(0, Math.min(4, opts.joined || 0));
  var POS = { L: [80, 120], E: [200, 120], J: [320, 120] };
  function draw() {
    clear(sv); var j = OPT[o][0];
    if (j.length) {
      var xs = j.map(function (k) { return POS[k][0]; }), x0 = Math.min.apply(null, xs) - 56, x1 = Math.max.apply(null, xs) + 56;
      S('rect', { x: x0, y: 64, width: x1 - x0, height: 112, rx: 50, 'class': 'gbx-box-red' }, sv);
      person(sv, (x0 + x1) / 2, 60, .9, 'gbx-cloth3'); Tx(sv, (x0 + x1) / 2, 198, 'one hand', 'sm b red');
    }
    PW.forEach(function (p) { var c = POS[p[0]], jo = j.indexOf(p[0]) >= 0;
      S('circle', { cx: c[0], cy: c[1], r: 44, 'class': jo ? 'gbx-box-red' : 'gbx-box-on' }, sv);
      Tx(sv, c[0], c[1] - 4, p[1], 'sm b'); Tx(sv, c[0], c[1] + 12, p[2], 'xs mut');
    });
    if (!j.length) { [['L', 'E'], ['E', 'J']].forEach(function (pr) { var a = POS[pr[0]], b = POS[pr[1]]; S('path', { d: 'M' + (a[0] + 46) + ',' + (a[1] - 6) + ' L' + (b[0] - 46) + ',' + (b[1] - 6) + ' M' + (b[0] - 46) + ',' + (b[1] + 6) + ' L' + (a[0] + 46) + ',' + (a[1] + 6), 'class': 'gbx-arrow' }, sv); }); S('path', { d: 'M80,166 Q200,226 320,166', 'class': 'gbx-arrow' }, sv); Tx(sv, 200, 216, 'each checks the others', 'sm g b'); }
    ro.set('<b>' + OPT[o][1] + '.</b> ' + OPT[o][2]);
  }
  V.seg(F.ctl, { label: 'Who holds the powers?', items: OPT.map(function (x, i) { return [i, x[1]]; }), value: o, change: function (v) { o = +v; draw(); } });
  draw();
});
