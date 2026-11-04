/* gb18.diderot-rameaus-nephew: visuals (gbw3, our own designs). */
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
/* gb-me-him: sort claims from Rameau's Nephew (our own summaries) to Me, the philosopher, or Him, the nephew. */
ML.viz.register('gb-me-him', function (el, opts, V) {
  var F = frame(el, 400, 200, 'Me and Him at a café table by the chess players'), sv = F.svg, ro = V.readout(el);
  var CL = [
    ['Virtue and happiness go together in the end.', 'me'],
    ['In a world of flatterers, a poor man is a fool not to flatter too.', 'him'],
    ['Everyone takes a \"position,\" bowing and posing like a dancer, to please someone above him.', 'him'],
    ['A good education should teach a child to be honest and useful, not only clever.', 'me'],
    ['I would rather be a cheerful rascal with a full stomach than an honest man who is hungry.', 'him'],
    ['There are pleasures of the mind, of friendship and of doing good that last longer than a dinner.', 'me'],
    ['My uncle the composer is a genius, and I envy him for it.', 'him'],
    ['Even the king takes a position, before his mistress and before God: whoever needs another must pose.', 'me']
  ];
  var i = Math.max(0, Math.min(CL.length - 1, opts.i || 0)), ans = null, score = 0, seen = 0;
  function draw() {
    clear(sv);
    S('rect', { x: 150, y: 120, width: 100, height: 10, rx: 3, 'class': 'gbx-wood' }, sv); S('rect', { x: 195, y: 130, width: 10, height: 50, 'class': 'gbx-wood' }, sv);
    for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) S('rect', { x: 182 + c * 9, y: 112 + r * 4, width: 9, height: 4, 'class': (r + c) % 2 ? 'gbx-mutf' : 'gbx-paper' }, sv);
    person(sv, 110, 180, 1.5, 'gbx-cloth2'); person(sv, 290, 180, 1.5, 'gbx-cloth3');
    Tx(sv, 110, 196, 'Me (Moi)', 'sm b'); Tx(sv, 290, 196, 'Him (Lui)', 'sm b');
    if (ans) { var x = CL[i][1] === 'me' ? 110 : 290; S('path', { d: 'M' + (x - 70) + ',14 h140 v50 h-60 l-10,12 l-10,-12 h-60 z', 'class': ans === CL[i][1] ? 'gbx-box-on' : 'gbx-box-red' }, sv); Tw(sv, x, 32, CL[i][1] === 'me' ? 'That was me.' : 'That was me!', 22, 14, 'sm b'); }
    else Tx(sv, 200, 40, 'Who says it?', 'b acc');
    ro.set('<b>Claim ' + (i + 1) + ' of ' + CL.length + ':</b> \"' + CL[i][0] + '\"' + (ans ? (ans === CL[i][1] ? ' <b>Right:</b> ' : ' <b>Not quite:</b> ') + (CL[i][1] === 'me' ? 'Me, the philosopher, says this.' : 'Him, the nephew, says this.') + ' Score: ' + score + ' of ' + seen + '.' : ''));
  }
  function pick(w) { if (ans) return; ans = w; seen++; if (w === CL[i][1]) score++; draw(); }
  var row = document.createElement('div'); row.className = 'gbx-row'; F.ctl.appendChild(row);
  V.button(row, 'Me said it', function () { pick('me'); }); V.button(row, 'Him said it', function () { pick('him'); });
  V.button(row, 'Next claim ▶', function () { i = (i + 1) % CL.length; ans = null; draw(); });
  draw();
});
