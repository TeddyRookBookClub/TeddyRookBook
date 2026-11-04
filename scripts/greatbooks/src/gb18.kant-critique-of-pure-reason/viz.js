/* gb18.kant-critique-of-pure-reason: visuals (gbw3, our own designs). */
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
/* gb-kant-lenses: Kant's picture of experience: sensations given form by space and time and joined by the categories into objects connected by cause. */
ML.viz.register('gb-kant-lenses', function (el, opts, V) {
  var F = frame(el, 400, 240, 'Sensation, space, time and the categories'), sv = F.svg, ro = V.readout(el);
  var lay = opts.layer == null ? 0 : opts.layer, on = { sp: lay >= 1, tm: lay >= 2, ct: lay >= 3 };
  var DOTS = [[52, 70, 'r'], [300, 160, 'b'], [130, 190, 'r'], [340, 60, 'g'], [210, 110, 'b'], [90, 140, 'g'], [260, 200, 'r'], [170, 60, 'b'], [360, 130, 'g'], [40, 200, 'b'], [230, 170, 'g'], [120, 100, 'r']];
  var CL = { r: 'gbx-redf', b: 'gbx-bluef', g: 'gbx-gold' };
  function scene(g, x, y, s, k) { /* ball rolling toward a block; k = 0, 1, 2 frames */
    S('line', { x1: x, y1: y + 22 * s, x2: x + 100 * s, y2: y + 22 * s, 'class': 'gbx-ink' }, g);
    var bx = x + [12, 44, 62][k] * s, kx = x + [74, 74, 88][k] * s;
    S('circle', { cx: bx, cy: y + 13 * s, r: 9 * s, 'class': 'gbx-redf' }, g);
    S('rect', { x: kx, y: y - 4 * s, width: 18 * s, height: 26 * s, 'class': 'gbx-bluef' }, g);
  }
  function draw() {
    clear(sv);
    S('rect', { x: 10, y: 20, width: 380, height: 205, rx: 12, 'class': 'gbx-box' }, sv);
    if (!on.sp && !on.tm) {
      DOTS.forEach(function (d) { S('circle', { cx: d[0], cy: d[1], r: 7, 'class': CL[d[2]], opacity: .8 }, sv); });
      Tx(sv, 200, 42, on.ct ? 'concepts with nothing given to them' : 'a manifold of sensations: no where, no when', 'sm mut');
    } else if (on.sp && !on.tm) {
      scene(sv, 110, 110, 1.8, 1); Tx(sv, 200, 42, 'placed in space: here, there, beside, apart', 'sm mut');
    } else if (!on.sp && on.tm) {
      [0, 1, 2].forEach(function (k) { [0, 1, 2, 3].forEach(function (j) { var d = DOTS[(k * 4 + j) % DOTS.length]; S('circle', { cx: 60 + k * 120 + j * 14, cy: 120 + (j % 2) * 16, r: 6, 'class': CL[d[2]], opacity: .8 }, sv); }); Tx(sv, 80 + k * 120, 170, ['first', 'then', 'then'][k], 'sm b'); });
      Tx(sv, 200, 42, 'one after another in time, but nowhere', 'sm mut');
    } else {
      [0, 1, 2].forEach(function (k) { scene(sv, 22 + k * 126, 110, 1, k); Tx(sv, 72 + k * 126, 160, ['t₁', 't₂', 't₃'][k], 'sm b'); });
      Tx(sv, 200, 42, 'in space and in time', 'sm mut');
    }
    if (on.ct && on.sp && on.tm) {
      Tx(sv, 72, 92, 'one ball (unity)', 'xs acc'); Tx(sv, 226, 92, 'the same things go on (substance)', 'xs acc');
      S('path', { d: 'M80,170 Q200,195 322,170', 'class': 'gbx-route' }, sv); Tx(sv, 200, 212, 'the ball pushes the block: cause → effect', 'xs acc');
    } else if (on.ct) Tx(sv, 200, 205, 'categories ready: unity, substance, cause…', 'xs acc');
    var msg = !on.sp && !on.tm ? (on.ct ? 'Categories with no intuition: thoughts without content are <b>empty</b>.' : 'Only raw sensation: a scatter of colors and feelings. Without forms and concepts, intuitions are <b>blind</b>.')
      : on.ct && on.sp && on.tm ? 'Experience: <b>objects</b> in space and time, connected by <b>cause and effect</b>. Because the mind supplies these forms and concepts, Kant says, we can know a priori that every event we experience will have a cause.'
      : 'Forms of intuition without the categories: things appear ' + (on.sp && on.tm ? 'in space and time' : on.sp ? 'in space' : 'in time') + ', but nothing yet joins them into lasting objects connected by cause.';
    ro.set(msg);
    Array.prototype.forEach.call(chips.children, function (b) { b.setAttribute('aria-pressed', on[b.dataset.k] ? 'true' : 'false'); });
  }
  var chips = document.createElement('div'); chips.className = 'gbx-chips'; F.ctl.appendChild(chips);
  [['sp', 'Space'], ['tm', 'Time'], ['ct', 'Categories']].forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'gbx-chip'; b.dataset.k = c[0]; b.textContent = c[1]; b.addEventListener('click', function () { on[c[0]] = !on[c[0]]; draw(); }); chips.appendChild(b); });
  draw();
});
