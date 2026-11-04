/* gbmiddle.chaucer-troilus (gbe4, our own designs).
   gb-fortune-wheel  the medieval wheel of Fortune (an image Chaucer took from Boethius) turning through the five books
                     of Troilus and Criseyde: Troilus rises to the top in Book III and falls in Books IV and V.
                     opts: book: 1..5. Plot summaries are our own, written for families.
   gb-rhyme-royal    the seven-line stanza Chaucer used (ABABBCC), shown on the poem's first stanza (Middle English,
                     public domain), with the rhyme sounds colored. */
(function () {
  var V = ML.viz; if (!V) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math;
  function s(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var BOOKS = [
    ['Book I', 'Rising', 'Troilus, a proud prince of Troy who laughed at lovers, sees Criseyde at a temple feast and falls in love. He tells no one, until his friend Pandarus, who is Criseyde\'s uncle, gets the secret out of him and promises to help.'],
    ['Book II', 'Rising', 'Pandarus visits Criseyde and tells her of Troilus. She thinks it over carefully. When she sees Troilus ride home from battle, cheered by the crowd, she begins to care for him.'],
    ['Book III', 'At the top', 'With Pandarus\'s help the two meet and promise to love each other faithfully. Troilus is happier than ever, kinder to everyone, and braver in battle. He is at the top of Fortune\'s wheel.'],
    ['Book IV', 'Falling', 'Criseyde\'s father, Calchas, has gone over to the Greeks. Troy agrees to trade her for a captured Trojan, Antenor. The two lovers are heartbroken; Criseyde promises to come back within ten days.'],
    ['Book V', 'At the bottom', 'In the Greek camp Criseyde is lonely and afraid, and a Greek named Diomede courts her. She does not come back. Troilus waits on the walls, learns she has given her heart to Diomede, and at last is killed in battle. His spirit rises to the heavens, looks down at the little Earth, and sees how small its troubles were.']
  ];
  var ANG = [200, 245, 270, 320, 90];
  V.register('gb-fortune-wheel', function (el, o) {
    o = o || {};
    var b = Math.max(1, Math.min(5, +o.book || 1)) - 1;
    var wrap = h('div', 'gb-fwh'); el.appendChild(wrap);
    var svg = s('svg', { viewBox: '0 0 320 320', role: 'img' }); wrap.appendChild(svg);
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Book', min: 1, max: 5, step: 1, value: b + 1, fmt: function (v) { return ['I', 'II', 'III', 'IV', 'V'][v - 1]; }, input: function (v) { b = v - 1; draw(); } });
    var out = V.readout(el);
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var cx = 160, cy = 168, r = 112, rot = (b * 22) * M.PI / 180;
      svg.setAttribute('aria-label', 'The wheel of Fortune in ' + BOOKS[b][0] + ': Troilus is ' + BOOKS[b][1].toLowerCase() + '.');
      svg.appendChild(s('rect', { x: cx - 8, y: cy, width: 16, height: 140, 'class': 'gb-fwh-post' }));
      svg.appendChild(s('circle', { cx: cx, cy: cy, r: r, 'class': 'gb-fwh-rim' }));
      svg.appendChild(s('circle', { cx: cx, cy: cy, r: r - 12, 'class': 'gb-fwh-in' }));
      for (var i = 0; i < 8; i++) { var a = rot + i * M.PI / 4; svg.appendChild(s('line', { x1: cx, y1: cy, x2: (cx + (r - 6) * M.cos(a)).toFixed(1), y2: (cy + (r - 6) * M.sin(a)).toFixed(1), 'class': 'gb-fwh-spoke' })); }
      svg.appendChild(s('circle', { cx: cx, cy: cy, r: 14, 'class': 'gb-fwh-hub' }));
      svg.appendChild(s('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'class': 'gb-fwh-f' }, 'Fortune'));
      [['top', 270, 'at the top'], ['right', 0, 'falling'], ['bottom', 90, 'at the bottom'], ['left', 180, 'rising']].forEach(function (p) {
        var a = p[1] * M.PI / 180, x = cx + (r + 16) * M.cos(a), y = cy + (r + 16) * M.sin(a) + 4;
        svg.appendChild(s('text', { x: (p[0] === 'bottom' ? x + 14 : p[0] === 'top' ? x + 26 : x).toFixed(1), y: (p[0] === 'top' ? y + 6 : p[0] === 'bottom' ? y + 2 : y).toFixed(1), 'text-anchor': p[0] === 'right' ? 'start' : p[0] === 'left' ? 'end' : 'start', 'class': 'gb-fwh-lab' }, p[2]));
      });
      var a = ANG[b] * M.PI / 180, fx = cx + r * M.cos(a), fy = cy + r * M.sin(a), g = s('g', { transform: 'translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ')' });
      var up = b < 4;
      g.appendChild(s('path', { d: up ? 'M-8 0 L-6 -18 Q0 -22 6 -18 L8 0 Z' : 'M-8 0 L-6 14 Q0 18 6 14 L8 0 Z', 'class': 'gb-fwh-robe' }));
      g.appendChild(s('circle', { cx: 0, cy: up ? -26 : 22, r: 7, fill: '#ffcc4d', stroke: '#e8a93a', 'stroke-width': 2 }));
      if (b === 2) g.appendChild(s('path', { d: 'M-7 -32 L-7 -38 L-3.5 -35 L0 -40 L3.5 -35 L7 -38 L7 -32 Z', 'class': 'gb-fwh-crown' }));
      svg.appendChild(g);
      svg.appendChild(s('text', { x: fx + (fx > cx + 5 ? 14 : -14), y: fy + (b === 2 ? -22 : 4), 'text-anchor': fx > cx + 5 ? 'start' : 'end', 'class': 'gb-fwh-name' }, 'Troilus'));
      out.set('<b>' + BOOKS[b][0] + ': ' + BOOKS[b][1] + '.</b> ' + BOOKS[b][2]);
    }
    draw();
  });

  var ST = [['The double sorwe of Troilus to ', 'tellen', 'A'], ['That was the king Priamus sone of ', 'Troye', 'B'], ['In lovinge, how his aventures ', 'fellen', 'A'],
    ['Fro wo to wele, and after out of ', 'Ioye', 'B'], ['My purpos is, er that I parte fro ', 'ye', 'B'], ['Thesiphone, thou help me for ', 'tendyte', 'C'], ['Thise woful vers, that wepen as I ', 'wryte!', 'C']];
  var GL = ['double sorrow: twofold grief', 'Priamus sone: King Priam\'s son', 'aventures fellen: fortunes went', 'wo to wele: woe to weal (happiness); Ioye: joy', 'er: before; fro ye: from you', 'Thesiphone: one of the Furies of Greek myth; tendyte: to write', 'wepen: weep'];
  V.register('gb-rhyme-royal', function (el) {
    var gl = false, box = h('div', 'gb-rr'); el.appendChild(box);
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Show', items: [['p', 'Rhyme pattern'], ['g', 'Word help']], value: 'p', change: function (v) { gl = v === 'g'; draw(); } });
    var out = V.readout(el);
    function draw() {
      box.innerHTML = ST.map(function (l, i) {
        return '<div class="gb-rr-l"><span class="gb-rr-n">' + (i + 1) + '</span><span class="gb-rr-t">' + l[0] + '<b class="gb-rr-' + l[2] + '">' + l[1] + '</b>' + (gl ? '<small>' + GL[i] + '</small>' : '') + '</span><span class="gb-rr-k gb-rr-' + l[2] + '">' + l[2] + '</span></div>';
      }).join('');
      out.set('Seven lines rhyming <b>A B A B B C C</b>: the stanza later called <b>rhyme royal</b>. Most lines have ten syllables, with the beat on every second one. The whole poem has nearly 1,200 of these stanzas.');
    }
    draw();
  });
})();
