/* gb17.milton-areopagitica-and-poems: visuals (gbw2, our own designs). */
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
/* gb-licensing: the path of a book under the 1643 Licensing Order versus Milton's proposal in Areopagitica (1644). */
ML.viz.register('gb-licensing', function (el, opts, V) {
  var F = frame(el, 400, 150, 'How a book reached readers: licensing before printing, or Milton\'s plan'), sv = F.svg, ro = V.readout(el);
  var mode = opts.mode || 'lic';
  function box(x, w, t1, t2, cls) { S('rect', { x: x, y: 50, width: w, height: 50, rx: 9, 'class': cls || 'gbw-box' }, sv); Tx(sv, x + w / 2, 72, t1, 'sm b'); if (t2) Tx(sv, x + w / 2, 88, t2, 'sm mut'); }
  function arrow(x1, x2) { S('path', { d: 'M' + x1 + ',75 L' + x2 + ',75 M' + (x2 - 6) + ',69 L' + x2 + ',75 L' + (x2 - 6) + ',81', 'class': 'gbw-hot' }, sv); }
  function draw() {
    clear(sv);
    if (mode === 'lic') {
      box(6, 80, 'Author', 'writes'); arrow(88, 104); box(106, 92, 'Licenser', 'approves or not', 'gbw-on'); arrow(200, 216); box(218, 80, 'Printer', 'prints'); arrow(300, 316); box(318, 76, 'Readers', '');
      S('path', { d: 'M152,100 L152,128', 'class': 'gbw-line', 'stroke-dasharray': '3 3' }, sv); Tx(sv, 152, 142, 'refused books are never printed', 'sm mut');
      Tx(sv, 200, 26, 'The Licensing Order of 1643', 'b serif');
      ro.set('Under the order of June 1643, an official licenser had to read and approve a book <b>before</b> it could be printed. A book he refused never reached readers at all.');
    } else {
      box(6, 96, 'Author', 'name on the book'); arrow(104, 122); box(124, 96, 'Printer', 'prints freely'); arrow(222, 240); box(242, 96, 'Readers', 'judge and argue');
      S('rect', { x: 344, y: 50, width: 50, height: 50, rx: 9, 'class': 'gbw-box gbw-off' }, sv); Tx(sv, 369, 72, 'Law', 'sm b'); Tx(sv, 369, 88, 'afterward', 'sm mut');
      S('path', { d: 'M340,75 L344,75', 'class': 'gbw-line' }, sv);
      Tx(sv, 200, 26, 'Milton\'s proposal in Areopagitica', 'b serif');
      Tx(sv, 200, 132, 'books found harmful may be punished after printing', 'sm mut');
      ro.set('Milton asks that books be printed without a licenser, with the author\'s and printer\'s names known. If a book proves harmful, the law can act <b>after</b> it appears. Readers meet good and bad ideas and learn to judge. He still excluded some writings from toleration; see the box below.');
    }
  }
  V.seg(F.ctl, { label: 'Show', items: [['lic', 'Licensing, 1643'], ['mil', 'Milton\'s plan']], value: mode, change: function (v) { mode = v; draw(); } });
  draw();
});

/* gb-sonnet: the rhyme scheme of Sonnet XIX (abbaabba cdecde), from its line-end words in the 1673 text. */
ML.viz.register('gb-sonnet', function (el, opts, V) {
  var F = frame(el, 400, 250, 'The rhyme scheme of Milton\'s Sonnet XIX'), sv = F.svg, ro = V.readout(el);
  var W = ['spent', 'wide', 'hide', 'bent', 'present', 'chide', "deny'd", 'prevent', 'need', 'best', 'State', 'speed', 'rest', 'waite'];
  var L = 'abbaabbacdecde';
  var cur = opts.pick == null ? -1 : opts.pick;
  function draw() {
    clear(sv);
    Tx(sv, 110, 16, 'Octave (lines 1–8)', 'sm b'); Tx(sv, 300, 16, 'Sestet (lines 9–14)', 'sm b');
    W.forEach(function (w, i) {
      var oct = i < 8, x = oct ? 30 : 220, y = 34 + (oct ? i : i - 8) * 26, on = cur >= 0 && L[i] === L[cur];
      var g = S('g', {}, sv);
      S('rect', { x: x, y: y, width: 160, height: 22, rx: 6, 'class': on ? 'gbw-on' : 'gbw-box' }, g);
      Tx(g, x + 12, y + 15, String(i + 1), 'sm mut', 'start');
      Tx(g, x + 34, y + 15, '…' + w, 'sm serif', 'start');
      Tx(g, x + 148, y + 15, L[i], 'b', 'end');
      clickable(g, 'Line ' + (i + 1) + ', ending ' + w + ', rhyme ' + L[i], function () { cur = i; draw(); });
    });
    S('path', { d: 'M196,40 L214,40 L214,236', 'class': 'gbw-line', 'stroke-dasharray': '3 3' }, sv);
    Tx(sv, 300, 210, 'the turn comes early, in line 8', 'sm mut');
    if (cur < 0) { ro.set('An Italian (Petrarchan) sonnet rhymes <b>abbaabba</b> in the first eight lines and here <b>cdecde</b> in the last six. Tap a line ending to see which lines rhyme with it.'); return; }
    var mates = []; for (var i = 0; i < 14; i++) if (L[i] === L[cur]) mates.push((i + 1) + ' (' + W[i] + ')');
    ro.set('Rhyme <b>' + L[cur] + '</b>: lines ' + mates.join(', ') + '. In the octave the poet asks his question; Patience begins to answer in the middle of line 8, and the sestet completes the answer.');
  }
  draw();
});
