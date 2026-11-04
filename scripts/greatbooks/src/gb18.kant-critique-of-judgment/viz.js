/* gb18.kant-critique-of-judgment: visuals (gbw3, our own designs). */
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
/* gb-beauty-sublime: Kant's kinds of liking (Critique of Judgement §§1–29): the pleasant, the beautiful, the good, and the sublime. */
ML.viz.register('gb-beauty-sublime', function (el, opts, V) {
  var F = frame(el, 400, 240, 'Pleasant, beautiful, good or sublime?'), sv = F.svg, ro = V.readout(el);
  var SC = [
    ['A favorite food', 'pleasant', 'It pleases the senses, and it\'s fine if others disagree: \"to each his own taste.\" Kant calls this the <b>agreeable</b>.'],
    ['A rose', 'beautiful', 'We call it <b>beautiful</b> without any concept of what it\'s for, and we speak as if everyone ought to agree. It seems designed, yet for no purpose we can name.'],
    ['A bird\'s song', 'beautiful', 'Free, unplanned beauty in nature, Kant\'s favorite kind. No rule proves it beautiful, yet we expect agreement.'],
    ['The starry sky', 'sublime (mathematical)', 'So vast that imagination can\'t take it in at once: the <b>mathematically sublime</b>. We feel small, and yet reason can think of the infinite.'],
    ['A storm at sea, seen from safe shore', 'sublime (dynamical)', 'Overwhelming power, enjoyed only because we are safe: the <b>dynamically sublime</b>. It shows, Kant says, a strength in us that nature can\'t master: our moral freedom.'],
    ['A good hammer', 'good', 'We like it for what it\'s for: a concept of its purpose. That is liking the <b>good</b> (here, the useful), not beauty.']
  ];
  var s = Math.max(0, Math.min(SC.length - 1, opts.scene || 0));
  var ZONES = [['pleasant', 'just for me'], ['beautiful', 'all ought to agree'], ['sublime', 'vast or mighty'], ['good', 'by a concept']];
  function icon(k) {
    var g = S('g', { transform: 'translate(200,92)' }, sv);
    if (k === 0) { S('path', { d: 'M-40,0 Q0,46 40,0 Z', 'class': 'gbx-gold' }, g); S('ellipse', { cx: 0, cy: 0, rx: 40, ry: 8, 'class': 'gbx-box' }, g); [-14, 0, 14].forEach(function (x) { S('path', { d: 'M' + x + ',-8 q6,-12 0,-24', 'class': 'gbx-arrow' }, g); }); }
    if (k === 1) { S('line', { x1: 0, y1: 0, x2: 0, y2: 50, 'class': 'gbx-ink' }, g); S('path', { d: 'M0,30 q14,-10 20,2 q-12,6 -20,-2', 'class': 'gbx-leaf' }, g); [0, 72, 144, 216, 288].forEach(function (a) { S('ellipse', { cx: 0, cy: -14, rx: 10, ry: 15, transform: 'rotate(' + a + ')', 'class': 'gbx-redf', opacity: .75 }, g); }); S('circle', { cx: 0, cy: 0, r: 7, 'class': 'gbx-redf' }, g); }
    if (k === 2) { S('path', { d: 'M-50,40 L50,40 M-20,40 L-20,10', 'class': 'gbx-ink' }, g); S('ellipse', { cx: -20, cy: 4, rx: 16, ry: 10, 'class': 'gbx-bluef' }, g); S('circle', { cx: -8, cy: -2, r: 6, 'class': 'gbx-bluef' }, g); S('path', { d: 'M-2,-2 l6,1 l-6,2 z', 'class': 'gbx-gold' }, g); [[14, -20], [30, -34], [44, -16]].forEach(function (p) { S('ellipse', { cx: p[0], cy: p[1], rx: 4, ry: 3, 'class': 'gbx-mutf' }, g); S('line', { x1: p[0] + 4, y1: p[1], x2: p[0] + 4, y2: p[1] - 12, 'class': 'gbx-ink' }, g); }); }
    if (k === 3) { S('rect', { x: -90, y: -40, width: 180, height: 80, rx: 8, 'class': 'gbx-night' }, g); for (var i = 0; i < 40; i++) S('circle', { cx: -84 + (i * 37) % 168, cy: -34 + (i * 53) % 70, r: i % 5 ? 1.2 : 2.2, fill: '#f4f1e6' }, g); }
    if (k === 4) { S('rect', { x: -90, y: -40, width: 180, height: 80, rx: 8, 'class': 'gbx-sea' }, g); S('path', { d: 'M-90,10 q15,-26 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 L90,40 L-90,40 Z', 'class': 'gbx-bluef', opacity: .8 }, g); S('ellipse', { cx: -20, cy: -26, rx: 50, ry: 12, 'class': 'gbx-mutf' }, g); S('path', { d: 'M10,-16 l-8,16 h8 l-8,16', 'class': 'gbx-arrow', stroke: '#e8590c' }, g); person(g, 70, 38, .6); }
    if (k === 5) { S('rect', { x: -6, y: -10, width: 12, height: 56, rx: 4, 'class': 'gbx-wood' }, g); S('rect', { x: -30, y: -26, width: 60, height: 18, rx: 4, 'class': 'gbx-mutf' }, g); }
  }
  function draw() {
    clear(sv); var c = SC[s], z = c[1].split(' ')[0];
    S('rect', { x: 10, y: 40, width: 380, height: 110, rx: 12, 'class': 'gbx-box' }, sv); Tx(sv, 200, 26, c[0], 'b');
    icon(s);
    ZONES.forEach(function (q, i) { var x = 14 + i * 95, on = q[0] === z; S('rect', { x: x, y: 168, width: 89, height: 52, rx: 10, 'class': on ? 'gbx-box-on' : 'gbx-box' }, sv); Tx(sv, x + 44.5, 190, q[0], on ? 'sm b g' : 'sm'); Tx(sv, x + 44.5, 207, q[1], 'xs mut'); });
    ro.set('<b>' + c[0] + ': ' + c[1] + '.</b> ' + c[2]);
  }
  V.seg(F.ctl, { label: 'Scene', items: SC.map(function (c, i) { return [i, c[0]]; }), value: s, change: function (v) { s = +v; draw(); } });
  draw();
});
