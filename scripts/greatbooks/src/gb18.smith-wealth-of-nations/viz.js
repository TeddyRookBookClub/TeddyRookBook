/* gb18.smith-wealth-of-nations: visuals (gbw3, our own designs). */
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
/* gb-pin-factory: Smith's pin manufactory (Wealth of Nations I.1): about eighteen operations shared among workers. Smith's own figures are for one worker alone and for ten. */
ML.viz.register('gb-pin-factory', function (el, opts, V) {
  var F = frame(el, 400, 230, 'The eighteen operations of pin-making shared among workers'), sv = F.svg, ro = V.readout(el);
  var OPS = ['draw wire', 'straighten', 'cut', 'point', 'grind top', 'head 1', 'head 2', 'head 3', 'head on', 'whiten', 'step 11', 'step 12', 'step 13', 'step 14', 'step 15', 'step 16', 'step 17', 'into paper']; /* Smith names about ten of the eighteen */
  var w = Math.max(1, Math.min(18, opts.workers || 10));
  var COLS = ['gbx-box-gold', 'gbx-box-blue', 'gbx-box-on', 'gbx-box-red'];
  function draw() {
    clear(sv);
    OPS.forEach(function (op, i) { var c = i % 6, r = Math.floor(i / 6), x = 10 + c * 64, y = 10 + r * 46, who = Math.floor(i * w / 18);
      S('rect', { x: x, y: y, width: 60, height: 40, rx: 7, 'class': COLS[who % 4] }, sv); Tx(sv, x + 30, y + 17, op, 'xs'); Tx(sv, x + 30, y + 32, 'worker ' + (who + 1), 'xs mut'); });
    var y = 160;
    S('rect', { x: 10, y: y, width: 380, height: 60, rx: 9, 'class': 'gbx-box' }, sv);
    if (w === 1) { Tx(sv, 200, y + 24, 'One worker does all 18 operations', 'sm b'); Tx(sv, 200, y + 44, 'Smith: hardly one pin a day, and certainly not twenty', 'xs'); }
    else if (w === 10) { Tx(sv, 200, y + 24, 'Ten workers share the work: about 48,000 pins a day', 'sm b'); Tx(sv, 200, y + 44, '48,000 ÷ 10 = 4,800 pins per worker', 'xs'); }
    else { Tx(sv, 200, y + 24, w + ' workers: about ' + V.fmt(18 / w, 1) + ' operations each', 'sm b'); Tx(sv, 200, y + 44, 'Smith gives figures only for one worker alone and for ten', 'xs mut'); }
    ro.set(w === 1 ? 'Working alone and untrained, Smith says, a man could hardly make <b>one pin</b> a day, and certainly not twenty.' : w === 10 ? 'In the small factory Smith saw, <b>ten</b> workers, some doing two or three operations, made about twelve pounds of pins a day, over 48,000 pins: <b>4,800</b> each, at least 240 times what one could make alone.' : 'With ' + w + ' workers each does about ' + V.fmt(18 / w, 1) + ' of the 18 operations (Smith names about ten of them; the rest are numbered here). Smith\'s three reasons this helps: more skill at one task, no time lost switching tasks, and new machines invented by people focused on one job.');
  }
  V.slider(F.ctl, { label: 'Workers', min: 1, max: 18, step: 1, value: w, input: function (v) { w = v; draw(); } });
  draw();
});
