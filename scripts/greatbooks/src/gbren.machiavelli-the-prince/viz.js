/* gb-principalities: Machiavelli's map of kinds of state (The Prince, chapters I-XI), as a tree.
   gb-fortune-river: chapter XXV's picture of fortune as a flooding river, and the dikes built in calm weather. Our own drawings. */
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
ML.viz.register('gb-principalities', function (el, opts, V) {
  var N = [
    ['all', 'States', 200, 28, '', 'Chapter I: every state is either a republic or a principality (ruled by a prince). The Prince is about principalities; Machiavelli says he wrote about republics elsewhere (his Discourses on Livy).'],
    ['her', 'Hereditary', 62, 90, 'all', 'Chapter II: ruled by an old family. Easy to keep, he says: the prince need only not upset the old ways.'],
    ['new', 'New', 200, 90, 'all', 'Chapters III-V: newly won, wholly or as an addition to an old state. Hard to hold, because the people who helped you expect too much and the ones you displaced want revenge.'],
    ['eccl', 'Church states', 338, 90, 'all', 'Chapter XI: states ruled by the Church, held up, he says, by ancient religious customs.'],
    ['own', 'By your own arms and ability', 52, 178, 'new', 'Chapter VI: founders who rose by their own virtù (ability and drive), such as Moses, Cyrus, Romulus and Theseus. Hard to win, but easier to keep.'],
    ['fort', 'By others\' arms and fortune', 150, 178, 'new', 'Chapter VII: those raised up by luck or others\' help, such as Cesare Borgia. Easy to win, hard to keep.'],
    ['crime', 'By wickedness', 248, 178, 'new', 'Chapter VIII: those who rose by crimes, such as Agathocles of Syracuse. Machiavelli says such a man may win power but not glory.'],
    ['civ', 'By the favor of fellow citizens', 346, 178, 'new', 'Chapter IX: the "civil principality." Machiavelli advises such a prince to keep the people\'s friendship, since the people want only not to be oppressed.']
  ];
  var F = frame(el, 400, 220, 'Machiavelli\'s kinds of principality'), sv = F.svg, ro = V.readout(el), cur = opts.node || 'all';
  var byId = {}; N.forEach(function (n) { byId[n[0]] = n; });
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 220, 'class': 'gbr-bg' }, sv);
    N.forEach(function (n) { if (n[4]) { var p = byId[n[4]]; S('path', { d: 'M' + p[2] + ',' + (p[3] + 14) + ' C' + p[2] + ',' + (p[3] + 40) + ' ' + n[2] + ',' + (n[3] - 40) + ' ' + n[2] + ',' + (n[3] - 14), 'class': 'gbr-ln' }, sv); } });
    N.forEach(function (n) {
      var g = S('g', { 'class': n[0] === cur ? 'gbr-on' : '' }, sv), L = wrap(n[1], 13), w = 94, h = 14 + L.length * 13;
      S('rect', { x: n[2] - w / 2, y: n[3] - h / 2, width: w, height: h, rx: 8, 'class': 'gbr-node' }, g);
      L.forEach(function (l, j) { Tx(g, n[2], n[3] - h / 2 + 18 + j * 13, l, 'gbr-b'); });
      hit(g, n[1], function () { cur = n[0]; draw(); });
    });
    ro.set('<b>' + byId[cur][1] + '.</b> ' + byId[cur][5]);
  }
  draw();
});

ML.viz.register('gb-fortune-river', function (el, opts, V) {
  var F = frame(el, 400, 220, 'A river in flood and the dikes built beforehand'), sv = F.svg, ro = V.readout(el), dike = opts.dike || 2, flood = 0;
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 220, 'class': 'gbr-sky' }, sv);
    var lvl = flood ? 110 : 170, top = 150 - dike * 12, over = flood > 0 && lvl < top;
    S('path', { d: 'M0,150 L130,150 L150,190 L250,190 L270,150 L400,150 L400,220 L0,220 Z', 'class': 'gbr-land' }, sv);
    S('path', { d: 'M' + (lvl < 150 ? 132 : 150 + (lvl - 150) * 0) + ',' + lvl + ' L' + (lvl < 150 ? 268 : 250) + ',' + lvl + ' L250,190 L150,190 Z', 'class': 'gbr-water' }, sv);
    if (dike > 0) { S('rect', { x: 118, y: top, width: 14, height: 150 - top, 'class': 'gbr-stone' }, sv); S('rect', { x: 268, y: top, width: 14, height: 150 - top, 'class': 'gbr-stone' }, sv); }
    if (over) { S('rect', { x: 0, y: 134, width: 400, height: 16, 'class': 'gbr-water', opacity: 0.9 }, sv); }
    [40, 80, 320, 360].forEach(function (x) { S('rect', { x: x - 2, y: 128, width: 4, height: 22, 'class': 'gbr-wood' }, sv); S('circle', { cx: x, cy: 124, r: 10, 'class': over ? 'gbr-f5' : 'gbr-f1' }, sv); });
    Tx(sv, 200, 210, 'the river', 'gbr-m'); Tx(sv, 60, 166, 'fields', 'gbr-m'); Tx(sv, 340, 166, 'fields', 'gbr-m');
    var msg = flood ? (over ? '<b>The flood breaks over the banks</b> and sweeps across the fields. Fortune, Machiavelli says, shows her power where no one has prepared to resist her.' : '<b>The dikes hold.</b> The river rises, but the fields are safe. This is Machiavelli\'s advice: prepare in quiet times, and fortune can do far less harm.') : 'Calm weather. Build dikes and banks now (use the slider), then press <b>Send the flood</b>. In Chapter XXV Machiavelli says fortune rules about half of what happens to us and leaves the other half to us.';
    ro.set(msg);
  }
  var sl = V.slider(F.ctl, { label: 'Dikes built in calm weather', min: 0, max: 6, step: 1, value: dike, fmt: function (v) { return ['none', 'very low', 'low', 'fair', 'good', 'high', 'very high'][v]; }, input: function (v) { dike = v; flood = 0; draw(); } });
  V.button(F.ctl, 'Send the flood', function () { flood = 1; draw(); });
  V.button(F.ctl, 'Calm again', function () { flood = 0; draw(); });
  draw();
});
