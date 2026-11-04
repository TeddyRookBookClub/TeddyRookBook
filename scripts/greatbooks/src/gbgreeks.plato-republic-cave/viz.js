/* gbgreeks.plato-republic-cave: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-cave: the allegory of the cave (Republic VII, 514a-517a), in five stages.
   gb-divided-line: the divided line (Republic VI, 509d-511e); the two middle parts always come out equal. */
function person(g, x, y, s) { // a generic seated figure in the site's cartoon skin color
  S('rect', { x: x - 7 * s, y: y - 4 * s, width: 14 * s, height: 20 * s, rx: 6 * s, 'class': 'gbe-cloth' }, g);
  S('circle', { cx: x, cy: y - 10 * s, r: 7 * s, 'class': 'gbe-skin' }, g);
}
ML.viz.register('gb-cave', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Plato\'s cave: prisoners, the wall of shadows, the fire, the road up and the sun'), sv = F.svg, ro = V.readout(el);
  var ST = [
    ['Chained', 'Prisoners sit chained from childhood, facing the back wall. People behind them carry objects along a low wall, and the fire throws the objects\' <b>shadows</b> on the cave wall. The prisoners think the shadows are all there is.'],
    ['Turned around', 'One prisoner is set free and turned toward the fire. The light hurts his eyes. Told that the objects are more real than the shadows, he does not believe it at first.'],
    ['Dragged up', 'He is pulled up the rough, steep road toward the mouth of the cave. It is hard and he resists.'],
    ['In the sunlight', 'Outside, he is dazzled. First he can look only at shadows and reflections in water, then at the things themselves, then the night sky, and at last the <b>sun</b>, which Plato compares to the Good: the source of light and of seeing.'],
    ['Going back', 'He goes back down to free the others. His eyes are not used to the dark, and he does badly at the shadow game. The prisoners laugh at him and say the trip up ruined his eyes. Plato hints they might even turn on him, as Athens turned on Socrates.']
  ];
  var st = opts.stage || 0, ground = 214;
  function draw() {
    clear(sv);
    S('path', { d: 'M0,0 L290,0 Q300,60 340,92 L400,92 L400,250 L0,250 Z', 'class': 'gbe-stone' }, sv); // rock
    S('path', { d: 'M24,30 L250,30 Q262,96 330,140 L400,140 L400,214 L24,214 Z', 'class': 'gbe-box' }, sv); // the hollow
    S('rect', { x: 290, y: 0, width: 110, height: 92, 'class': 'gbe-sky' }, sv);
    S('circle', { cx: 372, cy: 30, r: 14, 'class': 'gbe-sun', opacity: st === 3 ? 1 : 0.55 }, sv);
    S('rect', { x: 30, y: 70, width: 44, height: 130, rx: 4, 'class': st === 0 ? 'gbe-box-gold' : 'gbe-box' }, sv); // the wall the prisoners face
    [[36, 'M0,0 l10,-14 l10,14 z'], [40, 'M0,0 c0,-14 18,-14 18,0 z'], [41, 'M0,0 l6,-18 l6,18 z']].forEach(function (sh, i) { S('path', { d: sh[1], transform: 'translate(' + sh[0] + ',' + (110 + i * 36) + ') scale(1.4)', 'class': 'gbe-shadow' }, sv); });
    S('rect', { x: 176, y: 172, width: 26, height: 42, 'class': 'gbe-stone' }, sv); // low wall
    [[182, 'M0,0 l8,-16 l8,16 z'], [192, 'M0,0 c0,-12 14,-12 14,0 z']].forEach(function (s, i) { S('path', { d: s[1], transform: 'translate(' + (s[0] - 6 + i * 4) + ',' + (172 - i * 2) + ')', 'class': 'gbe-gold' }, sv); });
    S('path', { d: 'M234,214 q6,-30 12,-46 q8,18 14,46 z', 'class': 'gbe-fire' }, sv); S('path', { d: 'M240,214 q4,-16 7,-26 q5,10 8,26 z', 'class': 'gbe-flame' }, sv);
    for (var i = 0; i < 3; i++) person(sv, 96 + i * 24, 200, 0.9);
    S('line', { x1: 86, y1: 210, x2: 154, y2: 210, 'class': 'gbe-bar', 'stroke-width': 2 }, sv);
    var pos = [[0, 0], [162, 200], [300, 128], [345, 84], [78, 200]][st];
    if (st > 0) person(sv, pos[0], pos[1], 0.9);
    Tx(sv, 52, 62, 'the wall', 'sm mut'); Tx(sv, 120, 238, 'prisoners', 'sm mut'); Tx(sv, 190, 238, 'low wall', 'sm mut'); Tx(sv, 250, 238, 'fire', 'sm mut'); Tx(sv, 345, 110, 'the road up', 'sm mut');
    ro.set('<b>' + (st + 1) + '. ' + ST[st][0] + '.</b> ' + ST[st][1]);
  }
  V.seg(F.ctl, { label: 'Stage', items: ST.map(function (s, i) { return [i, (i + 1) + '. ' + s[0]]; }), value: st, change: function (v) { st = +v; draw(); } });
  draw();
});

