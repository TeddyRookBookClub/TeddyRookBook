/* gbgreeks.plato-symposium-phaedrus: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-diotima-ladder: the ascent to beauty that Socrates says he learned from Diotima (Symposium 210a-212a). Our own wording. */
ML.viz.register('gb-diotima-ladder', function (el, opts, V) {
  var F = frame(el, 400, 300, 'Diotima\'s ladder of beauty, from one beautiful thing up to beauty itself'), sv = F.svg, ro = V.readout(el);
  var R = [
    ['One beautiful person', 'It starts with admiring someone, the way anyone might. Diotima says this is the first step, not the last.'],
    ['Beauty in many people', 'The learner notices that beauty in one person is like beauty in another, and stops thinking only one person has it.'],
    ['Beauty of character', 'A good and wise mind is more beautiful than a handsome face. The learner begins to love goodness in people.'],
    ['Beautiful ways of life and laws', 'Then the beauty of good customs and fair laws: the way a whole city can be beautiful.'],
    ['Beautiful knowledge', 'Next, the beauty of the sciences and of understanding: seeing how much there is to know, and loving it.'],
    ['Beauty itself', 'At the top, beauty itself: not beautiful in one way and ugly in another, never growing or fading, the source of every beautiful thing below. Diotima says a life spent seeing it is the life most worth living.']
  ];
  var cur = opts.step == null ? 0 : opts.step;
  function draw() {
    clear(sv);
    var x1 = 70, x2 = 130, y0 = 280, gap = 44;
    S('line', { x1: x1, y1: 16, x2: x1, y2: 292, 'class': 'gbe-ink', 'stroke-width': 4 }, sv);
    S('line', { x1: x2, y1: 16, x2: x2, y2: 292, 'class': 'gbe-ink', 'stroke-width': 4 }, sv);
    R.forEach(function (r, i) {
      var y = y0 - i * gap, on = i === cur, done = i < cur, g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': 'Step ' + (i + 1) + ': ' + r[0] }, sv);
      S('rect', { x: x1 - 4, y: y - 5, width: x2 - x1 + 8, height: 10, rx: 3, 'class': on ? 'gbe-box-gold' : (done ? 'gbe-box-on' : 'gbe-box') }, g);
      S('rect', { x: 150, y: y - 15, width: 236, height: 30, rx: 8, 'class': on ? 'gbe-box-gold' : 'gbe-box' }, g);
      Tx(g, 160, y + 5, (i + 1) + '. ' + r[0], on ? 'b' : (done ? '' : 'mut'), 'start');
      function pick() { cur = i; draw(); }
      g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    if (cur === 5) S('circle', { cx: 100, cy: 30, r: 13, 'class': 'gbe-sun' }, sv);
    ro.set('<b>Step ' + (cur + 1) + ': ' + R[cur][0] + '.</b> ' + R[cur][1]);
  }
  V.button(F.ctl, 'Climb down', function () { if (cur > 0) { cur--; draw(); } });
  V.button(F.ctl, 'Climb up', function () { if (cur < 5) { cur++; draw(); } });
  draw();
});
