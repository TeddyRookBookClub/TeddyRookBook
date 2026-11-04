/* gb-windmill: Part One, Chapter VIII. Slide between what Sancho sees (a windmill) and what Don Quixote sees (a giant). Our own drawing:
   the giant is a generic figure in the site's cartoon skin color. */
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
ML.viz.register('gb-windmill', function (el, opts, V) {
  var F = frame(el, 400, 250, 'A windmill on the plain, or a giant'), sv = F.svg, ro = V.readout(el), m = opts.m || 0, ang = 0, cx = 230, cy = 95;
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 250, 'class': 'gbr-sky' }, sv);
    S('path', { d: 'M0,190 Q100,175 200,188 T400,184 L400,250 L0,250 Z', 'class': 'gbr-land' }, sv);
    var mill = S('g', { opacity: (1 - m).toFixed(2) }, sv);
    S('path', { d: 'M' + (cx - 22) + ',192 L' + (cx - 14) + ',' + (cy + 4) + ' L' + (cx + 14) + ',' + (cy + 4) + ' L' + (cx + 22) + ',192 Z', 'class': 'gbr-stone' }, mill);
    S('path', { d: 'M' + (cx - 16) + ',' + (cy + 6) + ' L' + cx + ',' + (cy - 12) + ' L' + (cx + 16) + ',' + (cy + 6) + ' Z', 'class': 'gbr-wood' }, mill);
    for (var i = 0; i < 4; i++) { var a = ang + i * Math.PI / 2, ex = cx + 74 * Math.cos(a), ey = cy + 74 * Math.sin(a); S('line', { x1: cx, y1: cy, x2: ex, y2: ey, 'class': 'gbr-ln', 'stroke-width': 3 }, mill); var px = -Math.sin(a) * 9, py = Math.cos(a) * 9; S('path', { d: 'M' + (cx + 20 * Math.cos(a)) + ',' + (cy + 20 * Math.sin(a)) + ' L' + ex + ',' + ey + ' L' + (ex + px) + ',' + (ey + py) + ' L' + (cx + 20 * Math.cos(a) + px) + ',' + (cy + 20 * Math.sin(a) + py) + ' Z', 'class': 'gbr-card' }, mill); }
    var gi = S('g', { opacity: m.toFixed(2) }, sv);
    S('rect', { x: cx - 26, y: cy - 4, width: 52, height: 100, rx: 18, 'class': 'gbr-cloth2' }, gi);
    S('rect', { x: cx - 22, y: 180, width: 16, height: 14, rx: 4, 'class': 'gbr-wood' }, gi); S('rect', { x: cx + 6, y: 180, width: 16, height: 14, rx: 4, 'class': 'gbr-wood' }, gi);
    for (var j = 0; j < 4; j++) { var b = ang + j * Math.PI / 2; S('line', { x1: cx, y1: cy + 10, x2: cx + 70 * Math.cos(b), y2: cy + 10 + 70 * Math.sin(b), stroke: '#e8a93a', 'stroke-width': 9, 'stroke-linecap': 'round' }, gi); }
    S('circle', { cx: cx, cy: cy - 22, r: 22, 'class': 'gbr-skin' }, gi);
    S('path', { d: 'M' + (cx - 10) + ',' + (cy - 26) + ' l6,3 M' + (cx + 10) + ',' + (cy - 26) + ' l-6,3', 'class': 'gbr-ln', 'stroke-width': 2 }, gi);
    S('path', { d: 'M' + (cx - 8) + ',' + (cy - 12) + ' q8,-5 16,0', 'class': 'gbr-ln', 'stroke-width': 2 }, gi);
    // the knight and his squire, small, on the left
    S('rect', { x: 46, y: 166, width: 34, height: 16, rx: 6, 'class': 'gbr-f5' }, sv); S('rect', { x: 50, y: 180, width: 4, height: 14, 'class': 'gbr-wood' }, sv); S('rect', { x: 72, y: 180, width: 4, height: 14, 'class': 'gbr-wood' }, sv);
    person(sv, 62, 156, 0.8, 'gbr-stone'); S('line', { x1: 66, y1: 156, x2: 120, y2: 132, 'class': 'gbr-ln', 'stroke-width': 2.5 }, sv);
    person(sv, 112, 178, 0.75, 'gbr-cloth3');
    Tx(sv, 62, 214, 'Don Quixote', 'gbr-m'); Tx(sv, 116, 228, 'Sancho', 'gbr-m');
    ro.set(m < 0.5 ? '<b>What Sancho sees:</b> a windmill, its sails turning in the wind to grind grain. La Mancha\'s plain was dotted with them.' : '<b>What Don Quixote sees:</b> a monstrous giant waving its long arms. He charges with his lance, a sail catches him, and he and his horse go tumbling. He decides an enchanter turned the giants into windmills to rob him of the glory.');
  }
  V.slider(F.ctl, { label: 'Whose eyes?', min: 0, max: 1, step: 0.05, value: m, fmt: function (v) { return v < 0.5 ? 'Sancho\'s' : 'Don Quixote\'s'; }, input: function (v) { m = v; draw(); } });
  if (!V.reduced) { var lp = V.loop(el, function (dt) { ang += dt * 0.6; draw(); }); V.button(F.ctl, 'Stop the wind', function () { if (lp.running()) { lp.stop(); this.textContent = 'Start the wind'; } else { lp.start(); this.textContent = 'Stop the wind'; } }); }
  draw();
});
