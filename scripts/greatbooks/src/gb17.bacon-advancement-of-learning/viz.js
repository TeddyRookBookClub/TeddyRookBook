/* gb17.bacon-advancement-of-learning: visuals (gbw2, our own design). */
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
/* gb-bacon-map: Bacon's division of learning by the three powers of the mind (Advancement, Second Book). */
ML.viz.register('gb-bacon-map', function (el, opts, V) {
  var F = frame(el, 400, 250, 'Bacon\'s map of learning: memory, imagination and reason'), sv = F.svg, ro = V.readout(el);
  var B = [
    { pow: 'Memory', art: 'History', kids: [['Natural', 'the history of nature: creatures, the heavens, and the arts and trades'], ['Civil', 'the history of peoples and governments'], ['Church', 'the history of religion and the church'], ['Learning', 'the history of learning itself']], gap: 'Bacon said there was no proper history of the arts and trades, and no history of learning: who discovered what, and how.', young: 'What happened: the story of nature, of countries and of people.' },
    { pow: 'Imagination', art: 'Poesy', kids: [['Narrative', 'stories told in words, like epics and histories in verse'], ['Dramatic', 'stories acted on a stage'], ['Allegorical', 'stories with a hidden meaning, like fables']], gap: 'Bacon found no gap here: poetry was well supplied. He says poetry is free to join what nature keeps apart, and to part what nature joins.', young: 'Stories, poems and plays: things people imagine.' },
    { pow: 'Reason', art: 'Philosophy', kids: [['Divine', 'what reason alone can learn about God'], ['Natural', 'the causes of things, and the works they lead to'], ['Human', 'the body and mind, ethics, and life in society']], gap: 'Bacon said the art of discovery itself was missing: a method for finding new things, not just arguing about old ones. His Novum Organum (1620) tried to supply it.', young: 'Why things happen: science, mathematics and thinking about right and wrong.' }
  ];
  var cur = opts.pick == null ? -1 : opts.pick;
  function draw() {
    clear(sv);
    S('rect', { x: 140, y: 8, width: 120, height: 30, rx: 8, 'class': 'gbw-box' }, sv);
    Tx(sv, 200, 28, 'Human learning', 'b serif');
    B.forEach(function (b, i) {
      var x = 20 + i * 125, on = cur === i;
      S('path', { d: 'M200,38 C200,52 ' + (x + 55) + ',48 ' + (x + 55) + ',62', 'class': on ? 'gbw-hot' : 'gbw-line' }, sv);
      var g = S('g', {}, sv);
      S('rect', { x: x, y: 62, width: 110, height: 44, rx: 9, 'class': on ? 'gbw-on' : 'gbw-box' }, g);
      Tx(g, x + 55, 80, b.pow, 'sm mut');
      Tx(g, x + 55, 97, b.art, 'b');
      clickable(g, b.pow + ': ' + b.art, function () { cur = cur === i ? -1 : i; draw(); });
      if (on) {
        b.kids.forEach(function (k, j) {
          var y = 122 + j * 30;
          S('path', { d: 'M' + (x + 55) + ',106 L' + (x + 55) + ',' + (y + 12), 'class': 'gbw-line' }, sv);
          S('rect', { x: x + 8, y: y, width: 94, height: 24, rx: 6, 'class': 'gbw-box' }, sv);
          Tx(sv, x + 55, y + 16, k[0], 'sm b');
        });
      }
    });
    if (cur < 0) { Tx(sv, 200, 160, 'Tap a branch to open it.', 'mut'); ro.set('Bacon divides all learning by the three powers of the mind: <b>memory</b>, <b>imagination</b> and <b>reason</b>.'); return; }
    var b = B[cur];
    ro.set('<b>' + b.pow + ' → ' + b.art + '.</b> ' + (opts.young ? b.young : b.kids.map(function (k) { return '<b>' + k[0] + '</b>: ' + k[1]; }).join('; ') + '. <span style="color:var(--gb-gold)">Gap:</span> ' + b.gap));
  }
  draw();
});
