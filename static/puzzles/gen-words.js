/* Word families: word ladders, anagrams, analogies and odd one out. */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles, esc = P.esc;

  /* ================= Word ladders ================= */
  var graphs = {};
  function graph(len) {
    if (graphs[len]) return graphs[len];
    var words = len === 3 ? P.W3 : P.W4, set = {}, adj = {};
    words.forEach(function (w) { set[w] = 1; adj[w] = []; });
    words.forEach(function (w) {
      for (var i = 0; i < len; i++) for (var c = 97; c < 123; c++) {
        var ch = String.fromCharCode(c); if (ch === w[i]) continue;
        var v = w.slice(0, i) + ch + w.slice(i + 1); if (set[v]) adj[w].push(v);
      }
    });
    return (graphs[len] = { words: words, adj: adj });
  }
  P.ladderGraph = graph;
  function bfs(G, s) {
    var dist = {}, prev = {}, q = [s]; dist[s] = 0;
    while (q.length) { var u = q.shift(); G.adj[u].forEach(function (v) { if (!(v in dist)) { dist[v] = dist[u] + 1; prev[v] = u; q.push(v); } }); }
    return { dist: dist, prev: prev };
  }
  P.ladderBfs = bfs;
  P.add({
    key: 'ladders', cols: function (level) { return level === 'easy' ? 3 : 2; },
    gen: function (rng, level) {
      var len = level === 'easy' ? 3 : 4, steps = level === 'easy' ? [3, 3] : level === 'medium' ? [4, 4] : [5, 6], G = graph(len);
      return P.tryGen(rng, function (r) {
        var s = r.pick(G.words); if (G.adj[s].length < 2) return null;
        var b = bfs(G, s), want = r.int(steps[0], steps[1]);
        var ends = Object.keys(b.dist).filter(function (w) { return b.dist[w] === want; });
        if (!ends.length) return null;
        var e = r.pick(ends), path = [e]; while (path[0] !== s) path.unshift(b.prev[path[0]]);
        function ladder(fill) {
          var h = '<ol class="pz-ladder" aria-label="word ladder">';
          path.forEach(function (w, i) {
            var shown = i === 0 || i === path.length - 1 || fill;
            h += '<li>' + w.split('').map(function (ch) { return '<span>' + (shown ? ch.toUpperCase() : '') + '</span>'; }).join('') + '</li>';
          });
          return h + '</ol>';
        }
        return {
          q: ladder(false), a: ladder(true) + (want > 3 ? '<p class="pz-cap">Other ladders of the same length can work too.</p>' : ''),
          sub: s.toUpperCase() + ' to ' + e.toUpperCase() + ' in ' + want + ' steps',
          data: { path: path, steps: want }
        };
      });
    }
  });

  /* ================= Anagrams ================= */
  function sortL(w) { return w.split('').sort().join(''); }
  var anaIndex = null;
  function index() {
    if (anaIndex) return anaIndex;
    anaIndex = {};
    var all = [].concat(P.W3, P.W4); Object.keys(P.THEMES).forEach(function (t) { all = all.concat(P.THEMES[t]); });
    all.forEach(function (w) { var k = sortL(w); (anaIndex[k] = anaIndex[k] || {})[w] = 1; });
    return anaIndex;
  }
  P.anaIndex = index;
  P.add({
    key: 'anagrams', cols: 2,
    sig: function (d) { return d.word; },
    gen: function (rng, level) {
      var lo = level === 'easy' ? 4 : level === 'medium' ? 6 : 7, hi = level === 'easy' ? 5 : level === 'medium' ? 6 : 9;
      return P.tryGen(rng, function (r) {
        var theme = r.pick(Object.keys(P.THEMES)), w = r.pick(P.THEMES[theme]);
        if (w.length < lo || w.length > hi) return null;
        var idx = index(), others = Object.keys(idx[sortL(w)]).filter(function (x) { return x !== w; });
        if (others.some(function (x) { return P.THEMES[theme].indexOf(x) >= 0; })) return null;
        var sc;
        for (var t = 0; t < 30; t++) { sc = r.shuffle(w.split('')).join(''); if (sc !== w && !idx[sortL(w)][sc] && sc.slice(0, 2) !== w.slice(0, 2)) break; }
        if (sc === w || idx[sortL(w)][sc]) return null;
        return {
          q: '<span class="pz-tag">' + esc(theme) + '</span> <span class="pz-big pz-mono">' + esc(sc.toUpperCase()) + '</span><div class="pz-line"></div>',
          a: '<b>' + esc(w.toUpperCase()) + '</b> <span class="pz-tag">' + esc(theme) + '</span>',
          ans: [{ label: 'Word', value: w.toUpperCase() }], data: { word: w, scramble: sc, theme: theme }
        };
      });
    }
  });

  /* ================= Analogies and odd one out ================= */
  var REL = {
    young: { lv: 'easy', say: 'a young {a} is a {b}', pairs: [['cow', 'calf'], ['dog', 'puppy'], ['cat', 'kitten'], ['sheep', 'lamb'], ['horse', 'foal'], ['duck', 'duckling'], ['frog', 'tadpole'], ['bear', 'cub'], ['hen', 'chick'], ['kangaroo', 'joey'], ['deer', 'fawn'], ['goose', 'gosling'], ['pig', 'piglet'], ['owl', 'owlet']] },
    sound: { lv: 'easy', say: 'a {a} says “{b}”', pairs: [['dog', 'woof'], ['cat', 'meow'], ['cow', 'moo'], ['duck', 'quack'], ['lion', 'roar'], ['horse', 'neigh'], ['snake', 'hiss'], ['owl', 'hoot'], ['pig', 'oink'], ['sheep', 'baa'], ['bee', 'buzz'], ['rooster', 'cock-a-doodle-doo']] },
    opposite: { lv: 'easy', say: '{b} is the opposite of {a}', pairs: [['hot', 'cold'], ['up', 'down'], ['wet', 'dry'], ['fast', 'slow'], ['open', 'closed'], ['full', 'empty'], ['early', 'late'], ['heavy', 'light'], ['wide', 'narrow'], ['loud', 'quiet'], ['day', 'night'], ['first', 'last'], ['above', 'below'], ['win', 'lose'], ['push', 'pull'], ['buy', 'sell']] },
    home: { lv: 'medium', say: 'a {a} lives in a {b}', pairs: [['bird', 'nest'], ['bee', 'hive'], ['bear', 'den'], ['rabbit', 'burrow'], ['spider', 'web'], ['horse', 'stable'], ['dog', 'kennel'], ['pig', 'sty'], ['beaver', 'lodge'], ['ant', 'anthill']] },
    group: { lv: 'medium', say: 'many {a}s make a {b}', pairs: [['cow', 'herd'], ['wolf', 'pack'], ['bird', 'flock'], ['fish', 'school'], ['lion', 'pride'], ['bee', 'swarm'], ['ship', 'fleet'], ['star', 'galaxy'], ['tree', 'forest'], ['singer', 'choir']] },
    tool: { lv: 'medium', say: 'a {a} works with a {b}', pairs: [['painter', 'brush'], ['writer', 'pen'], ['gardener', 'rake'], ['tailor', 'needle'], ['baker', 'oven'], ['carpenter', 'saw'], ['farmer', 'plow'], ['photographer', 'camera'], ['fisher', 'net'], ['barber', 'scissors']] },
    part: { lv: 'medium', say: 'a {a} is part of a {b}', pairs: [['petal', 'flower'], ['page', 'book'], ['branch', 'tree'], ['finger', 'hand'], ['toe', 'foot'], ['room', 'house'], ['player', 'team'], ['letter', 'word'], ['wheel', 'bicycle'], ['feather', 'wing'], ['minute', 'hour'], ['key', 'piano']] },
    measure: { lv: 'hard', say: 'a {a} measures {b}', pairs: [['thermometer', 'temperature'], ['clock', 'time'], ['scale', 'weight'], ['ruler', 'length'], ['speedometer', 'speed'], ['compass', 'direction'], ['barometer', 'air pressure'], ['odometer', 'distance']] },
    place: { lv: 'hard', say: 'a {a} works in a {b}', pairs: [['chef', 'kitchen'], ['teacher', 'classroom'], ['pilot', 'cockpit'], ['librarian', 'library'], ['astronomer', 'observatory'], ['judge', 'courtroom'], ['surgeon', 'operating room'], ['actor', 'theater'], ['miner', 'mine'], ['scientist', 'laboratory']] },
    made: { lv: 'hard', say: '{b} is made from {a}', pairs: [['grapes', 'raisins'], ['milk', 'cheese'], ['wheat', 'flour'], ['sand', 'glass'], ['clay', 'brick'], ['wool', 'yarn'], ['cocoa beans', 'chocolate'], ['sap', 'maple syrup']] }
  };
  P.REL = REL;
  var CATSET = {
    fruits: { name: 'fruits', one: 'a fruit', items: ['apple', 'banana', 'cherry', 'grape', 'pear', 'plum', 'peach', 'lemon', 'mango', 'melon'] },
    vehicles: { name: 'vehicles', one: 'a vehicle', items: ['car', 'bus', 'truck', 'van', 'taxi', 'tractor', 'ambulance', 'fire truck', 'pickup truck'] },
    colors: { name: 'colors', one: 'a color', items: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'black', 'white', 'gray'] },
    shapes: { name: 'shapes', one: 'a shape', items: ['square', 'triangle', 'rectangle', 'hexagon', 'pentagon', 'octagon', 'rhombus'] },
    instruments: { name: 'musical instruments', one: 'a musical instrument', items: ['piano', 'violin', 'drum', 'flute', 'guitar', 'trumpet', 'cello', 'harp', 'tuba', 'banjo'] },
    clothing: { name: 'clothes', one: 'something you wear', items: ['shirt', 'sock', 'coat', 'hat', 'scarf', 'glove', 'boot', 'dress', 'sweater', 'jacket'] },
    furniture: { name: 'furniture', one: 'furniture', items: ['chair', 'table', 'sofa', 'bed', 'desk', 'dresser', 'bench', 'stool', 'bookcase'] },
    birds: { name: 'birds', one: 'a bird', items: ['robin', 'eagle', 'owl', 'sparrow', 'parrot', 'crow', 'pigeon', 'blue jay', 'cardinal', 'hawk'] },
    mammals: { name: 'mammals', one: 'a mammal', items: ['dog', 'cat', 'horse', 'cow', 'rabbit', 'bear', 'mouse', 'lion', 'sheep', 'goat', 'zebra'] },
    vegetables: { name: 'vegetables', one: 'a vegetable', items: ['carrot', 'potato', 'onion', 'celery', 'spinach', 'broccoli', 'cabbage', 'lettuce', 'beet', 'radish'] },
    insects: { name: 'insects', one: 'an insect', items: ['ant', 'bee', 'beetle', 'moth', 'butterfly', 'grasshopper', 'ladybug', 'wasp', 'dragonfly'] },
    arachnids: { name: 'spiders and their kin', one: 'not an insect: it has eight legs', items: ['spider', 'scorpion', 'tick'] },
    fish: { name: 'fish', one: 'a fish', items: ['salmon', 'trout', 'tuna', 'cod', 'goldfish', 'shark', 'catfish', 'herring'] },
    seamammals: { name: 'sea mammals', one: 'a mammal, not a fish', items: ['whale', 'dolphin', 'seal', 'walrus', 'manatee'] },
    planets: { name: 'planets', one: 'a planet', items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'] },
    notplanets: { name: '', one: 'not a planet', items: ['the Moon', 'the Sun'] }
  };
  P.CATSET = CATSET;
  var ODD = {
    easy: [['fruits', 'vehicles'], ['vehicles', 'fruits'], ['colors', 'furniture'], ['shapes', 'clothing'], ['instruments', 'fruits'], ['clothing', 'vehicles'], ['furniture', 'colors'], ['colors', 'instruments'], ['shapes', 'fruits']],
    medium: [['fruits', 'vegetables'], ['vegetables', 'fruits'], ['birds', 'mammals'], ['mammals', 'birds'], ['instruments', 'furniture'], ['clothing', 'furniture']],
    hard: [['insects', 'arachnids'], ['fish', 'seamammals'], ['seamammals', 'fish'], ['planets', 'notplanets'], ['mammals', 'birds'], ['fruits', 'vegetables']]
  };
  P.ODD = ODD;
  var LET = ['A', 'B', 'C', 'D', 'E'];
  function choices(list, correct) {
    return '<ol class="pz-choices" type="A">' + list.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ol>';
  }
  P.add({
    key: 'wordsense', cols: 2,
    kinds: [['auto', 'Both'], ['analogy', 'Analogies'], ['odd', 'Odd one out']],
    gen: function (rng, level, o) {
      var type = (o && o.kind && o.kind !== 'auto') ? o.kind : P.cycle(o, arguments[3], ['analogy', 'odd'], 'ws');
      return P.tryGen(rng, function (r) {
        if (type === 'analogy') {
          var keys = Object.keys(REL).filter(function (k) { return level === 'hard' ? REL[k].lv !== 'easy' : level === 'medium' ? REL[k].lv !== 'hard' : REL[k].lv === 'easy'; });
          if (level === 'hard') keys = keys.concat(Object.keys(REL).filter(function (k) { return REL[k].lv === 'hard'; }));
          var rk = r.pick(keys), rel = REL[rk], two = r.shuffle(rel.pairs).slice(0, 3), A = two[0], C = two[1], ans = C[1];
          var opts = [ans, two[2][1]];
          /* a word from another relation about the same C word, if there is one, else any other word */
          Object.keys(REL).forEach(function (k2) { if (k2 !== rk) REL[k2].pairs.forEach(function (pp) { if (pp[0] === C[0] && opts.length < 3 && opts.indexOf(pp[1]) < 0) opts.push(pp[1]); }); });
          while (opts.length < 4) {
            var k3 = r.pick(Object.keys(REL)), w = r.pick(REL[k3].pairs)[r.int(0, 1)];
            if (opts.indexOf(w) < 0 && w !== C[0] && w !== A[0] && w !== A[1]) opts.push(w);
          }
          opts = r.shuffle(opts); var ci = opts.indexOf(ans);
          var q = '<p class="pz-ana"><b>' + esc(A[0]) + '</b> is to <b>' + esc(A[1]) + '</b> as <b>' + esc(C[0]) + '</b> is to <span class="pz-blank" style="min-width:5em"></span></p>' + choices(opts);
          var why = rel.say.replace('{a}', C[0]).replace('{b}', C[1]);
          return { q: q, a: '<b>' + LET[ci] + '. ' + esc(ans) + '</b> — ' + esc(cap(why)) + ', just as ' + esc(rel.say.replace('{a}', A[0]).replace('{b}', A[1])) + '.', choice: { n: 4, correct: ci }, sub: 'Analogy', data: { type: 'analogy', rel: rk, A: A, C: C, opts: opts, ans: ans } };
        }
        var pr = r.pick(ODD[level]), main = CATSET[pr[0]], odd = CATSET[pr[1]];
        var four = r.shuffle(main.items).slice(0, 4), one = r.pick(odd.items), list = r.shuffle(four.concat([one])), oi = list.indexOf(one);
        var reason = cap(one) + ' is ' + odd.one + '; the others are ' + main.name + '.';
        return { q: '<p class="pz-ana">Which one does not belong?</p><ol class="pz-choices pz-row" type="A">' + list.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ol>', a: '<b>' + LET[oi] + '. ' + esc(one) + '</b> — ' + esc(reason), choice: { n: 5, correct: oi }, sub: 'Odd one out', data: { type: 'odd', pair: pr, list: list, odd: one } };
      });
    }
  });
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
})(typeof window !== 'undefined' ? window : globalThis);
