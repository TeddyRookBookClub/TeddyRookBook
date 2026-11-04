/* gb-folly: Folly at the center of the world, and the people her speech teases, as a ring. Our own summaries. */
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
ML.viz.register('gb-folly', function (el, opts, V) {
  var T = [
    ['Everyday people', 'Lovers, hunters, gamblers, builders who cannot stop building: Folly says she makes ordinary life sweet, because no one could bear it if they saw themselves too clearly.'],
    ['Teachers', 'Schoolmasters who rule a classroom like kings and quarrel over tiny points of grammar.'],
    ['Poets and authors', 'Writers who live for praise, rewrite their books for years, and are delighted when someone admires them.'],
    ['Philosophers', 'Thinkers who claim to measure the stars but cannot see what is in front of them.'],
    ['Theologians', 'Scholars who argue over endless puzzling questions instead of living the simple teaching of the Gospel.'],
    ['Monks and friars', 'Some who care more about the exact rules of their dress and diet than about kindness.'],
    ['Rulers and courtiers', 'Kings who think only of pleasure, and courtiers who flatter them.'],
    ['Popes and bishops', 'Church leaders who live like princes, which Folly says is the opposite of the apostles\' poverty.']
  ];
  var F = frame(el, 400, 300, 'Folly in the middle, and the kinds of people her speech teases'), sv = F.svg, ro = V.readout(el), cur = -1, cx = 200, cy = 150, R = 132, r0 = 58;
  function arc(a0, a1, r1, r2) {
    var p = function (a, r) { return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1); };
    return 'M' + p(a0, r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + p(a1, r2) + ' L' + p(a1, r1) + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + p(a0, r1) + ' Z';
  }
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 300, 'class': 'gbr-bg' }, sv);
    T.forEach(function (t, i) {
      var a0 = -Math.PI / 2 - Math.PI / T.length + i * 2 * Math.PI / T.length, a1 = a0 + 2 * Math.PI / T.length, am = (a0 + a1) / 2;
      var g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv);
      S('path', { d: arc(a0, a1, r0, R), 'class': 'gbr-f' + (i % 6) + ' gbr-sec' }, g);
      var lines = wrap(t[0], 11), rx = cx + 96 * Math.cos(am), ry = cy + 96 * Math.sin(am) - (lines.length - 1) * 7 + 4;
      lines.forEach(function (l, j) { Tx(g, rx, ry + j * 14, l, 'gbr-b'); });
      hit(g, t[0], function () { cur = i; draw(); });
    });
    S('circle', { cx: cx, cy: cy, r: r0 - 4, 'class': 'gbr-card' }, sv);
    // Folly: a generic figure in a jester's cap with bells
    person(sv, cx, cy + 2, 1.1, 'gbr-cloth2');
    S('path', { d: 'M' + (cx - 8) + ',' + (cy - 14) + ' Q' + (cx - 20) + ',' + (cy - 28) + ' ' + (cx - 24) + ',' + (cy - 18) + ' M' + (cx + 8) + ',' + (cy - 14) + ' Q' + (cx + 20) + ',' + (cy - 28) + ' ' + (cx + 24) + ',' + (cy - 18), 'class': 'gbr-ln-acc' }, sv);
    S('circle', { cx: cx - 24, cy: cy - 17, r: 3, 'class': 'gbr-gold' }, sv); S('circle', { cx: cx + 24, cy: cy - 17, r: 3, 'class': 'gbr-gold' }, sv);
    Tx(sv, cx, cy + 42, 'Folly', 'gbr-big');
    ro.set(cur < 0 ? 'Folly speaks from the middle of the ring: everyone, she says, owes something to her. Tap a group to see what she says about them.' : '<b>' + T[cur][0] + '.</b> ' + T[cur][1] + ' <span class="gbr-mut">(Our summary. Erasmus is teasing, and Folly is not always to be believed.)</span>');
  }
  draw();
});
