/* gbmiddle.chaucer-canterbury-tales (gbe4, our own design).
   gb-pilgrim-route  the pilgrims' road from the Tabard Inn in Southwark to Canterbury, about 56 miles, with the
                     places the Tales mention along the way. Drag the slider (or tap a place) to move the company of
                     riders; the readout says what happens there in the book. A simple schematic, not to exact scale.
                     opts: mile: 0..56. */
(function () {
  var V = ML.viz; if (!V) return;
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var P = [
    [0, 'Southwark', 'The Tabard Inn', 'About twenty-nine pilgrims meet at the Tabard Inn, across the Thames from London. The Host, Harry Bailly, proposes a game: each will tell tales on the way, and the best teller wins a supper. They draw straws, and the Knight goes first.', 0],
    [5, 'Deptford', 'Reeve\'s Prologue', 'After the Miller\'s and Reeve\'s quarrel begins, the Host points out where they are: "Lo, Deptford!" It is about half past seven in the morning.', -1],
    [6, 'Greenwich', 'Reeve\'s Prologue', 'The Host names Greenwich next, a town by the river.', 1],
    [30, 'Rochester', 'Monk\'s Prologue', 'The Host cries that Rochester is close by, and asks the Monk for a merry tale. The Monk tells a long string of sad stories instead, until the Knight stops him.', -1],
    [41, 'Sittingbourne', 'Wife of Bath\'s Prologue', 'Annoyed with the Friar, the Summoner promises to tell two or three stories about friars before they reach Sittingbourne.', 1],
    [50, 'Boughton under Blean', 'Canon\'s Yeoman\'s Prologue', 'Two riders gallop up and join the company: a Canon and his servant. The servant ends up telling how his master wasted years and money trying to make gold.', -1],
    [54, 'Harbledown', 'Manciple\'s Prologue', 'At a little village called "Bob-up-and-down" (thought to be Harbledown), the Cook is so sleepy he falls off his horse.', 1],
    [56, 'Canterbury', 'Parson\'s Prologue', 'The cathedral holds the shrine of Saint Thomas Becket, the archbishop killed there in 1170. Late in the afternoon the Parson gives the last tale, a sermon. The book ends before the pilgrims arrive.', -1]
  ];
  V.register('gb-pilgrim-route', function (el, o) {
    o = o || {};
    var mile = Math.max(0, Math.min(56, +o.mile || 0));
    var wrap = h('div', 'gb-pr'); el.appendChild(wrap);
    var svg = s('svg', { viewBox: '0 0 400 190', role: 'img', 'aria-label': 'A schematic map of the road from Southwark to Canterbury, about 56 miles, with the places the Canterbury Tales mention.' }); wrap.appendChild(svg);
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    var sl = V.slider(ctl, { label: 'Miles from the Tabard Inn (about)', min: 0, max: 56, step: 1, value: mile, input: function (v) { mile = v; draw(); } });
    var out = V.readout(el);
    /* not to scale: the places are spread evenly, and the slider's miles map between them */
    function U(m) { for (var i = 1; i < P.length; i++) if (m <= P[i][0]) return i - 1 + (m - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P.length - 1; }
    function X(m) { return 24 + U(m) * (348 / (P.length - 1)); }
    function Y(m) { var u = U(m) / (P.length - 1); return 120 - 22 * Math.sin(u * Math.PI) + u * 8; }
    function base() {
      svg.appendChild(s('path', { d: 'M0 60 C 40 70, 60 50, 95 62 S 170 40, 210 30 S 300 18, 400 10', 'class': 'gb-pr-river' }));
      svg.appendChild(s('text', { x: 120, y: 48, 'class': 'gb-pr-note' }, 'River Thames'));
      svg.appendChild(s('text', { x: 300, y: 182, 'class': 'gb-pr-note' }, 'Kent'));
      var d = '';
      for (var m = 0; m <= 56; m += 0.5) d += (m ? ' L' : 'M') + X(m).toFixed(1) + ' ' + Y(m).toFixed(1);
      svg.appendChild(s('path', { d: d, 'class': 'gb-pr-road' }));
      svg.appendChild(s('text', { x: X(16), y: Y(16) - 26, 'class': 'gb-pr-note', 'text-anchor': 'middle' }, 'the old Roman road'));
      P.forEach(function (p, i) {
        var g = s('g', { 'class': 'gb-pr-pl', tabindex: '0', role: 'button', 'aria-label': p[1] }), x = X(p[0]), y = Y(p[0]);
        g.appendChild(s('circle', { cx: x, cy: y, r: i === 0 || i === P.length - 1 ? 6.5 : 4.5 }));
        g.appendChild(s('text', { x: x, y: y + (i % 2 ? 38 : 19), 'text-anchor': i === 0 ? 'start' : i === P.length - 1 ? 'end' : 'middle' }, p[1].replace(' under Blean', '')));
        if (i % 2) g.appendChild(s('line', { x1: x, y1: y + 6, x2: x, y2: y + 27, 'class': 'gb-pr-tick' }));
        g.addEventListener('click', function () { mile = p[0]; sl.set(mile); draw(); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mile = p[0]; sl.set(mile); draw(); } });
        svg.appendChild(g); p.g = g;
      });
      var cx = X(56) + 8, cy = Y(56) - 14;
      svg.appendChild(s('path', { d: 'M' + (cx - 16) + ' ' + cy + ' v-14 h6 v-6 h4 v6 h12 v-12 l3 -5 l3 5 v26 Z', 'class': 'gb-pr-cath' }));
    }
    var grp = null;
    function riders(x, y) {
      var g = s('g', { 'class': 'gb-pr-riders', transform: 'translate(' + x.toFixed(1) + ' ' + (y - 6).toFixed(1) + ')' });
      [[-18, 0, '#2f5f9e'], [-6, 3, '#b5523b'], [6, 0, '#3b7d5a'], [18, 3, '#7a4a10']].forEach(function (r) {
        var t = s('g', { transform: 'translate(' + r[0] + ' ' + r[1] + ')' });
        t.appendChild(s('path', { d: 'M-6 0 Q-6 -5 0 -5 L5 -5 L8 -9 L9 -4 Q9 0 6 0 L6 5 M-5 0 L-5 5', 'class': 'gb-pr-horse' }));
        t.appendChild(s('path', { d: 'M-2.5 -5 L-1.8 -12 L2.2 -12 L2.6 -5 Z', fill: r[2] }));
        t.appendChild(s('circle', { cx: 0.2, cy: -14.6, r: 2.6, fill: '#ffcc4d', stroke: '#e8a93a', 'stroke-width': 1 }));
        g.appendChild(t);
      });
      return g;
    }
    base();
    function draw() {
      if (grp) svg.removeChild(grp);
      grp = riders(Math.max(40, Math.min(360, X(mile))), Y(mile)); svg.appendChild(grp);
      var best = P[0];
      P.forEach(function (p) { if (Math.abs(p[0] - mile) <= Math.abs(best[0] - mile)) best = p; p.g.classList.toggle('gb-pr-on', p === best && Math.abs(p[0] - mile) <= 3); });
      var near = Math.abs(best[0] - mile) <= 3;
      out.set(near ? '<b>' + best[1] + '</b>, ' + (best[0] ? 'about ' + best[0] + ' miles from the Tabard' : 'the starting point') + ' (' + best[2] + '). ' + best[3]
        : 'On the road, about ' + mile + ' miles from the Tabard and ' + (56 - mile) + ' from Canterbury. Riding at an easy pace, a medieval company probably took three or four days for the trip. The Tales don\'t name every stop.');
    }
    draw();
  });
})();
