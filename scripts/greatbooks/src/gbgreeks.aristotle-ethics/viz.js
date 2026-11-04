/* gbgreeks.aristotle-ethics: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-golden-mean: virtue as a mean between two vices (Nicomachean Ethics II.6-9). The mean is not always the exact
   middle (II.8), and it is "relative to us" (II.6: the wrestler Milo and the beginner). */
ML.viz.register('gb-golden-mean', function (el, opts, V) {
  var F = frame(el, 400, 200, 'The golden mean: a virtue between too little and too much'), sv = F.svg, ro = V.readout(el);
  var A = {
    fear: { n: 'Facing danger', lo: 'Cowardice', mid: 'Courage', hi: 'Rashness', m: 0.58, t: 'Courage is nearer to rashness than to cowardice, Aristotle says, so cowardice is its real opposite.' },
    money: { n: 'Giving money', lo: 'Stinginess', mid: 'Generosity', hi: 'Wastefulness', m: 0.56, t: 'The generous person gives the right amount, to the right people, at the right time.' },
    anger: { n: 'Anger', lo: 'Never angry', mid: 'Good temper', hi: 'Hot temper', m: 0.45, t: 'Aristotle thinks it right to be angry at real wrongs, in the right way and for the right length of time.' },
    self: { n: 'Talking about yourself', lo: 'False modesty', mid: 'Truthfulness', hi: 'Boasting', m: 0.5, t: 'The truthful person claims neither more nor less than is true about himself.' },
    fun: { n: 'Jokes and fun', lo: 'Dullness', mid: 'Wit', hi: 'Clowning', m: 0.5, t: 'The witty person jokes with taste; the clown will do anything for a laugh; the dull person never laughs at all.' },
    food: { n: 'The mean for you', food: true }
  };
  var cur = opts.area || 'fear', v = opts.v == null ? 0.3 : opts.v, who = 'new';
  function draw() {
    clear(sv);
    var a = A[cur], x0 = 30, W = 340;
    if (a.food) {
      var pounds = 2 + v * 8, best = who === 'milo' ? 8 : 3.5, lo = best - 1, hi = best + 1;
      S('rect', { x: x0, y: 70, width: W, height: 26, rx: 13, 'class': 'gbe-box' }, sv);
      S('rect', { x: x0 + (lo - 2) / 8 * W, y: 70, width: 2 / 8 * W, height: 26, rx: 13, 'class': 'gbe-box-on' }, sv);
      S('line', { x1: x0 + 0.5 * W, y1: 60, x2: x0 + 0.5 * W, y2: 106, 'class': 'gbe-arrow', 'stroke-dasharray': '4 4' }, sv);
      Tx(sv, x0 + 0.5 * W, 122, 'halfway: 6 lb', 'sm mut');
      S('circle', { cx: x0 + v * W, cy: 83, r: 11, 'class': 'gbe-box-gold' }, sv);
      Tx(sv, x0, 50, '2 lb: too little', 'sm mut', 'start'); Tx(sv, x0 + W, 50, '10 lb: too much', 'sm mut', 'end');
      Tx(sv, 200, 160, V.fmt(pounds, 1) + ' lb of food for ' + (who === 'milo' ? 'Milo the wrestler' : 'a beginner'), 'b');
      var ok = pounds >= lo && pounds <= hi;
      Tx(sv, 200, 184, ok ? 'About right for this person' : (pounds < lo ? 'Too little for this person' : 'Too much for this person'), 'b ' + (ok ? 'gbe-tf' : 'gbe-tg'));
      ro.set('Aristotle\'s example: if 10 pounds of food is too much and 2 too little, the trainer will not simply order 6. That might be too little for Milo, a famous wrestler, and too much for a beginner. The mean is <b>relative to us</b>. (The green band is our own rough guess, to show the idea.)');
      return;
    }
    S('rect', { x: x0, y: 70, width: W, height: 26, rx: 13, 'class': 'gbe-box' }, sv);
    S('rect', { x: x0 + (a.m - 0.12) * W, y: 70, width: 0.24 * W, height: 26, rx: 13, 'class': 'gbe-box-on' }, sv);
    S('circle', { cx: x0 + v * W, cy: 83, r: 11, 'class': 'gbe-box-gold' }, sv);
    Tx(sv, x0, 124, a.lo, 'b gbe-tg', 'start'); Tx(sv, x0 + a.m * W, 124, a.mid, 'b gbe-tf'); Tx(sv, x0 + W, 124, a.hi, 'b gbe-tg', 'end');
    Tx(sv, x0, 50, 'too little', 'sm mut', 'start'); Tx(sv, x0 + W, 50, 'too much', 'sm mut', 'end'); Tx(sv, 200, 30, a.n, 'b lg');
    var d = v - a.m, word = Math.abs(d) <= 0.12 ? a.mid : (d < 0 ? a.lo : a.hi);
    Tx(sv, 200, 168, 'Here: ' + word, 'b ' + (word === a.mid ? 'gbe-tf' : 'gbe-tg'));
    ro.set('<b>' + a.mid + '</b> lies between <b>' + a.lo.toLowerCase() + '</b> and <b>' + a.hi.toLowerCase() + '</b>. ' + a.t);
  }
  var whoSeg = null;
  V.seg(F.ctl, { label: 'Area of life', items: Object.keys(A).map(function (k) { return [k, A[k].n]; }), value: cur, change: function (x) { cur = x; whoSeg.el.style.display = A[cur].food ? '' : 'none'; draw(); } });
  V.slider(F.ctl, { label: 'How much', min: 0, max: 1, step: 0.01, value: v, fmt: function (x) { return Math.round(x * 100) + '%'; }, input: function (x) { v = x; draw(); } });
  whoSeg = V.seg(F.ctl, { label: 'Whose meal', items: [['new', 'A beginner'], ['milo', 'Milo']], value: who, change: function (x) { who = x; draw(); } });
  whoSeg.el.style.display = A[cur].food ? '' : 'none';
  draw();
});
