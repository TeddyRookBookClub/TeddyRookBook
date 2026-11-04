/* gb18.boswell-life-of-johnson: visuals (gbw3, our own designs). */
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
/* gb-two-lives: Samuel Johnson (1709–1784) and James Boswell (1740–1795), in parallel. */
ML.viz.register('gb-two-lives', function (el, opts, V) {
  timeline(el, V, [
    { y: 1709, lane: 0, when: '1709', lab: 'Johnson born in Lichfield', txt: 'The son of a poor bookseller.' },
    { y: 1737, lane: 0, when: '1737', lab: 'Johnson comes to London', txt: 'With his pupil David Garrick, later a famous actor; he lives by writing.' },
    { y: 1740, lane: 1, when: '1740', lab: 'Boswell born in Edinburgh', txt: 'The son of a Scottish judge.' },
    { y: 1755, lane: 0, when: '1755', lab: 'The Dictionary', txt: 'Johnson\'s Dictionary of the English Language, about nine years\' work.' },
    { y: 1759, lane: 0, when: '1759', lab: 'Rasselas', txt: 'A moral tale about the search for happiness, written quickly, it was said, to pay for his mother\'s funeral.' },
    { y: 1763, lane: 1, when: 'May 16, 1763', lab: 'They meet', txt: 'In Thomas Davies\'s bookshop: \"I do indeed come from Scotland, but I cannot help it.\"' },
    { y: 1764, lane: 0, when: '1764', lab: 'The Club', txt: 'Johnson and Joshua Reynolds found a dining club; members came to include Burke, Goldsmith, Garrick, Boswell, Gibbon and Adam Smith.' },
    { y: 1773, lane: 1, when: '1773', lab: 'Tour to the Hebrides', txt: 'Boswell and Johnson travel through the Scottish Highlands and islands.' },
    { y: 1781, lane: 0, when: '1779–1781', lab: 'Lives of the Poets', txt: 'Johnson\'s critical biographies of English poets.' },
    { y: 1784, lane: 0, when: 'December 13, 1784', lab: 'Johnson dies', txt: 'He is buried in Westminster Abbey.' },
    { y: 1785, lane: 1, when: '1785', lab: 'Journal of a Tour to the Hebrides', txt: 'Boswell\'s first book about Johnson.' },
    { y: 1791, lane: 1, when: '1791', lab: 'The Life of Samuel Johnson', txt: 'Boswell\'s great biography appears in two volumes.' },
    { y: 1795, lane: 1, when: '1795', lab: 'Boswell dies', txt: 'He was working on a third edition of the Life.' }
  ], { y0: 1700, y1: 1800, ticks: [1710, 1740, 1770, 1800], lanes: [{ name: 'Johnson', from: 1709, to: 1784 }, { name: 'Boswell', from: 1740, to: 1795 }], sel: opts.sel || 0, label: 'The lives of Johnson and Boswell side by side' });
});
