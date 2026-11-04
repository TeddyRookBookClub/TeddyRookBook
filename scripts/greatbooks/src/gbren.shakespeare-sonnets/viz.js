/* gb-sonnet: the shape of a Shakespearean sonnet: three quatrains and a couplet, ABAB CDCD EFEF GG, with the rhymes colored.
   Text: Project Gutenberg #1041 (spelling as there). opts.n = 18 | 116. */
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
var SONS = {
  18: ['Shall I compare thee to a summer’s day?', 'Thou art more lovely and more temperate:', 'Rough winds do shake the darling buds of May,', 'And summer’s lease hath all too short a date:', 'Sometime too hot the eye of heaven shines,', 'And often is his gold complexion dimm’d,', 'And every fair from fair sometime declines,', 'By chance, or nature’s changing course untrimm’d:', 'But thy eternal summer shall not fade,', 'Nor lose possession of that fair thou ow’st,', 'Nor shall death brag thou wander’st in his shade,', 'When in eternal lines to time thou grow’st,', 'So long as men can breathe, or eyes can see,', 'So long lives this, and this gives life to thee.'],
  116: ['Let me not to the marriage of true minds', 'Admit impediments. Love is not love', 'Which alters when it alteration finds,', 'Or bends with the remover to remove:', 'O, no! it is an ever-fixed mark,', 'That looks on tempests and is never shaken;', 'It is the star to every wandering bark,', 'Whose worth’s unknown, although his height be taken.', 'Love’s not Time’s fool, though rosy lips and cheeks', 'Within his bending sickle’s compass come;', 'Love alters not with his brief hours and weeks,', 'But bears it out even to the edge of doom.', 'If this be error and upon me prov’d,', 'I never writ, nor no man ever lov’d.']
};
var PARTS = { 18: ['The question: should I compare you to a summer day? No: summer is too short and too changeable.', 'Even the sun is sometimes too hot or hidden by clouds, and every lovely thing fades.', 'The turn: but YOUR summer will not fade, because you will live on in these lines.', 'The couplet: as long as people read, this poem lives, and it keeps you alive.'],
  116: ['True love does not change when circumstances change.', 'It is like a fixed star that guides ships: its worth is beyond measuring.', 'Time can take away youth and beauty, but not love.', 'The couplet: if I am wrong about this, then I never wrote and no one ever loved.'] };
ML.viz.register('gb-sonnet', function (el, opts, V) {
  var n = SONS[opts.n] ? opts.n : 18, mode = 'rhyme';
  var box = document.createElement('div'); box.className = 'gbr gbr-lines'; el.appendChild(box);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el), SCH = 'ABABCDCDEFEFGG';
  function draw() {
    box.innerHTML = '';
    SONS[n].forEach(function (l, i) {
      if (i === 4 || i === 8 || i === 12) { var gp = document.createElement('div'); gp.className = 'gbr-gap'; box.appendChild(gp); }
      var r = document.createElement('div'); r.className = 'gbr-row';
      var c = SCH.charCodeAt(i) - 65, m = l.match(/^(.*?)([A-Za-z’'-]+)([^A-Za-z’'-]*)$/);
      var tail = mode === 'rhyme' ? '<b class="gbr-rw" style="border-color:' + ['#d9a520', '#3f9a6a', '#4f7fd1', '#c9654f', '#8e63c9', '#a39a3c', '#c95c95'][c] + '">' + m[2] + '</b>' + m[3] : m[2] + m[3];
      r.innerHTML = '<span class="gbr-n">' + (i + 1) + '</span>' + (mode === 'rhyme' ? '<span class="gbr-let gbr-r' + c + '">' + SCH[i] + '</span>' : '<span class="gbr-let gbr-r' + Math.min(3, Math.floor(i / 4)) + '">' + (i < 12 ? 'Q' + (Math.floor(i / 4) + 1) : 'C') + '</span>') + '<span>' + m[1] + tail + '</span>';
      box.appendChild(r);
    });
    ro.set(mode === 'rhyme' ? '<b>Sonnet ' + n + '.</b> Fourteen lines of iambic pentameter. Each group of four lines (a <b>quatrain</b>) has its own pair of rhymes, ABAB CDCD EFEF, and a rhyming <b>couplet</b>, GG, closes the poem: seven rhyme sounds in all.' : '<b>What each part says (our summary).</b> ' + PARTS[n].map(function (p, i) { return '<b>' + (i < 3 ? 'Q' + (i + 1) : 'Couplet') + ':</b> ' + p; }).join(' '));
  }
  V.seg(ctl, { label: 'Sonnet', items: [[18, 'Sonnet 18'], [116, 'Sonnet 116']], value: n, change: function (v) { n = +v; draw(); } });
  V.seg(ctl, { label: 'Show', items: [['rhyme', 'Rhymes'], ['parts', 'The four parts']], value: mode, change: function (v) { mode = v; draw(); } });
  draw();
});
