/* gb-frames: the boxes inside boxes of Don Quixote: who tells the story to whom. Our own diagram and summaries. */
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
ML.viz.register('gb-frames', function (el, opts, V) {
  var L = [
    ['You, the reader', 'You hold the book. In Part Two, Cervantes keeps reminding you that you are reading a story about people who read stories.'],
    ['Cervantes, the "second author"', 'The narrator says that in Part One, Chapter IX, he found the rest of the story in Arabic notebooks sold in the market of Toledo, and paid someone to translate them.'],
    ['The translator', 'A Spanish speaker of Arabic who turns the notebooks into Spanish, and who now and then adds his own doubts about a chapter.'],
    ['Cide Hamete Benengeli', 'The invented Arab historian who is supposed to have written the "true history." The narrator jokes that he may not be reliable.'],
    ['Don Quixote and Sancho', 'The knight and his squire themselves, living out the adventures.'],
    ['Readers inside the book', 'In Part Two, people they meet have read Part One: the student Sansón Carrasco, and a Duke and Duchess who play tricks on them because they know the story. The characters even hear of a false sequel by another author (published in 1614) and change their route to prove it wrong.']
  ];
  var F = frame(el, 400, 290, 'Nested boxes: who tells the story of Don Quixote'), sv = F.svg, ro = V.readout(el), cur = opts.layer == null ? 4 : opts.layer;
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 290, 'class': 'gbr-bg' }, sv);
    for (var i = 0; i < 5; i++) {
      var g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv), pad = i * 24;
      S('rect', { x: 8 + pad, y: 8 + pad, width: 384 - 2 * pad, height: 274 - 2 * pad, rx: 14, 'class': 'gbr-f' + i + ' gbr-sec' }, g);
      Tx(g, 20 + pad, 24 + pad, L[i][0], 'gbr-b', 'start');
      hit(g, L[i][0], (function (k) { return function () { cur = k; draw(); }; })(i));
    }
    person(sv, 176, 172, 1.1, 'gbr-stone'); person(sv, 222, 178, 1, 'gbr-cloth3');
    var gr = S('g', { 'class': cur === 5 ? 'gbr-on' : '' }, sv);
    S('rect', { x: 250, y: 196, width: 112, height: 34, rx: 8, 'class': 'gbr-card' }, gr); Tx(gr, 306, 211, 'readers of Part One,', 'gbr-m'); Tx(gr, 306, 224, 'inside Part Two', 'gbr-m');
    hit(gr, L[5][0], function () { cur = 5; draw(); });
    ro.set('<b>' + L[cur][0] + '.</b> ' + L[cur][1]);
  }
  V.seg(F.ctl, { label: 'Layer', items: L.map(function (l, i) { return [i, ['Reader', 'Cervantes', 'Translator', 'Cide Hamete', 'Knight and squire', 'Readers inside'][i]]; }), value: cur, change: function (v) { cur = +v; draw(); } });
  draw();
});