ML.viz.register('gb-divided-line', function (el, opts, V) {
  var F = frame(el, 400, 270, 'The divided line: four kinds of thing and four ways of knowing'), sv = F.svg, ro = V.readout(el);
  var k = opts.k || 2, total = 180;
  var P = [['Images', 'shadows, reflections', 'imagining (eikasia)'], ['Things', 'animals, plants, made things', 'belief (pistis)'], ['Mathematics', 'numbers, figures', 'reasoning (dianoia)'], ['Forms', 'the Good, justice itself', 'understanding (noesis)']];
  function draw() {
    clear(sv);
    var vis = total / (1 + k), intl = total - vis, seg = [vis / (1 + k), vis * k / (1 + k), intl / (1 + k), intl * k / (1 + k)];
    var y = 250, x = 70, cls = ['gbe-box', 'gbe-box-blue', 'gbe-box-gold', 'gbe-box-on'];
    var slot = [232, 186, 140, 94];
    for (var i = 0; i < 4; i++) {
      var h = seg[i]; y -= h;
      S('rect', { x: x, y: y, width: 26, height: h, 'class': cls[i] }, sv);
      S('line', { x1: x + 28, y1: y + h / 2, x2: x + 46, y2: slot[i] - 4, 'class': 'gbe-line', 'stroke-width': 1 }, sv);
      Tx(sv, x + 50, slot[i] - 3, P[i][0] + '  ' + V.fmt(h, 1), 'b', 'start');
      Tx(sv, x + 50, slot[i] + 12, P[i][1] + ' · ' + P[i][2], 'sm mut', 'start');
    }
    S('line', { x1: 52, y1: 250, x2: 52, y2: 250 - vis, 'class': 'gbe-ink' }, sv); S('line', { x1: 52, y1: 250 - vis, x2: 52, y2: 70, 'class': 'gbe-arrow' }, sv);
    Tx(sv, 40, 250 - vis / 2, 'seen', 'sm mut', 'end'); Tx(sv, 40, 250 - vis - intl / 2, 'known', 'sm mut', 'end');
    Tx(sv, 200, 40, 'A line of ' + total + ' units, cut ' + V.fmt(k, 1) + ' : 1, then each part cut the same way', 'sm mut');
    ro.set('The <b>known</b> part is ' + V.fmt(k, 1) + ' times the <b>seen</b> part, and each part is cut again in the same ratio. Things and Mathematics both come to <b>' + V.fmt(seg[1], 1) + '</b>: the two middle parts are always equal, whatever ratio you choose. (Plato does not point this out; readers have noticed it ever since.)');
  }
  V.slider(F.ctl, { label: 'Ratio (known : seen)', min: 1.2, max: 3, step: 0.1, value: k, input: function (v) { k = v; draw(); } });
  draw();
});
