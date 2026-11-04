/* gb17.pascal-pensees: visuals (gbw2, our own design). */
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
/* gb-wager: Pascal's wager (Pensees 233) as an expected-value table. EV(bet) = p * reward - cost; EV(not) = 0.
   With an infinite reward, any chance above zero gives an infinite expected value, which is Pascal's point. */
ML.viz.register('gb-wager', function (el, opts, V) {
  var F = frame(el, 400, 190, 'Pascal\'s wager as a table of chances and payoffs'), sv = F.svg, ro = V.readout(el);
  var mode = opts.mode || 'inf', p = opts.p || 0.1, c = opts.c || 5, R = opts.R || 40;
  function draw() {
    clear(sv);
    var inf = mode === 'inf', ev = inf ? Infinity : p * R - c;
    // table
    var X = [10, 120, 260], Y = [10, 46, 92], W = [110, 140, 130];
    var head = ['', 'God is (chance ' + Math.round(p * 100) + '%)', 'God is not (' + Math.round((1 - p) * 100) + '%)'];
    var rows = [['Wager for', inf ? 'infinite gain' : '+' + R, '−' + c + ' (a finite life)'], ['Wager against', 'finite gain at most', '+0 (or small pleasures)']];
    for (var j = 0; j < 3; j++) { S('rect', { x: X[j], y: Y[0], width: W[j], height: 34, 'class': 'gbw-box' }, sv); Tx(sv, X[j] + W[j] / 2, Y[0] + 21, head[j], 'sm b'); }
    rows.forEach(function (r, i) { for (var j = 0; j < 3; j++) { S('rect', { x: X[j], y: Y[i + 1], width: W[j], height: 44, 'class': j === 0 ? 'gbw-box' : (i === 0 && j === 1 ? 'gbw-on' : 'gbw-box') }, sv); Tx(sv, X[j] + W[j] / 2, Y[i + 1] + 27, r[j], j === 0 ? 'sm b' : 'sm'); } });
    Tx(sv, 200, 160, 'Expected value of wagering that He is: ' + (inf ? '∞ (for any chance above zero)' : V.fmt(p, 2) + ' × ' + R + ' − ' + c + ' = ' + V.fmt(ev, 2)), 'sm b');
    Tx(sv, 200, 180, inf ? 'Pascal: an infinite prize outweighs any finite stake.' : (ev > 0 ? 'With this finite prize, betting still comes out ahead.' : 'With this finite prize, betting does not pay on average.'), 'sm mut');
    ro.set(inf ? 'As Pascal frames it, the reward if God is and you wagered for Him is an infinite happiness, while the stake is finite. So the expected value is infinite whenever the chance is above zero. Critics reply with the questions in “Going deeper”: which God, whether belief can be chosen, and whether such a bet is the right reason to believe.' : 'With a finite prize the answer depends on the numbers: betting pays on average only when chance × prize is larger than the stake. Move the sliders to find the break-even point.');
  }
  V.seg(F.ctl, { label: 'The prize if God is', items: [['inf', 'Infinite (Pascal)'], ['fin', 'Finite (test)']], value: mode, change: function (v) { mode = v; draw(); } });
  V.slider(F.ctl, { label: 'Chance that God is', min: 0.01, max: 0.99, step: 0.01, value: p, fmt: function (v) { return Math.round(v * 100) + '%'; }, input: function (v) { p = v; draw(); } });
  V.slider(F.ctl, { label: 'Stake (what you give up)', min: 1, max: 20, step: 1, value: c, fmt: function (v) { return String(v); }, input: function (v) { c = v; draw(); } });
  V.slider(F.ctl, { label: 'Finite prize', min: 10, max: 200, step: 5, value: R, fmt: function (v) { return String(v); }, input: function (v) { R = v; draw(); } });
  draw();
});
