/* gb17.hobbes-leviathan: visuals (gbw2, our own design). */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbw-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbw-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl gbw-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function person(g, x, y, s, robe) { // a generic standing figure in the site's cartoon skin color
  s = s || 1;
  S('path', { d: 'M' + (x - 8 * s) + ',' + (y + 22 * s) + ' L' + (x - 6 * s) + ',' + (y + 2 * s) + ' Q' + x + ',' + (y - 2 * s) + ' ' + (x + 6 * s) + ',' + (y + 2 * s) + ' L' + (x + 8 * s) + ',' + (y + 22 * s) + ' Z', 'class': 'gbw-robe' + (robe ? ' ' + robe : '') }, g);
  S('circle', { cx: x, cy: y - 6 * s, r: 6 * s, 'class': 'gbw-skin' }, g);
}
function clickable(g, label, fn) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbw-click'); g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return g; }
/* gb-leviathan: the state of nature, the covenant and the commonwealth (Leviathan XIII-XVIII), drawn as generic figures. */
ML.viz.register('gb-leviathan', function (el, opts, V) {
  var F = frame(el, 400, 230, 'Hobbes: from the state of nature to the commonwealth'), sv = F.svg, ro = V.readout(el);
  var ST = [
    ['State of nature', 'No common power over anyone. Roughly equal people want the same things and distrust one another, so each is ready to strike first: a war of every man against every man. No farming, no building, no learning, and continual fear.'],
    ['The covenant', 'Each person agrees with every other: I give up my right of governing myself to this person or assembly, if you do the same. The agreement is among the people; the sovereign is not a party to it.'],
    ['Commonwealth', 'The sovereign holds the united power of all and keeps the peace. Now there is room for work, trade, arts and letters. Subjects still keep the right to defend their own lives.']
  ];
  var st = opts.stage || 0;
  var P = [[60, 120], [120, 70], [190, 140], [260, 80], [330, 130], [95, 180], [230, 190], [320, 190]];
  function draw() {
    clear(sv);
    var cx = 200, cy = 112, ring = [];
    for (var i = 0; i < P.length; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / P.length; ring.push([cx + 150 * Math.cos(a) * 0.95, cy + 78 * Math.sin(a) + 6]); }
    var pos = st === 0 ? P : ring;
    if (st === 0) { // arrows of distrust between neighbours
      [[0, 1], [1, 3], [2, 4], [0, 5], [2, 6], [4, 7], [3, 2], [5, 6]].forEach(function (e) { var a = P[e[0]], b = P[e[1]]; S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], 'class': 'gbw-line', 'stroke-dasharray': '4 4' }, sv); });
      Tx(sv, 200, 222, 'every one against every one', 'sm mut');
    } else {
      if (st === 1) for (var j = 0; j < ring.length; j++) { var n = ring[(j + 1) % ring.length]; S('path', { d: 'M' + ring[j][0] + ',' + ring[j][1] + ' Q' + cx + ',' + cy + ' ' + n[0] + ',' + n[1], 'class': 'gbw-line' }, sv); }
      if (st === 2) ring.forEach(function (r) { S('line', { x1: r[0], y1: r[1], x2: cx, y2: cy, 'class': 'gbw-hot' }, sv); });
      // the sovereign's seat: a crown on a pedestal (no portrait)
      S('rect', { x: cx - 30, y: cy - 6, width: 60, height: 34, rx: 6, 'class': st === 2 ? 'gbw-on' : 'gbw-box' }, sv);
      S('path', { d: 'M' + (cx - 18) + ',' + (cy - 8) + ' l4,-18 l8,10 l6,-14 l6,14 l8,-10 l4,18 z', 'class': 'gbw-crown' + (st === 2 ? '' : ' gbw-off') }, sv);
      Tx(sv, cx, cy + 16, st === 2 ? 'sovereign' : '(to be chosen)', 'sm b');
      Tx(sv, 200, 222, st === 1 ? 'each agrees with each' : 'one common power keeps the peace', 'sm mut');
    }
    pos.forEach(function (p, i) { person(sv, p[0], p[1] - 14, 0.85, st === 0 && i % 3 === 0 ? 'gbw-robe2' : ''); });
    ro.set('<b>' + (st + 1) + '. ' + ST[st][0] + '.</b> ' + ST[st][1]);
  }
  V.seg(F.ctl, { label: 'Stage', items: ST.map(function (s, i) { return [i, (i + 1) + '. ' + s[0]]; }), value: st, change: function (v) { st = +v; draw(); } });
  draw();
});
