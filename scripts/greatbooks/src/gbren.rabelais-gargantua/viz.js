/* gb-theleme: the Abbey of Thélème (Gargantua, chapters LII-LVII), drawn from Rabelais's description: six sides, a round tower
   at each corner, a courtyard with a fountain, and no wall around it. Our own drawing and summaries. */
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
ML.viz.register('gb-theleme', function (el, opts, V) {
  var TW = ['Arctic', 'Calaer', 'Anatole', 'Mesembrine', 'Hesperia', 'Criere'];
  var INFO = {
    tower: 'Each corner of the six-sided abbey has a great round tower, and Rabelais gives each a name made from Greek words. Four of them point to the four directions: Arctic (north), Anatole (east, where the sun rises), Mesembrine (south, the noonday side) and Hesperia (west, where the sun sets).',
    court: 'In the middle is a courtyard with a fine fountain. Around it run galleries, libraries in many languages, and rooms for music, games and exercise.',
    gate: 'Over the gate is a long verse inscription saying who is not welcome (the sour, the greedy, the quarrelsome and the hypocrites) and who is: the honest, the cheerful and the noble-hearted.',
    wall: 'Gargantua orders that the abbey have no wall around it. Walls, he jokes, are where grumbling and plotting grow. Everything about Thélème is the opposite of a strict monastery of his day: no clocks, no bells, men and women together, and anyone may leave to marry.',
    rule: 'The abbey has only one rule, written in its book of rules: "Do What Thou Wilt." Rabelais explains that free, well-taught people in good company naturally want to do good. Readers still argue over whether he meant this as a serious ideal or as a joke about a world that could never be.'
  };
  var F = frame(el, 400, 290, 'The Abbey of Thélème: six sides, six towers, a fountain in the courtyard'), sv = F.svg, ro = V.readout(el), cur = opts.part || 'rule', cx = 200, cy = 145, R = 100;
  function P(i, r) { var a = -Math.PI / 2 + i * Math.PI / 3; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function g(key, label) { var e = S('g', { 'class': key === cur ? 'gbr-on' : '' }, sv); hit(e, label, function () { cur = key; draw(); }); return e; }
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 290, 'class': 'gbr-bg' }, sv);
    var gw = g('wall', 'No wall around it'); S('rect', { x: 8, y: 8, width: 384, height: 274, rx: 18, 'class': 'gbr-f1', opacity: 0.5 }, gw); Tx(gw, 24, 30, 'open fields: no wall', 'gbr-i', 'start');
    var outer = [], inner = [];
    for (var i = 0; i < 6; i++) { outer.push(P(i, R).join(',')); inner.push(P(i, R - 34).join(',')); }
    S('polygon', { points: outer.join(' '), 'class': 'gbr-stone' }, sv);
    var gc = g('court', 'The courtyard and fountain'); S('polygon', { points: inner.join(' '), 'class': 'gbr-f2 gbr-sec' }, gc);
    S('circle', { cx: cx, cy: cy, r: 16, 'class': 'gbr-water' }, gc); S('circle', { cx: cx, cy: cy, r: 5, 'class': 'gbr-card' }, gc); Tx(gc, cx, cy + 32, 'fountain', 'gbr-m');
    var gt = g('tower', 'The six towers');
    for (var j = 0; j < 6; j++) { var p = P(j, R), q = P(j, R + 34); S('circle', { cx: p[0], cy: p[1], r: 17, 'class': 'gbr-f0 gbr-sec' }, gt); Tx(gt, q[0], q[1] + 4, TW[j], 'gbr-b'); }
    var gg = g('gate', 'The gate and its inscription'), m = [(P(2, R)[0] + P(3, R)[0]) / 2, (P(2, R)[1] + P(3, R)[1]) / 2];
    S('rect', { x: m[0] - 9, y: m[1] - 9, width: 18, height: 18, rx: 3, 'class': 'gbr-f3 gbr-sec', transform: 'rotate(30 ' + m[0] + ' ' + m[1] + ')' }, gg); Tx(gg, m[0] + 30, m[1] + 18, 'gate', 'gbr-m');
    var gr = g('rule', 'The one rule'); S('rect', { x: 12, y: 248, width: 150, height: 24, rx: 6, 'class': 'gbr-card' }, gr); Tx(gr, 87, 264, 'DO WHAT THOU WILT', 'gbr-b');
    ro.set('<b>' + { tower: 'The towers', court: 'The courtyard', gate: 'The gate', wall: 'No wall', rule: 'The one rule' }[cur] + '.</b> ' + INFO[cur]);
  }
  draw();
});
