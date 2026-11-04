/* gb-scales: Montaigne's balance. In 1576 he had a medal made with a pair of scales and his motto "Que sais-je?" ("What do I know?").
   Pick a question, add reasons to each pan, and watch the beam. Questions and reasons are our own, in the spirit of the Essays. */
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
ML.viz.register('gb-scales', function (el, opts, V) {
  var Q = [
    ['Are animals cleverer than we think?', ['A cat can play a game with you and seem to enjoy it.', 'Birds build nests and travel thousands of miles without a map.', 'Dogs read our moods.'], ['People write books, build bridges and do mathematics.', 'Animals mostly follow habit and instinct.', 'We cannot ask an animal what it is thinking.']],
    ['Are faraway customs strange, or only different?', ['Every land thinks its own ways are the natural ones.', 'Our customs would seem odd to a visitor too.', 'Many "strange" customs have good reasons behind them.'], ['Some customs really are cruel and should be judged.', 'Not all ways of living are equally good.', 'We need some standard to judge by.']],
    ['Is it better to learn many facts, or to learn to think?', ['A full memory without judgment is like a stuffed sack.', 'Knowing how to weigh a question lasts a lifetime.', 'Facts change; good judgment travels.'], ['You cannot think well about something you know nothing about.', 'Facts are the bricks thinking builds with.', 'Some things simply must be memorized.']]
  ];
  var F = frame(el, 400, 250, 'A balance with reasons on each side'), sv = F.svg, ro = V.readout(el), qi = 0, L = 0, Rr = 0, sel;
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 250, 'class': 'gbr-bg' }, sv);
    var d = Math.max(-3, Math.min(3, Rr - L)), ang = d * 6, cx = 200, cy = 70, arm = 120;
    var rad = ang * Math.PI / 180, lx = cx - arm * Math.cos(rad), ly = cy - arm * Math.sin(rad), rx = cx + arm * Math.cos(rad), ry = cy + arm * Math.sin(rad);
    S('path', { d: 'M' + (cx - 40) + ',236 L' + (cx + 40) + ',236 L' + (cx + 8) + ',220 L' + (cx + 4) + ',' + cy + ' L' + (cx - 4) + ',' + cy + ' L' + (cx - 8) + ',220 Z', 'class': 'gbr-gold' }, sv);
    S('line', { x1: lx, y1: ly, x2: rx, y2: ry, 'class': 'gbr-ln-acc' }, sv);
    S('circle', { cx: cx, cy: cy, r: 6, 'class': 'gbr-gold' }, sv);
    [[lx, ly, L, 'Yes'], [rx, ry, Rr, 'No']].forEach(function (p) {
      S('line', { x1: p[0], y1: p[1], x2: p[0] - 34, y2: p[1] + 70, 'class': 'gbr-ln' }, sv); S('line', { x1: p[0], y1: p[1], x2: p[0] + 34, y2: p[1] + 70, 'class': 'gbr-ln' }, sv);
      S('path', { d: 'M' + (p[0] - 44) + ',' + (p[1] + 70) + ' Q' + p[0] + ',' + (p[1] + 104) + ' ' + (p[0] + 44) + ',' + (p[1] + 70) + ' Z', 'class': 'gbr-f0 gbr-sec' }, sv);
      for (var k = 0; k < p[2]; k++) S('rect', { x: p[0] - 30 + k * 21, y: p[1] + 58, width: 18, height: 12, rx: 2, 'class': 'gbr-f2' }, sv);
      Tx(sv, p[0], p[1] + 98, p[3] + ' (' + p[2] + ')', 'gbr-b');
    });
    Tx(sv, 200, 24, Q[qi][0], 'gbr-h');
    var msg = L === 0 && Rr === 0 ? 'Add a reason to either side. Montaigne liked to weigh both sides of a question before (or instead of) deciding.' : '';
    if (L || Rr) msg = (L ? '<b>Yes:</b> ' + Q[qi][1].slice(0, L).join(' ') + ' ' : '') + (Rr ? '<b>No:</b> ' + Q[qi][2].slice(0, Rr).join(' ') + ' ' : '') + (L === Rr ? ' <b>The beam is level.</b> Montaigne would smile and ask, "What do I know?" (in French, <i>Que sais-je?</i>), and keep thinking.' : (L > Rr ? ' The beam tips toward yes, for now.' : ' The beam tips toward no, for now.'));
    ro.set(msg);
  }
  sel = V.seg(F.ctl, { label: 'Question', items: Q.map(function (q, i) { return [i, ['Animals', 'Customs', 'Learning'][i]]; }), value: 0, change: function (v) { qi = +v; L = 0; Rr = 0; draw(); } });
  V.button(F.ctl, 'Add a "yes" reason', function () { if (L < 3) L++; draw(); });
  V.button(F.ctl, 'Add a "no" reason', function () { if (Rr < 3) Rr++; draw(); });
  V.button(F.ctl, 'Empty the pans', function () { L = 0; Rr = 0; draw(); });
  draw();
});
