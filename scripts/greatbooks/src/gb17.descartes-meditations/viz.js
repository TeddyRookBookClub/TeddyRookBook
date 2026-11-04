/* gb17.descartes-meditations: visuals (gbw2, our own design). */
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
/* gb-doubt: six days of the Meditations as a wall of beliefs knocked down and rebuilt on one foundation stone. */
ML.viz.register('gb-doubt', function (el, opts, V) {
  var F = frame(el, 400, 240, 'The Meditations: beliefs doubted and rebuilt, day by day'), sv = F.svg, ro = V.readout(el);
  // blocks: [label, row, col, doubted on day, rebuilt on day]  (row 0 = bottom)
  var BL = [['I exist', 0, 1, 99, 2], ['I am a thinking thing', 1, 1, 99, 2], ['God exists, no deceiver', 2, 1, 99, 3], ['clear and distinct ideas', 3, 1, 99, 4], ['geometry, extension', 4, 1, 1, 5], ['my senses', 1, 0, 1, 6], ['my body', 2, 0, 1, 6], ['the world around me', 3, 0, 1, 6], ['I am awake', 1, 2, 1, 6], ['2 + 3 = 5', 2, 2, 1, 5]];
  var D = [
    ['Day I', 'Doubt everything that could possibly be false: the senses, being awake, even arithmetic, with the help of an imagined deceiving demon. Everything falls.'],
    ['Day II', '<b>I am, I exist</b>: even a deceiver cannot make me nothing while I think. I am a thinking thing. The wax shows that the mind, not the senses, grasps what bodies are.'],
    ['Day III', 'The idea of an infinite, perfect being must come from such a being: <b>God exists</b>, and a perfect God is no deceiver.'],
    ['Day IV', 'Error comes when the will outruns the understanding. Trust <b>clear and distinct</b> ideas, and hold back judgment on the rest.'],
    ['Day V', 'The essence of bodies is <b>extension</b>, the subject of geometry. Mathematics is certain again. A second proof of God.'],
    ['Day VI', 'Mind and body are distinct but closely joined. <b>Bodies exist</b>; the senses are a fair guide to what helps or harms us; waking life hangs together as dreams do not.']
  ];
  var day = opts.day || 1;
  function draw() {
    clear(sv);
    S('rect', { x: 10, y: 214, width: 380, height: 10, rx: 3, 'class': 'gbw-box' }, sv);
    BL.forEach(function (b) {
      var up = day >= b[4], w = 118, x = 14 + b[2] * 125, y = 182 - b[1] * 34;
      if (!up && b[3] > day) return; // not built yet
      if (!up) { // doubted: a faint dashed outline, struck through
        S('rect', { x: x, y: y, width: w, height: 30, rx: 5, 'class': 'gbw-doubt' }, sv);
        Tx(sv, x + w / 2, y + 19, b[0], 'sm mut');
        S('line', { x1: x + 10, y1: y + 15, x2: x + w - 10, y2: y + 15, 'class': 'gbw-strike' }, sv);
        return;
      }
      var fresh = day === b[4];
      S('rect', { x: x, y: y, width: w, height: 30, rx: 5, 'class': fresh ? 'gbw-on' : 'gbw-box' }, sv);
      Tx(sv, x + w / 2, y + 19, b[0], b[1] === 0 ? 'sm b' : 'sm');
    });
    Tx(sv, 200, 14, D[day - 1][0], 'b serif');
    ro.set('<b>' + D[day - 1][0] + '.</b> ' + D[day - 1][1]);
  }
  V.seg(F.ctl, { label: 'Meditation', items: D.map(function (d, i) { return [i + 1, d[0]]; }), value: day, change: function (v) { day = +v; draw(); } });
  draw();
});
