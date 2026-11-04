/* gbgreeks.plato-meno: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-meno-square: the geometry lesson in the Meno (82b-85b). Doubling a square of side 2: the boy's two wrong guesses,
   then the square on the diagonal. */
ML.viz.register('gb-meno-square', function (el, opts, V) {
  var F = frame(el, 400, 256, 'Doubling the square, step by step, as in the Meno'), sv = F.svg, ro = V.readout(el);
  var u = 50, ox = 100, oy = 20, step = opts.step || 0;
  var TXT = [
    'Socrates draws a square with sides of <b>2 feet</b>. Its area is $2 \\times 2 = 4$ square feet. He asks the boy: how long is the side of a square <b>twice</b> as big, 8 square feet?',
    'The boy\'s first guess: <b>double the side</b>, to 4 feet. But that square holds four copies of the first one: $4 \\times 4 = 16$ square feet, four times as big, not twice.',
    'Second guess: a side of <b>3 feet</b>, between 2 and 4. That gives $3 \\times 3 = 9$, still not 8. Now the boy admits he does not know, and Socrates says he is better off than when he thought he knew.',
    'Socrates draws a line from corner to corner across each of the four small squares. The four <b>diagonals</b> make a new square, tilted on its point.',
    'Each diagonal cuts a small square in half. The tilted square holds four halves, $4 \\times 2 = 8$ square feet: exactly <b>double</b>. The answer is the square on the <b>diagonal</b> of the first square.'
  ];
  function grid(n) { for (var i = 0; i <= n; i++) { S('line', { x1: ox + i * u, y1: oy, x2: ox + i * u, y2: oy + n * u, 'class': 'gbe-line', 'stroke-width': 0.7 }, sv); S('line', { x1: ox, y1: oy + i * u, x2: ox + n * u, y2: oy + i * u, 'class': 'gbe-line', 'stroke-width': 0.7 }, sv); } }
  function sq(x, y, s, cls) { return S('rect', { x: ox + x * u / 2, y: oy + y * u / 2, width: s * u / 2, height: s * u / 2, 'class': cls }, sv); }
  function draw() {
    clear(sv); grid(4);
    if (step === 1) { sq(0, 0, 8, 'gbe-box-red'); [[0, 0], [4, 0], [0, 4], [4, 4]].forEach(function (p) { sq(p[0], p[1], 4, 'gbe-ink'); }); Tx(sv, ox + 2 * u, 246, 'side 4: area 16', 'b gbe-tg'); }
    if (step === 2) { sq(0, 0, 6, 'gbe-box-red'); Tx(sv, ox + 2 * u, 246, 'side 3: area 9', 'b gbe-tg'); }
    if (step >= 3) {
      [[0, 0], [4, 0], [0, 4], [4, 4]].forEach(function (p) { sq(p[0], p[1], 4, 'gbe-ink'); });
      var c = function (x, y) { return (ox + x * u / 2) + ',' + (oy + y * u / 2); };
      S('polygon', { points: [c(4, 0), c(8, 4), c(4, 8), c(0, 4)].join(' '), 'class': step === 4 ? 'gbe-box-on' : 'gbe-ink' }, sv);
      Tx(sv, ox + 2 * u, 246, step === 4 ? 'square on the diagonal: area 8' : 'four diagonals', 'b gbe-tf');
    }
    sq(0, 0, 4, step >= 3 ? 'gbe-box-gold' : 'gbe-box-gold'); Tx(sv, ox + 2 * u / 2, oy + 2 * u / 2 + 5, 'area 4', 'b');
    if (step === 0) Tx(sv, ox + 2 * u, 246, 'side 2: area 4', 'b');
    ro.set('<b>Step ' + (step + 1) + ' of 5.</b> ' + TXT[step]);
  }
  var back = V.button(F.ctl, '◀ Back', function () { if (step > 0) { step--; draw(); } });
  var next = V.button(F.ctl, 'Next ▶', function () { if (step < 4) { step++; draw(); } });
  V.button(F.ctl, 'Start over', function () { step = 0; draw(); });
  draw();
});
