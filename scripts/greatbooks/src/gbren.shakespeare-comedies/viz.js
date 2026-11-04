/* gb-globe: a plan of the Globe playhouse (1599), drawn from the usual reconstruction, with its parts explained. Our own drawing. */
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
ML.viz.register('gb-globe', function (el, opts, V) {
  var F = frame(el, 400, 300, 'A plan of the Globe playhouse, seen from above'), sv = F.svg, ro = V.readout(el), cur = opts.part || 'stage';
  var cx = 200, cy = 150, R1 = 128, R2 = 92, N = 20;
  var P = {
    galleries: ['The galleries', 'Three levels of covered wooden benches ring the yard. A seat cost more than standing, and a cushion more again. The building held perhaps 3,000 people.'],
    yard: ['The yard', 'An open-air space in front of the stage, with no roof. "Groundlings" paid a penny to stand here, close enough to touch the stage. If it rained, they got wet.'],
    stage: ['The stage', 'A raised platform that juts out into the yard, so the audience stands on three sides. There was almost no scenery: the words told you where you were. A trapdoor let ghosts and spirits rise from below.'],
    tiring: ['The tiring house', 'The building behind the stage where actors attired themselves (dressed) and waited. Two or three doors led onto the stage, and a balcony above could be a castle wall or Juliet\'s window.'],
    heavens: ['The heavens', 'A roof over the stage, held up by two great pillars and painted underneath with sun, moon and stars. Actors could be lowered from it.'],
    door: ['The entrance', 'Plays began in the afternoon, by daylight. A flag on the roof announced a performance that day.']
  };
  function poly(r) { var pts = []; for (var i = 0; i < N; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / N; pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return pts.join(' '); }
  function part(key, build) { var g = S('g', { 'class': key === cur ? 'gbr-on' : '' }, sv); build(g); hit(g, P[key][0], function () { cur = key; draw(); }); return g; }
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 300, 'class': 'gbr-bg' }, sv);
    part('galleries', function (g) { S('polygon', { points: poly(R1), 'class': 'gbr-f0 gbr-sec' }, g); });
    part('yard', function (g) { S('polygon', { points: poly(R2), 'class': 'gbr-f1 gbr-sec' }, g); for (var i = 0; i < 14; i++) { var a = 0.4 + i * 0.37, r = 40 + (i % 3) * 16; person(g, cx + r * Math.cos(a), cy + 30 + r * 0.55 * Math.sin(a), 0.45, ['gbr-cloth', 'gbr-cloth2', 'gbr-cloth3'][i % 3]); } });
    part('tiring', function (g) { S('path', { d: 'M' + (cx - 70) + ',' + (cy - 118) + ' L' + (cx + 70) + ',' + (cy - 118) + ' L' + (cx + 62) + ',' + (cy - 86) + ' L' + (cx - 62) + ',' + (cy - 86) + ' Z', 'class': 'gbr-f4 gbr-sec' }, g); });
    part('stage', function (g) { S('rect', { x: cx - 58, y: cy - 86, width: 116, height: 82, 'class': 'gbr-f2 gbr-sec' }, g); S('rect', { x: cx - 8, y: cy - 52, width: 16, height: 12, 'class': 'gbr-ln' }, g); });
    part('heavens', function (g) { S('rect', { x: cx - 58, y: cy - 86, width: 116, height: 26, 'class': 'gbr-f5 gbr-sec', opacity: 0.85 }, g); S('circle', { cx: cx - 44, cy: cy - 46, r: 5, 'class': 'gbr-wood' }, g); S('circle', { cx: cx + 44, cy: cy - 46, r: 5, 'class': 'gbr-wood' }, g); });
    part('door', function (g) { S('rect', { x: cx - 14, y: cy + R1 - 8, width: 28, height: 16, rx: 3, 'class': 'gbr-f3 gbr-sec' }, g); });
    Tx(sv, cx, cy - 98, 'tiring house', 'gbr-m'); Tx(sv, cx, cy - 66, 'heavens', 'gbr-m'); Tx(sv, cx, cy - 22, 'stage', 'gbr-b');
    Tx(sv, cx + 66, cy + 72, 'yard', 'gbr-b'); Tx(sv, cx + 104, cy - 96, 'galleries', 'gbr-b', 'start'); Tx(sv, cx, cy + R1 + 20, 'entrance', 'gbr-m');
    Tx(sv, 12, 290, 'Not to scale. About 30 m (100 ft) across.', 'gbr-m', 'start');
    ro.set('<b>' + P[cur][0] + '.</b> ' + P[cur][1]);
  }
  draw();
});
