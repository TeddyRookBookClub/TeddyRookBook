/* gbmiddle.dante-inferno (gbe4, our own designs). Also used by the Purgatorio and Paradiso rungs.
   gb-dante-cosmos  Dante's three realms as layered diagrams: the funnel of Hell (nine circles), the mountain of
                    Purgatory (shore, Ante-Purgatory, gate, seven terraces, the Earthly Paradise) and the heavens of
                    Paradise (nine moving spheres and the Empyrean). Pick a level, or walk down or up with the buttons;
                    a small pilgrim marks where Dante is. Descriptions are our own, written for families.
                    opts: realm: "hell" | "purgatory" | "paradise"; at: level index; lock: true hides the realm picker.
   gb-terza-rima    Dante's rhyme pattern, ABA BCB CDC ...: each middle line sets the rhyme of the next tercet.
                    Slider: number of tercets; the readout counts the lines (3n + 1 with the closing line). */
(function () {
  var V = ML.viz; if (!V) return;
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var R = {
    hell: { name: 'Hell', guide: 'Virgil', dir: 'down', L: [
      ['Wood and gate', 'Cantos I to III', 'Dante is lost in a dark wood. Three beasts block his way up a sunny hill, and Virgil comes to guide him. Over the gate are the words "All hope abandon, ye who enter in!" Just inside are those who never took a side, good or bad.'],
      ['1 Limbo', 'Canto IV', 'A quiet castle in a green meadow, for good people who lived without Christian faith: the great poets and thinkers such as Homer, Socrates, Plato and Aristotle. There is no torment here, only longing.'],
      ['2 Desire', 'Canto V', 'People who let love and desire rule their reason are blown about by an endless storm, as they let their feelings blow them about in life.'],
      ['3 Gluttony', 'Canto VI', 'Those who lived only to eat and drink lie in cold, dirty rain, guarded by the three-headed dog Cerberus.'],
      ['4 Greed', 'Canto VII', 'Hoarders and wasters push heavy weights against each other, forever quarreling about money.'],
      ['5 Anger', 'Cantos VII and VIII', 'The angry fight in the muddy marsh of the river Styx. A boatman carries the travelers across to the walls of a city.'],
      ['6 Heresy', 'Cantos IX to XI', 'Inside the walls of the City of Dis, heretics lie in open tombs, among them those who denied that the soul lives on after death. Here Virgil explains the map of Hell.'],
      ['7 Violence', 'Cantos XII to XVII', 'Three rings for violence: against other people, against oneself, and against God and nature. Centaurs guard a red river, and a desert of burning sand lies beyond.'],
      ['8 Fraud', 'Cantos XVIII to XXX', 'Malebolge, ten stone ditches for kinds of cheating: flatterers, fortune-tellers, hypocrites, thieves, false advisers. Here Ulysses tells of his last voyage.'],
      ['9 Treachery', 'Cantos XXXI to XXXIV', 'Giants stand around a frozen lake, Cocytus, where traitors are held in ice. At the very center is Satan, stuck fast. The poets climb past him and come out at last to see the stars.']] },
    purgatory: { name: 'Purgatory', guide: 'Virgil, then Beatrice', dir: 'up', L: [
      ['Shore', 'Cantos I and II', 'Dawn on an island on the far side of the world. The old Roman Cato guards the shore; Virgil washes Dante\'s face and ties a reed, a sign of humility, around him. An angel brings a boat of souls singing a psalm.'],
      ['Ante-Purgatory', 'Cantos III to VIII', 'Souls who turned to God late in life must wait before they can begin to climb. In a flowered valley, rulers who neglected their duties sing at evening.'],
      ['Gate', 'Canto IX', 'Three steps lead to a gate kept by an angel, who marks seven P\'s on Dante\'s forehead (P for <i>peccatum</i>, Latin for sin). One will be wiped away on each terrace.'],
      ['1 Pride', 'Cantos X to XII', 'The proud walk bent under heavy stones, past carvings of humble people. They pray the Lord\'s Prayer.'],
      ['2 Envy', 'Cantos XIII and XIV', 'The envious sit leaning on one another in plain cloaks, with their eyes closed, learning to look kindly on others.'],
      ['3 Anger', 'Cantos XV to XVII', 'The angry walk through thick, dark smoke, as anger once blinded them.'],
      ['4 Sloth', 'Cantos XVII to XIX', 'Midway up the mountain, Virgil explains that every good act and every wrong one comes from love, rightly or wrongly aimed. Here those who were too slow to love the good run without rest, calling out examples of eagerness.'],
      ['5 Greed', 'Cantos XIX to XXI', 'The greedy lie face down, looking at the earth they loved too much. The mountain shakes and sings when a soul is freed: the Roman poet Statius joins the travelers.'],
      ['6 Gluttony', 'Cantos XXII to XXIV', 'Thin, hungry souls pass trees with sweet fruit they cannot reach, learning to hunger for the right things.'],
      ['7 Desire', 'Cantos XXV to XXVII', 'Those whose love of pleasure ran out of bounds pass through a wall of flame. Dante is afraid to cross, until Virgil tells him Beatrice is on the other side.'],
      ['Earthly Paradise', 'Cantos XXVIII to XXXIII', 'The Garden of Eden at the summit. Beatrice arrives, and Virgil returns home. Dante drinks from the rivers Lethe (forgetting wrongs) and Eunoë (remembering good), and is ready to rise to the stars.']] },
    paradise: { name: 'Paradise', guide: 'Beatrice, then Saint Bernard', dir: 'up', L: [
      ['Moon', 'Cantos II to V', 'Souls who could not keep their vows. Piccarda explains that they are content where they are: "in his will is our tranquillity."'],
      ['Mercury', 'Cantos V to VII', 'Souls who did good but wanted honor for it. The emperor Justinian tells the story of Rome.'],
      ['Venus', 'Cantos VIII and IX', 'Souls whose great power of love was at last turned to God.'],
      ['Sun', 'Cantos X to XIV', 'The wise and learned, in rings of light. Thomas Aquinas, Dominican, praises Saint Francis; a Franciscan praises Saint Dominic.'],
      ['Mars', 'Cantos XIV to XVIII', 'Souls who fought for the faith form a great cross of light. Dante\'s great-great-grandfather Cacciaguida tells him of his coming exile.'],
      ['Jupiter', 'Cantos XVIII to XX', 'Just rulers spell out "Love justice" in letters of light, then form a great eagle that speaks with one voice.'],
      ['Saturn', 'Cantos XXI and XXII', 'Those who lived lives of prayer and quiet. A golden ladder rises out of sight.'],
      ['Fixed stars', 'Cantos XXII to XXVII', 'Dante looks back down at the small Earth. Saints Peter, James and John question him on faith, hope and love, and he answers.'],
      ['Primum Mobile', 'Cantos XXVII to XXIX', 'The outermost moving sphere, which turns all the others. Dante sees God as a point of light circled by nine rings of angels.'],
      ['Empyrean', 'Cantos XXX to XXXIII', 'Beyond space and time. The blessed sit in a great white rose. Saint Bernard prays to Mary for Dante, and Dante glimpses God: "the Love impell\'d, that moves the sun in heav\'n and all the stars."']] }
  };

  function pilgrim(x, y) {
    var g = s('g', { 'class': 'gb-dc-pil', transform: 'translate(' + x + ' ' + y + ')' });
    g.appendChild(s('path', { d: 'M-6 9 L-4 -3 Q0 -6 4 -3 L6 9 Z', 'class': 'gb-dc-robe' }));
    g.appendChild(s('circle', { cx: 0, cy: -8, r: 4.5, fill: '#ffcc4d', stroke: '#e8a93a', 'stroke-width': 1.5 }));
    return g;
  }

  V.register('gb-dante-cosmos', function (el, o) {
    o = o || {};
    var realm = R[o.realm] ? o.realm : 'hell', at = +o.at || 0;
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    if (!o.lock) V.seg(ctl, { label: 'Realm', items: [['hell', 'Inferno'], ['purgatory', 'Purgatorio'], ['paradise', 'Paradiso']], value: realm, change: function (v) { realm = v; at = 0; draw(); } });
    var wrap = h('div', 'gb-dc'); el.appendChild(wrap);
    var svg = s('svg', { viewBox: '0 0 360 400' }); wrap.appendChild(svg);
    var row = h('div', 'ml-ctl'); el.appendChild(row);
    var bA = V.button(row, '', function () { if (at > 0) { at--; draw(); } });
    var bB = V.button(row, '', function () { if (at < R[realm].L.length - 1) { at++; draw(); } });
    var out = V.readout(el);
    function hot(g, i) {
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', R[realm].L[i][0]);
      g.addEventListener('click', function () { at = i; draw(); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); at = i; draw(); } });
    }
    function label(g, i, y) { g.appendChild(s('text', { x: 244, y: y + 4, 'class': 'gb-dc-lab' }, R[realm].L[i][0])); }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var D = R[realm], n = D.L.length, cx = 118, py = 0;
      svg.setAttribute('aria-label', 'A diagram of ' + D.name + ' with ' + n + ' levels; ' + D.L[at][0] + ' is selected.');
      svg.setAttribute('role', 'img');
      if (realm === 'hell') {
        var top = 22, hh = 35;
        for (var i = 0; i < n; i++) {
          var y0 = top + i * hh, w0 = 112 - i * 10.5, w1 = 112 - (i + 1) * 10.5, g = s('g', { 'class': 'gb-dc-lv' + (i === at ? ' gb-dc-on' : '') });
          if (i === 0) g.appendChild(s('path', { d: 'M' + (cx - 112) + ' ' + (y0 + hh) + ' L' + (cx - 100) + ' ' + y0 + ' L' + (cx + 100) + ' ' + y0 + ' L' + (cx + 112) + ' ' + (y0 + hh) + ' Z', 'class': 'gb-dc-wood' }));
          else g.appendChild(s('path', { d: 'M' + (cx - w0) + ' ' + y0 + ' L' + (cx + w0) + ' ' + y0 + ' L' + (cx + w1) + ' ' + (y0 + hh) + ' L' + (cx - w1) + ' ' + (y0 + hh) + ' Z' }));
          label(g, i, y0 + hh / 2); hot(g, i); svg.appendChild(g);
          if (i === at) py = y0 + hh / 2;
        }
        svg.appendChild(s('text', { x: cx, y: 392, 'text-anchor': 'middle', 'class': 'gb-dc-note' }, 'center of the Earth'));
      } else if (realm === 'purgatory') {
        var bot = 380, rh = 31;
        svg.appendChild(s('rect', { x: 0, y: bot - 8, width: 236, height: 20, 'class': 'gb-dc-sea' }));
        for (var j = 0; j < n; j++) {
          var yb = bot - j * rh, yt = yb - rh, wb = 116 - j * 9, wt = 116 - (j + 1) * 9, gg = s('g', { 'class': 'gb-dc-lv' + (j === at ? ' gb-dc-on' : '') + (j === n - 1 ? ' gb-dc-eden' : '') });
          gg.appendChild(s('path', { d: 'M' + (cx - wb) + ' ' + yb + ' L' + (cx - wt) + ' ' + yt + ' L' + (cx + wt) + ' ' + yt + ' L' + (cx + wb) + ' ' + yb + ' Z' }));
          if (j === n - 1) { gg.appendChild(s('circle', { cx: cx + 14, cy: yt - 6, r: 8, 'class': 'gb-dc-tree' })); gg.appendChild(s('rect', { x: cx + 13, y: yt - 2, width: 2.5, height: 4, 'class': 'gb-dc-trunk' })); }
          label(gg, j, yb - rh / 2); hot(gg, j); svg.appendChild(gg);
          if (j === at) py = yb - rh / 2;
        }
      } else {
        var base = 384, dy = 34;
        for (var k = n - 1; k >= 0; k--) {
          var ry = 30 + (k + 1) * dy - 12, rx = 24 + (k + 1) * 9.4, gk = s('g', { 'class': 'gb-dc-lv gb-dc-sph' + (k === at ? ' gb-dc-on' : '') + (k === n - 1 ? ' gb-dc-emp' : '') });
          gk.appendChild(s('path', { d: 'M' + (cx - rx) + ' ' + base + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + base + ' Z' }));
          label(gk, k, base - ry + dy / 2); hot(gk, k); svg.appendChild(gk);
          if (k === at) py = base - ry + dy / 2;
        }
        svg.appendChild(s('path', { d: 'M' + (cx - 22) + ' ' + base + ' A22 22 0 0 1 ' + (cx + 22) + ' ' + base + ' Z', 'class': 'gb-dc-earth' }));
        svg.appendChild(s('text', { x: cx, y: base - 6, 'text-anchor': 'middle', 'class': 'gb-dc-note' }, 'Earth'));
      }
      svg.appendChild(s('line', { x1: cx + 16, y1: py, x2: 238, y2: py, 'class': 'gb-dc-lead' }));
      svg.appendChild(pilgrim(cx, py));
      var up = D.dir === 'up';
      bA.textContent = up ? '▼ Back down' : '▲ Back up'; bB.textContent = up ? 'Climb up ▲' : 'Go down ▼';
      bA.disabled = at <= 0; bB.disabled = at >= n - 1;
      var L = D.L[at];
      out.set('<b>' + D.name + ': ' + L[0].replace(/^\d /, function (m) { return (realm === 'hell' ? 'Circle ' : 'Terrace ') + m; }) + '</b> (' + L[1] + '). ' + L[2] + ' <span class="gb-dc-g">Guide: ' + D.guide + '.</span>');
    }
    draw();
  });

  var LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  V.register('gb-terza-rima', function (el, o) {
    o = o || {};
    var n = Math.max(1, Math.min(8, +o.n || 3));
    var box = h('div', 'gb-tr'); el.appendChild(box);
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Tercets (groups of three lines)', min: 1, max: 8, step: 1, value: n, input: function (v) { n = v; draw(); } });
    var out = V.readout(el);
    function draw() {
      var html = '';
      for (var t = 0; t < n; t++) {
        var a = LET[t], b = LET[t + 1];
        html += '<div class="gb-tr-t"><span class="gb-tr-l gb-tr-c' + (t % 6) + '">' + a + '</span><span class="gb-tr-l gb-tr-c' + ((t + 1) % 6) + ' gb-tr-mid">' + b + '</span><span class="gb-tr-l gb-tr-c' + (t % 6) + '">' + a + '</span></div>';
      }
      html += '<div class="gb-tr-t gb-tr-end"><span class="gb-tr-l gb-tr-c' + (n % 6) + '">' + LET[n] + '</span></div>';
      box.innerHTML = html;
      out.set(n + ' tercet' + (n > 1 ? 's' : '') + ' and one closing line: <b>' + (3 * n + 1) + ' lines</b> (3 × ' + n + ' + 1). Each middle line (outlined) brings in the rhyme that the next tercet uses twice, so the rhymes are chained together. Dante\'s first tercet ends <i>vita, oscura, smarrita</i>: A, B, A.');
    }
    draw();
  });
})();
