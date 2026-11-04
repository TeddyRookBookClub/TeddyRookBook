/* gb-institutes: the plan of Calvin's Institutes (final Latin edition, 1559): four books, 80 chapters, following the order of the
   Apostles' Creed. Our own summaries of Calvin's teaching, as his views. */
/* gbw1 SVG helpers (each viz.js carries its own copy, since each is wrapped on its own). Styles: .gbr-* in this course's viz.css. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || 'gbr-t', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbr'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbr-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl, stage: st };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* a clickable group: Enter/Space activate it too */
function hit(g, label, fn) {
  g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbr-hit');
  g.addEventListener('click', fn);
  g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
/* a generic cartoon person, in the site's skin color */
function person(g, x, y, s, cloth) {
  S('rect', { x: x - 7 * s, y: y - 2 * s, width: 14 * s, height: 18 * s, rx: 6 * s, 'class': cloth || 'gbr-cloth' }, g);
  S('circle', { cx: x, cy: y - 9 * s, r: 7 * s, 'class': 'gbr-skin' }, g);
}
/* wrap text into lines of at most n characters */
function wrap(s, n) { var w = s.split(' '), out = [], cur = ''; w.forEach(function (x) { if ((cur + ' ' + x).trim().length > n) { if (cur) out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); if (cur) out.push(cur); return out; }
ML.viz.register('gb-institutes', function (el, opts, V) {
  var B = [
    ['Book I', 'The knowledge of God the Creator', 18, 'I believe in God the Father', 'How we know God, through the created world and, more clearly, through Scripture; God as Creator; and God\'s providence, his care and rule over all things.'],
    ['Book II', 'The knowledge of God the Redeemer', 17, 'and in Jesus Christ', 'Humanity\'s fall and its effects, the law, and Christ as the one who restores the relationship between God and people.'],
    ['Book III', 'How we receive the grace of Christ', 25, 'I believe in the Holy Spirit', 'Faith, repentance, the Christian life, prayer, and justification by faith. It also treats election (predestination), the teaching most debated by Calvin\'s critics.'],
    ['Book IV', 'The outward means: the church', 20, 'the holy catholic church', 'The church and its ministry, the sacraments (for Calvin, baptism and the Lord\'s Supper), and, in the last chapter, civil government.']
  ];
  var F = frame(el, 400, 250, 'The four books of the Institutes and their chapters'), sv = F.svg, ro = V.readout(el), cur = opts.book == null ? -1 : opts.book;
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 250, 'class': 'gbr-bg' }, sv);
    var y = 30;
    B.forEach(function (b, i) {
      var g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv), w = b[2] * 11;
      S('rect', { x: 120, y: y, width: w, height: 40, rx: 6, 'class': 'gbr-f' + i + ' gbr-sec' }, g);
      for (var c = 0; c <= b[2]; c++) S('line', { x1: 120 + c * 11, y1: y + 41, x2: 120 + c * 11, y2: y + 46, 'class': 'gbr-ln' }, g);
      Tx(g, 112, y + 17, b[0], 'gbr-b', 'end'); Tx(g, 112, y + 31, b[2] + ' chapters', 'gbr-m', 'end');
      Tx(g, 126, y + 18, b[1], 'gbr-b', 'start'); Tx(g, 126, y + 32, '"' + b[3] + ' ..."', 'gbr-i', 'start');
      hit(g, b[0] + ': ' + b[1], function () { cur = i; draw(); });
      y += 52;
    });
    Tx(sv, 200, 18, 'Each space between ticks is one chapter: 18 + 17 + 25 + 20 = 80', 'gbr-m');
    ro.set(cur < 0 ? 'Calvin arranged the 1559 Institutes in four books that follow the Apostles\' Creed: the Father, the Son, the Holy Spirit and the church. Tap a book.' : '<b>' + B[cur][0] + ': ' + B[cur][1] + '</b> (' + B[cur][2] + ' chapters). ' + B[cur][4]);
  }
  draw();
});
