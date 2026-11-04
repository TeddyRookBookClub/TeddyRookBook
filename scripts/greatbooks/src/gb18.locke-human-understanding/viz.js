/* gb18.locke-human-understanding: visuals (gbw3, our own designs). */
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
/* gb-idea-builder: Locke's simple ideas (from sensation or reflection) joined into a complex idea (Essay II.ii, II.xii, II.xxiii). */
ML.viz.register('gb-idea-builder', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Simple ideas joined by the mind into a complex idea'), sv = F.svg, ro = V.readout(el);
  var T = {
    apple: { name: 'an apple', ids: [['red', 'S', 'secondary'], ['round', 'S', 'primary'], ['sweet', 'S', 'secondary'], ['solid', 'S', 'primary'], ['fresh smell', 'S', 'secondary'], ['crunch when bitten', 'S', 'secondary']] },
    gold: { name: 'gold (Locke\'s own example)', ids: [['yellow', 'S', 'secondary'], ['heavy', 'S', 'primary'], ['hammers thin', 'S', 'power'], ['melts in fire', 'S', 'power'], ['shining', 'S', 'secondary'], ['solid', 'S', 'primary']] },
    memory: { name: 'remembering a favorite song', ids: [['a tune heard', 'S', 'secondary'], ['a voice', 'S', 'secondary'], ['remembering', 'R', ''], ['enjoying', 'R', ''], ['wanting to hear it again', 'R', ''], ['thinking about it', 'R', '']] }
  };
  var key = T[opts.pick] ? opts.pick : 'apple', on = [];
  function reset() { on = T[key].ids.map(function () { return true; }); on[0] = false; on[3] = false; }
  reset();
  var chips = document.createElement('div'); chips.className = 'gbx-chips';
  function draw() {
    clear(sv); var t = T[key], n = on.filter(Boolean).length;
    S('circle', { cx: 200, cy: 125, r: 52, 'class': n === t.ids.length ? 'gbx-box-on' : 'gbx-box' }, sv);
    Tx(sv, 200, 118, 'complex idea', 'xs mut'); Tw(sv, 200, 134, t.name, 16, 13, 'sm b');
    t.ids.forEach(function (d, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / t.ids.length, x = 200 + Math.cos(a) * 128, y = 125 + Math.sin(a) * 92;
      if (on[i]) S('line', { x1: 200 + Math.cos(a) * 54, y1: 125 + Math.sin(a) * 54, x2: x - Math.cos(a) * 18, y2: y - Math.sin(a) * 14, 'class': 'gbx-arrow' }, sv);
      S('rect', { x: x - 54, y: y - 13, width: 108, height: 26, rx: 13, 'class': on[i] ? (d[1] === 'R' ? 'gbx-box-blue' : 'gbx-box-gold') : 'gbx-box' }, sv);
      Tx(sv, x, y + 4, d[0], on[i] ? 'sm b' : 'sm mut');
    });
    Tx(sv, 8, 244, 'gold = from sensation · blue = from reflection', 'xs mut', 'start');
    var s = t.ids.filter(function (d, i) { return on[i] && d[1] === 'S'; }).length, r = t.ids.filter(function (d, i) { return on[i] && d[1] === 'R'; }).length;
    ro.set('The mind has joined <b>' + n + '</b> of ' + t.ids.length + ' simple ideas: ' + s + ' from <b>sensation</b>, ' + r + ' from <b>reflection</b>. ' + (n === t.ids.length ? 'The complex idea of ' + t.name + ' is complete. ' : 'Switch on the rest to complete the complex idea. ') + (key === 'memory' ? 'Reflection is the mind noticing its own operations: remembering, enjoying, willing, thinking.' : 'Locke would add that shape, size and solidity are <b>primary</b> qualities, really in the thing, while colors, tastes and smells are <b>secondary</b>: powers to cause ideas in us.'));
    Array.prototype.forEach.call(chips.children, function (b, i) { b.setAttribute('aria-pressed', on[i] ? 'true' : 'false'); });
  }
  function mk() {
    chips.innerHTML = '';
    T[key].ids.forEach(function (d, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'gbx-chip'; b.textContent = d[0]; b.addEventListener('click', function () { on[i] = !on[i]; draw(); }); chips.appendChild(b); });
  }
  V.seg(F.ctl, { label: 'Thing', items: [['apple', 'An apple'], ['gold', 'Gold'], ['memory', 'A song remembered']], value: key, change: function (v) { key = v; reset(); mk(); draw(); } });
  F.ctl.appendChild(chips); mk(); draw();
});
