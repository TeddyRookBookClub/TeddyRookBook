/* gbmiddle.aquinas-on-happiness-and-law (gbe4, our own designs).
   gb-law-kinds        Aquinas's four kinds of law (I-II, q. 91) as nested rings: eternal law around natural law around
                       human law, with divine law (Scripture) beside them. Tap a ring or a button to read about it.
                       opts: kind: "eternal" | "natural" | "human" | "divine".
   gb-happy-goods      the eight candidates for happiness that Aquinas tests in I-II, q. 2. Tap each to see why he
                       says it cannot be our last end, then see his answer (q. 3). Summaries in our own words. */
(function () {
  var V = ML.viz; if (!V) return;
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }

  var LAW = {
    eternal: { name: 'Eternal law', q: 'q. 91, a. 1', t: 'God\'s own wise plan for the whole universe. Every other law, Aquinas says, comes from it.', ex: 'The order by which all creation is governed.' },
    natural: { name: 'Natural law', q: 'q. 91, a. 2; q. 94', t: 'The part of the eternal law that human reason can know by itself. Its first rule: good is to be done and pursued, and evil avoided.', ex: 'Keep yourself alive; care for your children; seek the truth; live in society with others.' },
    human: { name: 'Human law', q: 'q. 91, a. 3; q. 95 to 97', t: 'Laws that people make for their own community, worked out from the natural law. Some follow from it as conclusions; others settle details that reason leaves open.', ex: 'Do not steal (a conclusion); which side of the road to drive on (a detail settled by lawmakers).' },
    divine: { name: 'Divine law', q: 'q. 91, a. 4; q. 98 to 108', t: 'The law God gave in Scripture: the Old Law of Moses and the New Law of the Gospel. Aquinas holds it is needed because human judgment can err and human law cannot reach the heart.', ex: 'The Ten Commandments; the command to love God and neighbor.' }
  };
  V.register('gb-law-kinds', function (el, o) {
    o = o || {};
    var cur = LAW[o.kind] ? o.kind : 'eternal';
    var wrap = h('div', 'gb-lk'); el.appendChild(wrap);
    var svg = s('svg', { viewBox: '0 0 400 260', role: 'img', 'aria-label': 'Four kinds of law: eternal law contains natural law, which contains human law; divine law stands beside them.' }); wrap.appendChild(svg);
    var rings = [['eternal', 150, 130, 140, 118], ['natural', 150, 145, 96, 82], ['human', 150, 165, 54, 44]], G = {};
    rings.forEach(function (r) {
      var g = s('g', { 'class': 'gb-lk-ring gb-lk-' + r[0], tabindex: '0', role: 'button', 'aria-label': LAW[r[0]].name });
      g.appendChild(s('ellipse', { cx: r[1], cy: r[2], rx: r[3], ry: r[4] }));
      g.appendChild(s('text', { x: r[1], y: r[2] - r[4] + 20, 'text-anchor': 'middle' }, LAW[r[0]].name));
      svg.appendChild(g); G[r[0]] = g;
    });
    var gd = s('g', { 'class': 'gb-lk-ring gb-lk-divine', tabindex: '0', role: 'button', 'aria-label': LAW.divine.name });
    gd.appendChild(s('rect', { x: 300, y: 70, width: 92, height: 120, rx: 12 }));
    gd.appendChild(s('text', { x: 346, y: 125, 'text-anchor': 'middle' }, 'Divine law'));
    gd.appendChild(s('text', { x: 346, y: 145, 'text-anchor': 'middle', 'class': 'gb-lk-small' }, '(Scripture)'));
    svg.appendChild(gd); G.divine = gd;
    svg.appendChild(s('path', { d: 'M298 130 L 292 130', 'class': 'gb-lk-tie' }));
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    var sg = V.seg(ctl, { label: 'Kind of law', items: [['eternal', 'Eternal'], ['natural', 'Natural'], ['human', 'Human'], ['divine', 'Divine']], value: cur, change: function (v) { cur = v; draw(); } });
    var out = V.readout(el);
    Object.keys(G).forEach(function (k) {
      function pick(e) { if (e) e.stopPropagation(); cur = k; sg.set(k); draw(); }
      G[k].addEventListener('click', pick);
      G[k].addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    function draw() {
      Object.keys(G).forEach(function (k) { G[k].classList.toggle('gb-lk-on', k === cur); });
      var L = LAW[cur];
      out.set('<b>' + L.name + '</b> (Summa, I-II, ' + L.q + '): ' + L.t + ' <i>Example:</i> ' + L.ex);
    }
    draw();
  });

  var GOODS = [
    ['Wealth', 'a. 1', 'Money and goods are wanted for the sake of something else: to keep us alive or to buy things. A last end is wanted for its own sake.'],
    ['Honor', 'a. 2', 'Honor is given to a person because of some excellence already there. It follows goodness; it is not goodness itself.'],
    ['Fame or glory', 'a. 3', 'Fame lives in other people\'s opinions, which can be mistaken and soon fade.'],
    ['Power', 'a. 4', 'Power can be used well or badly, so it cannot be the highest good, which can only be good.'],
    ['Bodily goods', 'a. 5', 'Health, strength and beauty serve the soul and can be lost; many animals outdo us in them.'],
    ['Pleasure', 'a. 6', 'Pleasure comes along with having a good; it is not the good itself. Bodily pleasures are brief and partial.'],
    ['Goods of the soul', 'a. 7', 'Knowledge and virtue matter more, but the soul is itself a created thing that seeks a good beyond itself.'],
    ['Any created good', 'a. 8', 'Our will reaches for goodness without limit, so nothing limited can satisfy it.']
  ];
  V.register('gb-happy-goods', function (el) {
    var seen = {}, cur = -1;
    var grid = h('div', 'gb-hg'); el.appendChild(grid);
    var btns = GOODS.map(function (g, i) {
      var b = h('button', 'gb-hg-b', '<span>' + g[0] + '</span><small>I-II, q. 2, ' + g[1] + '</small>'); b.type = 'button';
      b.addEventListener('click', function () { cur = i; seen[i] = 1; draw(); }); grid.appendChild(b); return b;
    });
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    var ans = V.button(ctl, 'Aquinas\'s answer', function () { cur = 99; draw(); });
    var out = V.readout(el);
    function draw() {
      btns.forEach(function (b, i) { b.classList.toggle('gb-hg-seen', !!seen[i]); b.classList.toggle('gb-hg-now', i === cur); b.setAttribute('aria-pressed', String(i === cur)); });
      var n = Object.keys(seen).length;
      if (cur === 99) out.set('<b>His answer (q. 3):</b> perfect happiness is found in God alone, in seeing God as he is, which Aquinas believes is possible only in the life to come. In this life there is a real but imperfect happiness, found above all in knowing truth and living by the virtues.');
      else if (cur < 0) out.set('Aquinas asks, one article at a time, whether happiness lies in each of these. Tap one to see his reason for saying no.');
      else out.set('<b>' + GOODS[cur][0] + '?</b> Aquinas: no. ' + GOODS[cur][2] + ' <span class="gb-hg-n">(' + n + ' of 8 tested)</span>');
    }
    draw();
  });
})();
