/* gbgreeks.plato-timaeus: visuals (gbe2, our own designs). SVG helpers first. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gb-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbe-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* gb-elements: the Timaeus's four elements as solids made of triangles (53c-57d). Fire, air and water can change into
   one another because their faces are the same equilateral triangles; earth's square faces cannot. */
ML.viz.register('gb-elements', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Plato\'s four elements as solids, and how fire, air and water trade triangles'), sv = F.svg, ro = V.readout(el);
  var E = [
    { k: 'fire', n: 'Fire', s: 'tetrahedron', f: 4 }, { k: 'air', n: 'Air', s: 'octahedron', f: 8 },
    { k: 'water', n: 'Water', s: 'icosahedron', f: 20 }, { k: 'earth', n: 'Earth', s: 'cube', f: 6 }
  ];
  var N = { fire: 0, air: 1, water: 2, earth: 1 }, msg = 'Fire, air and water are built from the same equilateral triangles, so they can break apart and join up again as one another. Try the buttons.';
  function icon(g, k, x, y) {
    var c = 'gbe-ink';
    if (k === 'fire') { S('path', { d: 'M' + x + ',' + (y - 22) + ' l22,38 l-44,0 z M' + x + ',' + (y - 22) + ' l6,38', 'class': c }, g); }
    if (k === 'air') { S('path', { d: 'M' + x + ',' + (y - 24) + ' l22,24 l-22,24 l-22,-24 z M' + (x - 22) + ',' + y + ' l30,4 l14,-4 M' + x + ',' + (y - 24) + ' l8,28 l-8,20', 'class': c }, g); }
    if (k === 'water') { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; p.push((x + 24 * Math.cos(a)).toFixed(1) + ',' + (y + 24 * Math.sin(a)).toFixed(1)); } S('polygon', { points: p.join(' '), 'class': c }, g); S('path', { d: 'M' + p[0] + ' L' + p[2] + ' L' + p[4] + ' Z M' + p[1] + ' L' + p[3] + ' L' + p[5] + ' Z', 'class': c, 'stroke-width': 1 }, g); }
    if (k === 'earth') { S('path', { d: 'M' + (x - 18) + ',' + (y - 10) + ' h26 v26 h-26 z M' + (x - 18) + ',' + (y - 10) + ' l10,-10 h26 l-10,10 M' + (x + 8) + ',' + (y + 16) + ' l10,-10 v-26', 'class': c }, g); }
  }
  function draw() {
    clear(sv);
    E.forEach(function (e, i) {
      var x = 52 + i * 99, g = S('g', {}, sv);
      S('rect', { x: x - 44, y: 14, width: 88, height: 150, rx: 10, 'class': e.k === 'earth' ? 'gbe-box' : 'gbe-box-gold' }, g);
      icon(g, e.k, x, 56); Tx(g, x, 104, e.n, 'b lg'); Tx(g, x, 120, e.s, 'sm mut'); Tx(g, x, 136, e.f + (e.k === 'earth' ? ' squares' : ' triangles'), 'sm mut');
      Tx(g, x, 156, '× ' + N[e.k], 'b acc');
    });
    var tri = 4 * N.fire + 8 * N.air + 20 * N.water;
    Tx(sv, 200, 194, 'Triangles in fire, air and water: ' + tri, 'b');
    Tx(sv, 200, 214, 'The count never changes: triangles are only rearranged.', 'sm mut');
    Tx(sv, 200, 238, 'Plato gives the fifth solid, the dodecahedron, to the whole universe.', 'sm mut');
    ro.set(msg);
  }
  function act(fn) { return function () { msg = fn(); draw(); }; }
  V.button(F.ctl, 'Break up 1 water', act(function () { if (!N.water) return 'There is no water left to break.'; N.water--; N.air += 2; N.fire++; return 'One water (20 triangles) breaks into 2 air (8 + 8) and 1 fire (4): 20 = 16 + 4.'; }));
  V.button(F.ctl, 'Break up 1 air', act(function () { if (!N.air) return 'There is no air left to break.'; N.air--; N.fire += 2; return 'One air (8 triangles) becomes 2 fire (4 + 4).'; }));
  V.button(F.ctl, 'Join 2 fire', act(function () { if (N.fire < 2) return 'You need at least 2 fire.'; N.fire -= 2; N.air++; return 'Two fire (4 + 4) join into 1 air (8).'; }));
  V.button(F.ctl, 'Join 5 air', act(function () { if (N.air < 5) return 'Five air (40 triangles) would make 2 water (20 + 20). You need 5 air.'; N.air -= 5; N.water += 2; return 'Five air (40 triangles) join into 2 water (20 + 20).'; }));
  V.button(F.ctl, 'Break up earth?', act(function () { return 'Earth\'s cube has square faces, made from a different triangle, so in the Timaeus earth never turns into the others. Broken up, its pieces drift until they join again as earth.'; }));
  draw();
});
