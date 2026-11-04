/* gbgreeks.plato-theaetetus: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-wax-tablet: Socrates' picture of memory as a block of wax (Theaetetus 191c-195a). Our own simplified model. */
ML.viz.register('gb-wax-tablet', function (el, opts, V) {
  var F = frame(el, 400, 220, 'Memory as a wax tablet: stamp an impression and watch how well it lasts'), sv = F.svg, ro = V.readout(el);
  var W = {
    good: { n: 'Deep and smooth', d: 1, blur: 0, fade: 0.05, size: 1, txt: 'Deep, smooth, well-mixed wax takes clear marks that last. Socrates says such people learn easily, remember well, and judge truly.' },
    soft: { n: 'Too soft', d: 1, blur: 1.6, fade: 0.5, size: 1, txt: 'Soft wax takes a mark quickly, but the mark soon blurs: quick to learn, quick to forget.' },
    hard: { n: 'Too hard', d: 0.45, blur: 0, fade: 0.03, size: 1, txt: 'Hard wax takes only a shallow mark, though what it takes it keeps: slow to learn, slow to forget.' },
    rough: { n: 'Rough and impure', d: 0.8, blur: 1, fade: 0.15, size: 1, txt: 'Rough or impure wax gives smudged marks, so the person mixes up one memory with another.' },
    small: { n: 'Too small', d: 1, blur: 0, fade: 0.05, size: 0.55, txt: 'A small tablet has no room: the marks crowd and overlap, and the person confuses them.' }
  };
  var kind = opts.kind || 'good', marks = [], t = 0, fid = V.uid('gbe-blur');
  function draw() {
    clear(sv);
    var w = W[kind], defs = S('defs', {}, sv), f = S('filter', { id: fid, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    S('feGaussianBlur', { stdDeviation: w.blur + (kind === 'soft' ? t * 0.35 : 0) }, f);
    var tw = 340 * w.size, th = 150 * w.size, tx = 200 - tw / 2, ty = 20 + (150 - th) / 2;
    S('rect', { x: tx - 10, y: ty - 10, width: tw + 20, height: th + 20, rx: 8, 'class': 'gbe-stone' }, sv);
    S('rect', { x: tx, y: ty, width: tw, height: th, rx: 4, 'class': 'gbe-box-gold' }, sv);
    marks.forEach(function (m, i) {
      var op = Math.max(0, w.d * Math.exp(-w.fade * (t - m.t))), cx = tx + m.x * tw, cy = ty + m.y * th, r = 26;
      var g = S('g', { opacity: op.toFixed(3), filter: w.blur || kind === 'soft' ? 'url(#' + fid + ')' : '' }, sv);
      S('circle', { cx: cx, cy: cy, r: r, 'class': 'gbe-ink', 'stroke-width': 3 }, g);
      Tx(g, cx, cy + 8, m.s, 'b lg');
    });
    Tx(sv, 200, 212, marks.length ? 'Time passed: ' + t + (t === 1 ? ' day' : ' days') : 'Press "Stamp a memory"', 'sm mut');
    ro.set('<b>' + w.n + '.</b> ' + w.txt);
  }
  var SY = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Θ', 'Λ', 'Σ', 'Ω'];
  V.seg(F.ctl, { label: 'Kind of wax', items: Object.keys(W).map(function (k) { return [k, W[k].n]; }), value: kind, change: function (v) { kind = v; seed(); draw(); } });
  function stamp() { var i = marks.length; marks.push({ x: 0.15 + (i % 4) * 0.23 + (W[kind].size < 1 ? 0.05 : 0), y: i < 4 ? 0.32 : 0.72, s: SY[i % SY.length], t: t }); if (marks.length > 8) marks.shift(); }
  function seed() { marks = []; t = 0; stamp(); stamp(); stamp(); }
  V.button(F.ctl, 'Stamp a memory', function () { stamp(); draw(); });
  V.button(F.ctl, 'Let a day pass', function () { t++; draw(); });
  seed(); draw();
});
