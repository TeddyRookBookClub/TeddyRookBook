/* gb18.berkeley-principles: visuals (gbw3, our own designs). */
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
/* gb-water-hands: Berkeley's (and Locke's) bowl of water felt warm by one hand and cold by the other (Three Dialogues I; Principles §14). */
ML.viz.register('gb-water-hands', function (el, opts, V) {
  var F = frame(el, 400, 230, 'Two hands, one bowl of water'), sv = F.svg, ro = V.readout(el);
  var L = opts.left == null ? 40 : opts.left, R = opts.right == null ? 10 : opts.right, Wt = opts.water == null ? 25 : opts.water;
  function feel(h) { var d = Wt - h; return d > 4 ? ['warm', 'gbx-box-red'] : d < -4 ? ['cold', 'gbx-box-blue'] : ['neither warm nor cold', 'gbx-box']; }
  function hand(x, flip) {
    var g = S('g', { transform: 'translate(' + x + ',58)' + (flip ? ' scale(-1,1)' : '') }, sv);
    S('rect', { x: -12, y: 0, width: 24, height: 70, rx: 9, 'class': 'gbx-cloth2' }, g);
    S('rect', { x: -15, y: 66, width: 30, height: 34, rx: 10, 'class': 'gbx-skin' }, g);
    [-10, -3.5, 3, 9.5].forEach(function (fx) { S('rect', { x: fx - 2.8, y: 92, width: 5.6, height: 22, rx: 2.8, 'class': 'gbx-skin' }, g); });
    S('rect', { x: 13, y: 74, width: 6, height: 15, rx: 3, 'class': 'gbx-skin' }, g);
  }
  function draw() {
    clear(sv);
    S('path', { d: 'M90,140 L310,140 Q300,214 200,214 Q100,214 90,140 Z', 'class': 'gbx-box' }, sv);
    S('path', { d: 'M96,152 L304,152 Q294,208 200,208 Q106,208 96,152 Z', 'class': 'gbx-sea' }, sv);
    hand(150, false); hand(250, true);
    var fl = feel(L), fr = feel(R);
    S('rect', { x: 8, y: 14, width: 118, height: 40, rx: 8, 'class': fl[1] }, sv); Tx(sv, 67, 30, 'left hand was ' + L + '°C', 'xs mut'); Tx(sv, 67, 46, 'feels ' + fl[0], 'sm b');
    S('rect', { x: 274, y: 14, width: 118, height: 40, rx: 8, 'class': fr[1] }, sv); Tx(sv, 333, 30, 'right hand was ' + R + '°C', 'xs mut'); Tx(sv, 333, 46, 'feels ' + fr[0], 'sm b');
    Tx(sv, 200, 196, 'water ' + Wt + '°C', 'sm b');
    var same = fl[0] === fr[0];
    ro.set(same ? 'Both hands feel the water the same way: ' + fl[0] + '. Now make one hand warmer and the other colder than the water.' : 'One bowl of water at ' + Wt + '°C feels <b>' + fl[0] + '</b> to the left hand and <b>' + fr[0] + '</b> to the right. The water can\'t be both at once, so, Berkeley argues, the warmth and cold are in the feeling, in the mind, not in the water. He then asks why shape and size should be any different.');
  }
  V.slider(F.ctl, { label: 'Left hand', min: 5, max: 45, step: 1, value: L, fmt: function (v) { return v + '°C'; }, input: function (v) { L = v; draw(); } });
  V.slider(F.ctl, { label: 'Right hand', min: 5, max: 45, step: 1, value: R, fmt: function (v) { return v + '°C'; }, input: function (v) { R = v; draw(); } });
  V.slider(F.ctl, { label: 'Water', min: 10, max: 40, step: 1, value: Wt, fmt: function (v) { return v + '°C'; }, input: function (v) { Wt = v; draw(); } });
  draw();
});
