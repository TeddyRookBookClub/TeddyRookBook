/* gbgreeks.sophocles-oedipus: visual gb-greek-theater (gbe1, our own design). A Greek theater seen from above,
   simplified from the Theater of Dionysus in Athens: tap a part for what it was and how the plays used it.
   opts: part (a key below, selected at the start). */
var NS = 'http://www.w3.org/2000/svg', D = document;
function S(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function T(par, x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'middle' }, par); t.textContent = s; return t; }
function hit(g, label, fn) {
  g.setAttribute('class', (g.getAttribute('class') || '') + ' gbx-hit'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label);
  g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
var PARTS = {
  theatron: ['The seating (<em>theatron</em>)', 'The "watching place": rows of seats cut into the hillside below the Acropolis, divided into wedges by stairways. Wooden benches in Sophocles\' time, later stone. Estimates of the size vary; in its later stone form it may have held more than 15,000 people.'],
  orchestra: ['The dancing floor (<em>orchēstra</em>)', 'A flat, round floor where the chorus of 12 or 15 sang and danced between the scenes. The word comes from the Greek for "to dance". An altar may have stood near the middle.'],
  skene: ['The stage building (<em>skēnē</em>)', 'A wooden building behind the orchestra, usually painted as a palace or temple front. Actors changed masks and costumes inside, and its central door was the palace door: in Oedipus, the door through which the messenger comes out with the terrible news. Our word <em>scene</em> comes from it.'],
  parodos: ['The side passages (<em>parodoi</em>)', 'Two open passages between the seats and the stage building. The chorus marched in by one of them, and travelers and messengers arrived along them, by custom from the city on one side and from the country or abroad on the other.'],
  ekkyklema: ['The rolling platform (<em>ekkyklēma</em>)', 'A low platform rolled out through the central door to show what had happened inside, since violence was never acted in front of the audience: for example, the bodies of Agamemnon and Cassandra, or of Clytemnestra and Aegisthus.'],
  mechane: ['The crane (<em>mēchanē</em>)', 'A crane on the stage building that could swing an actor into the air: a god appearing above the action, as at the end of many plays by Euripides. Hence <em>deus ex machina</em>, "a god from the machine".'],
  actors: ['Actors and masks', 'All the actors were men. Tragedy used at most three speaking actors, who played every part between them by changing masks; Aristotle says Sophocles added the third. The masks were large and easy to read from the back rows.']
};
ML.viz.register('gb-greek-theater', function (el, opts, V) {
  var box = D.createElement('div'); box.className = 'gbx'; el.appendChild(box);
  var W = 560, H = 404, cx = 280, cy = 238;
  var svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'gbx-svg', role: 'group', 'aria-label': 'Plan of a Greek theater' }, box);
  S('rect', { x: 0, y: 0, width: W, height: H, rx: 10, 'class': 'gbx-bg' }, svg);
  var shapes = {};
  function arc(r, a0, a1) { return [cx + r * Math.cos(a0), cy - r * Math.sin(a0), cx + r * Math.cos(a1), cy - r * Math.sin(a1)]; }
  // seating: a band from radius 92 to 220, over about 220 degrees, wedges by stairways
  var g1 = S('g', {}, svg), r0 = 92, r1 = 222, A0 = -20 * Math.PI / 180, A1 = 200 * Math.PI / 180;
  var o = arc(r1, A0, A1), i = arc(r0, A1, A0);
  shapes.theatron = S('path', { d: 'M' + o[0] + ' ' + o[1] + ' A' + r1 + ' ' + r1 + ' 0 1 0 ' + o[2] + ' ' + o[3] + ' L' + i[0] + ' ' + i[1] + ' A' + r0 + ' ' + r0 + ' 0 1 1 ' + i[2] + ' ' + i[3] + ' Z', 'class': 'gbx-part gbx-fill1' }, g1);
  for (var k = 0; k <= 13; k++) { var a = A0 + (A1 - A0) * k / 13, p = arc(r0, a, a), q = arc(r1, a, a); S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], 'class': 'gbx-wed' }, g1); }
  [140, 180].forEach(function (r) { var c = arc(r, A0, A1); S('path', { d: 'M' + c[0] + ' ' + c[1] + ' A' + r + ' ' + r + ' 0 1 0 ' + c[2] + ' ' + c[3], fill: 'none', 'class': 'gbx-wed', 'stroke-width': 1 }, g1); });
  T(g1, cx, cy - 160, 'seating (theatron)', 'gbx-lab');
  hit(g1, 'The seating', function () { set('theatron'); });
  var g2 = S('g', {}, svg);
  shapes.orchestra = S('circle', { cx: cx, cy: cy, r: 78, 'class': 'gbx-part gbx-fill2' }, g2);
  S('rect', { x: cx - 6, y: cy - 6, width: 12, height: 12, 'class': 'gbx-wed', fill: 'none' }, g2);
  T(g2, cx, cy - 22, 'orchestra', 'gbx-lab');
  T(g2, cx, cy - 8, '(chorus)', 'gbx-small');
  hit(g2, 'The orchestra', function () { set('orchestra'); });
  var g3 = S('g', {}, svg);
  shapes.skene = S('rect', { x: cx - 150, y: cy + 88, width: 300, height: 40, rx: 3, 'class': 'gbx-part gbx-fill3' }, g3);
  T(g3, cx - 80, cy + 113, 'stage building (skēnē)', 'gbx-lab');
  hit(g3, 'The stage building', function () { set('skene'); });
  var g4 = S('g', {}, svg);
  shapes.ekkyklema = S('rect', { x: cx - 22, y: cy + 78, width: 44, height: 14, rx: 2, 'class': 'gbx-part gbx-fill4' }, g4);
  S('line', { x1: cx, y1: cy + 92, x2: cx, y2: cy + 140, 'class': 'gbx-wed', 'stroke-width': 1 }, g4);
  T(g4, cx, cy + 154, 'rolling platform', 'gbx-small');
  hit(g4, 'The rolling platform', function () { set('ekkyklema'); });
  var g5 = S('g', {}, svg);
  shapes.mechane = S('path', { d: 'M' + (cx + 120) + ' ' + (cy + 88) + ' l0 -34 l-30 -8', 'class': 'gbx-part', fill: 'none', 'stroke-width': 4 }, g5);
  S('circle', { cx: cx + 90, cy: cy + 46, r: 5, 'class': 'gbx-dot' }, g5);
  S('line', { x1: cx + 120, y1: cy + 128, x2: cx + 120, y2: cy + 140, 'class': 'gbx-wed', 'stroke-width': 1 }, g5);
  T(g5, cx + 120, cy + 154, 'crane', 'gbx-small');
  hit(g5, 'The crane', function () { set('mechane'); });
  var g6 = S('g', {}, svg);
  var pa = S('path', { d: 'M' + (cx - 222) + ' ' + (cy + 70) + ' L' + (cx - 160) + ' ' + (cy + 96) + ' M' + (cx + 222) + ' ' + (cy + 70) + ' L' + (cx + 160) + ' ' + (cy + 96), 'class': 'gbx-route-a', 'stroke-width': 10, 'stroke-opacity': 0.35 }, g6);
  shapes.parodos = pa;
  T(g6, cx - 214, cy + 102, 'side passage', 'gbx-small', 'start');
  T(g6, cx + 214, cy + 102, 'side passage', 'gbx-small', 'end');
  hit(g6, 'The side passages', function () { set('parodos'); });
  var g7 = S('g', {}, svg);
  [-26, 0, 26].forEach(function (dx) { shapes['a' + dx] = S('circle', { cx: cx + dx - 20, cy: cy + 34, r: 7, 'class': 'gbx-pt' }, g7); });
  T(g7, cx - 20, cy + 58, '3 actors', 'gbx-small');
  shapes.actors = shapes.a0;
  hit(g7, 'Actors and masks', function () { set('actors'); });
  var ctl = D.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var keys = Object.keys(PARTS), cur = PARTS[opts.part] ? opts.part : 'orchestra';
  V.button(ctl, 'Next part ▶', function () { set(keys[(keys.indexOf(cur) + 1) % keys.length]); });
  var ro = V.readout(el);
  function set(k) {
    cur = k;
    Object.keys(shapes).forEach(function (s) { if (shapes[s].classList) shapes[s].classList.remove('gbx-on'); });
    if (shapes[k]) shapes[k].classList.add('gbx-on');
    if (k === 'actors') ['a-26', 'a0', 'a26'].forEach(function (a) { shapes[a].classList.add('gbx-on'); });
    ro.set('<b>' + PARTS[k][0] + '.</b> ' + PARTS[k][1]);
  }
  set(cur);
});
