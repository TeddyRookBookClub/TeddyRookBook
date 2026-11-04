/* gb18.hume-enquiry: visuals (gbw3, our own designs). */
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
/* gb-billiards: Hume's billiard balls (Enquiry IV–VII): we see motion, contact and motion, never the power; custom grows with each trial. */
ML.viz.register('gb-billiards', function (el, opts, V) {
  var F = frame(el, 400, 190, 'Two billiard balls on a table'), sv = F.svg, ro = V.readout(el);
  var n = opts.trials || 0, mode = 'b', t = 1, anim = null;
  var OUT = { b: ['the second ball rolls away', 'what we always see'], rest: ['both balls stay still', 'conceivable, says Hume'], back: ['the first ball bounces straight back', 'conceivable too'], up: ['the second ball leaps off sideways', 'also no contradiction'] };
  function pos(t) {
    var ax = 60 + Math.min(t, .5) / .5 * 140, bx = 222, by = 110, ay = 110;
    if (t > .5) { var u = (t - .5) / .5;
      if (mode === 'b') { bx = 222 + u * 140; }
      else if (mode === 'back') { ax = 200 - u * 120; }
      else if (mode === 'up') { bx = 222 + u * 90; by = 110 - u * 70; }
    }
    return [ax, ay, bx, by];
  }
  function draw() {
    clear(sv);
    S('rect', { x: 10, y: 40, width: 380, height: 140, rx: 14, 'class': 'gbx-box-on' }, sv);
    var p = pos(t);
    S('circle', { cx: p[0], cy: p[1], r: 11, 'class': 'gbx-paper' }, sv); S('circle', { cx: p[0], cy: p[1], r: 11, 'class': 'gbx-ink' }, sv);
    S('circle', { cx: p[2], cy: p[3], r: 11, 'class': 'gbx-redf' }, sv);
    Tx(sv, 200, 24, 'Trials seen: ' + n + (mode !== 'b' ? '  ·  imagining: ' + OUT[mode][0] : ''), 'sm b');
    var seen = n === 0 ? 'Strike the ball to see what happens.' : n < 3 ? 'You saw the first ball move, touch, and the second ball move. Look as hard as you like: you never see a <b>power</b> or <b>necessary connection</b>, only one event after another.' : 'After ' + n + ' trials you <b>expect</b> the second ball to move before it does. Nothing new appeared in the balls; what changed is in you: <b>custom</b>. That felt expectation, Hume says, is where our idea of necessary connection comes from.';
    ro.set(mode === 'b' ? seen : 'Imagining that <b>' + OUT[mode][0] + '</b>: ' + OUT[mode][1] + '. Reason alone, before experience, finds no contradiction in it. Only experience tells us which one happens.');
  }
  function strike() {
    if (anim) anim.stop();
    if (V.reduced) { t = 1; if (mode === 'b') n++; draw(); return; }
    t = 0; var go = V.loop(el, function (dt) { t = Math.min(1, t + dt / 1.4); draw(); if (t >= 1) { go.stop(); anim = null; if (mode === 'b') { n++; draw(); } } });
    anim = go; go.start();
  }
  var row = document.createElement('div'); row.className = 'gbx-row'; F.ctl.appendChild(row);
  V.button(row, 'Strike the ball', strike);
  V.seg(F.ctl, { label: 'Imagine instead', items: [['b', 'What usually happens'], ['rest', 'Both stay still'], ['back', 'First bounces back'], ['up', 'Second leaps sideways']], value: 'b', change: function (v) { mode = v; t = 0; draw(); strike(); } });
  t = n ? 1 : 0; draw();
});
