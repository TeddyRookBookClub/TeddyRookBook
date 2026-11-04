/* gbgreeks.aristotle-metaphysics: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-potential: potentiality and actuality (Metaphysics IX), with the four causes for each example (Metaphysics I and V). */
ML.viz.register('gb-potential', function (el, opts, V) {
  var F = frame(el, 400, 230, 'From what something can be to what it is: an acorn, a lump of clay, a pile of bricks'), sv = F.svg, ro = V.readout(el);
  var X = {
    oak: { n: 'Acorn → oak', a: 'an acorn', b: 'an oak', c: ['the stuff of the seed, then wood', 'the form of an oak tree', 'the parent oak that dropped the acorn', 'to be a full-grown oak'] },
    bowl: { n: 'Clay → bowl', a: 'a lump of clay', b: 'a bowl', c: ['clay', 'the shape of a bowl', 'the potter', 'to hold food or water'] },
    house: { n: 'Bricks → house', a: 'a pile of bricks', b: 'a house', c: ['bricks and timber', 'the plan of a house', 'the builder', 'shelter for people and their things'] }
  };
  var cur = opts.ex || 'oak', p = opts.p == null ? 0.35 : opts.p;
  var BR = []; for (var i = 0; i < 12; i++) BR.push({ x0: 150 + (i % 5) * 22 + (i > 4 ? 11 : 0) + (i > 8 ? 11 : 0), y0: 192 - Math.floor(i / 5) * 11, x1: 160 + (i % 4) * 22, y1: 182 - Math.floor(i / 4) * 22 });
  function draw() {
    clear(sv);
    S('line', { x1: 30, y1: 202, x2: 370, y2: 202, 'class': 'gbe-line' }, sv);
    if (cur === 'oak') {
      if (p < 0.12) { S('ellipse', { cx: 200, cy: 192, rx: 9, ry: 11, 'class': 'gbe-gold' }, sv); S('path', { d: 'M190,186 q10,-10 20,0 z', 'class': 'gbe-mutf' }, sv); }
      else { var h = 20 + p * 120, r = 8 + p * 58; S('rect', { x: 200 - (3 + p * 8), y: 202 - h, width: 6 + p * 16, height: h, rx: 3, 'class': 'gbe-mutf' }, sv); S('circle', { cx: 200, cy: 202 - h - r * 0.55, r: r, 'class': 'gbe-g', opacity: 0.75 }, sv); }
    } else if (cur === 'bowl') {
      S('ellipse', { cx: 200, cy: 202 - 22 * (1 - p), rx: 30 + 4 * p, ry: 22 * (1 - p) + 2, 'class': 'gbe-stone', opacity: (1 - p).toFixed(2) }, sv);
      S('path', { d: 'M150,150 Q155,200 200,200 Q245,200 250,150 Z', 'class': 'gbe-box-gold', opacity: p.toFixed(2) }, sv);
    } else {
      BR.forEach(function (b) { var x = b.x0 + (b.x1 - b.x0) * p, y = b.y0 + (b.y1 - b.y0) * p; S('rect', { x: x, y: y, width: 20, height: p > 0.5 ? 20 : 10, rx: 2, 'class': 'gbe-box-red' }, sv); });
      if (p > 0.8) S('path', { d: 'M150,138 L204,98 L258,138 Z', 'class': 'gbe-box-gold', opacity: ((p - 0.8) * 5).toFixed(2) }, sv);
    }
    Tx(sv, 60, 30, 'can be', 'sm mut'); Tx(sv, 340, 30, 'is', 'sm mut');
    S('rect', { x: 60, y: 40, width: 280, height: 8, rx: 4, 'class': 'gbe-box' }, sv); S('rect', { x: 60, y: 40, width: 280 * p, height: 8, rx: 4, 'class': 'gbe-g' }, sv);
    var e = X[cur], word = p < 0.05 ? 'only potentially ' + e.b : (p > 0.97 ? 'actually ' + e.b : 'on the way to being ' + e.b);
    ro.set('Now it is <b>' + word + '</b>. ' + '<br>Its four causes: <b>material</b>, ' + e.c[0] + '; <b>formal</b>, ' + e.c[1] + '; <b>efficient</b> (the maker or mover), ' + e.c[2] + '; <b>final</b> (what it is for), ' + e.c[3] + '.');
  }
  V.seg(F.ctl, { label: 'Example', items: Object.keys(X).map(function (k) { return [k, X[k].n]; }), value: cur, change: function (v) { cur = v; draw(); } });
  V.slider(F.ctl, { label: 'From potential to actual', min: 0, max: 1, step: 0.01, value: p, fmt: function (v) { return Math.round(v * 100) + '%'; }, input: function (v) { p = v; draw(); } });
  draw();
});
