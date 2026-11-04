/* gb17.milton-paradise-lost: visuals (gbw2, our own design). */
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
/* gb-pl-cosmos: Milton's universe in Paradise Lost: Heaven above, Hell below, Chaos between, and the created World
   hanging from Heaven by a golden chain (Book II). The story's parts light up where they happen; Satan's route is dashed. */
ML.viz.register('gb-pl-cosmos', function (el, opts, V) {
  var F = frame(el, 400, 300, 'Milton\'s universe: Heaven, Chaos, the World and Hell'), sv = F.svg, ro = V.readout(el);
  var P = [
    ['I–II', 'hell', 'Hell and the long journey', 'Satan and the rebel angels lie in Hell. After their council, Satan crosses the wild, dark sea of Chaos alone, heading upward toward the new world.'],
    ['III', 'heaven', 'Heaven', 'God and the Son speak of human freedom and of redemption. Satan reaches the outside of the World and finds the way in.'],
    ['IV', 'world', 'Eden', 'Inside the World, on Earth, Satan finds Adam and Eve in the Garden of Eden. The guardian angels drive him out.'],
    ['V–VIII', 'heaven', 'Raphael\'s story', 'Raphael tells Adam of the war in Heaven, when the rebels were driven down through Chaos into Hell, and of the creation of the World.'],
    ['IX–X', 'world', 'The Fall', 'In Eden, Satan as a serpent tempts Eve, and Adam eats too. A great bridge is built across Chaos from Hell to the World.'],
    ['XI–XII', 'world', 'Leaving Eden', 'Michael shows Adam the future, then leads Adam and Eve out of the garden into the world.']
  ];
  var cur = opts.part || 0;
  function draw() {
    clear(sv);
    var p = P[cur], z = p[1];
    S('rect', { x: 40, y: 8, width: 320, height: 58, rx: 28, 'class': z === 'heaven' ? 'gbw-on' : 'gbw-heaven' }, sv); Tx(sv, 200, 40, 'Heaven', 'b serif');
    S('rect', { x: 10, y: 66, width: 380, height: 168, rx: 14, 'class': 'gbw-chaos' }, sv); Tx(sv, 340, 150, 'Chaos', 'sm mut serif');
    S('line', { x1: 200, y1: 66, x2: 200, y2: 98, 'class': 'gbw-chain' }, sv);
    S('circle', { cx: 200, cy: 128, r: 30, 'class': z === 'world' ? 'gbw-on' : 'gbw-box' }, sv); Tx(sv, 200, 126, 'the World', 'sm b'); Tx(sv, 200, 140, '(Earth, Eden)', 'sm mut');
    S('rect', { x: 60, y: 234, width: 280, height: 58, rx: 10, 'class': z === 'hell' ? 'gbw-on' : 'gbw-hell' }, sv); Tx(sv, 200, 268, 'Hell', 'b serif');
    var route = cur === 0 || cur === 1 ? 'M150,240 C110,200 120,150 170,140' : cur === 3 ? 'M120,66 C90,140 100,200 130,234' : cur === 4 ? 'M200,234 L200,158' : '';
    if (route) S('path', { d: route, 'class': 'gbw-hot', 'stroke-dasharray': '6 4' }, sv);
    if (cur === 4) Tx(sv, 214, 200, 'the bridge', 'sm acc', 'start');
    if (cur === 3) Tx(sv, 60, 160, 'the fall of the rebels', 'sm acc', 'start');
    if (cur === 0) Tx(sv, 60, 200, 'Satan\'s route', 'sm acc', 'start');
    ro.set('<b>Books ' + p[0] + ': ' + p[2] + '.</b> ' + p[3]);
  }
  V.seg(F.ctl, { label: 'Part of the poem', items: P.map(function (p, i) { return [i, p[0]]; }), value: cur, change: function (v) { cur = +v; draw(); } });
  draw();
});
