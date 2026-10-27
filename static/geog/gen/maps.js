/* Maps and Places (Geography Ladder, course key maps): problem generators.
   All 42 topics: the first six (unit What Is a Map?) by the ladder designer as the model; the other 36 by the course builder (source /tmp/work_maps/gen_part.js).
   Read-aloud problems for ages 5 to 9: one short sentence in large type (<span class="gg-big">), a "Read to me" note for the
   grown-up at the top of q, and a quiet picture from the kit (gg-birdseye, gg-town, gg-map). Answers are mc with two or three
   choices (keep: true when the choices are letters that match the picture, or Yes/No), or tf statements. No typing.
   Levels: 1 = one clear question, two or three very different choices; 2 = choices that match the topic's trouble note;
   3 = a two-step question (use the key, then find the letter; choose all that are true; the reverse question).
   The model: MathLadder.geog (static/geog/viz/geog.js) holds the room, the towns, the symbol names and the things. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function GG() { return ML.geog; }
  var READ = '<p class="gg-readme"><b>Read to me</b> Read the question and the choices aloud.</p>';
  function big(s) { return '<span class="gg-big">' + s + '</span>'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function art(n) { return /^[aeiou]/i.test(n) ? 'an ' + n : 'a ' + n; }
  function mc(choices, right, keep) { var o = { t: 'mc', choices: choices, v: choices.indexOf(right) }; if (keep) o.keep = true; return o; }
  var LET = ['A', 'B', 'C', 'D'];

  /* ------------------------------------------------------------------ maps.what-is-a-map */
  var MAP_TRUE = [
    ['A map shows a place as if you were looking down from the sky.', 'That is the bird\'s-eye view every map uses.'],
    ['A map shows the tops of things, like roofs and treetops.', 'From above, you see the tops.'],
    ['A map can show a room, a town, or the whole world.', 'Maps come in every size, from one room to all of Earth.'],
    ['A map helps you find where things are.', 'That is what maps are for.'],
    ['A map is much smaller than the real place.', 'A map shrinks the place so it fits on paper or a screen.']];
  var MAP_FALSE = [
    ['A map shows a place from the side, like a photo of a house\'s front door.', 'A map looks down from above, not from the side.'],
    ['A map has to be as big as the real place.', 'Then it would not fit in your hand! Maps are drawn smaller.'],
    ['A map tells you what time it is.', 'A clock does that. A map shows where things are.'],
    ['A map only shows faraway countries.', 'A map can show your own room or your own street too.']];
  var USES = { right: ['find the way to the park', 'see where the school is', 'find the library in a new town', 'see which street the store is on'],
    wrong: ['tell what time it is', 'cook dinner', 'see how a song sounds', 'tell how warm it is today'] };
  G('maps.what-is-a-map', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['view', 'use', 'tf']) : L === 2 ? R.pick(['view', 'tf', 'use']) : R.pick(['all', 'tf']);
    var town = { name: 'gg-town', opts: { layout: R.pick(['maple', 'river', 'hill']), quiet: true, interactive: false, key: false, compass: false, grid: false, label: 'A picture map of a small town, seen from above.' } };
    if (shape === 'view') {
      var right = 'From above, like a bird in the sky', wrong = L === 1 ? ['From under the ground'] : ['From the side, like a photo of the front of a house', 'From inside a car'];
      var ch = R.shuffle([right].concat(wrong));
      return { q: READ + big('This is a map of a town. Where are you looking from when you see a map?'), viz: town, a: mc(ch, right), hint: 'Look at the roofs and the treetops. Can you see their tops or their sides?',
        steps: ['On the map you can see the tops of the houses and the trees.', 'So the map shows the town from above, the way a bird sees it.', 'Every map uses this bird\'s-eye view.'] };
    }
    if (shape === 'use') {
      var r1 = R.pick(USES.right), w = R.sample(USES.wrong, L === 1 ? 1 : 2), ch2 = R.shuffle([r1].concat(w));
      return { q: READ + big('Which of these can a map help you do?'), viz: L === 1 ? town : undefined, a: mc(ch2.map(cap), cap(r1)), hint: 'A map shows where things are.',
        steps: ['A map shows where things are.', 'So it can help you ' + r1 + '.', 'It cannot help you ' + w.join(' or ') + '.'] };
    }
    if (shape === 'tf') {
      var t = R.coin(), it = R.pick(t ? MAP_TRUE : MAP_FALSE);
      return { q: READ + big('True or false? ' + it[0]), a: { t: 'tf', v: t }, hint: 'Think about how a map looks: from above, and smaller than the real place.', steps: [(t ? 'True. ' : 'False. ') + it[1]] };
    }
    var tr = R.sample(MAP_TRUE, 2), fl = R.sample(MAP_FALSE, 2), list = R.shuffle(tr.map(function (x) { return [x, true]; }).concat(fl.map(function (x) { return [x, false]; })));
    return { q: READ + big('Which are true about maps? Choose all that are true.'), a: { t: 'mc', choices: list.map(function (x) { return x[0][0]; }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) },
      hint: 'A map looks down from above and is smaller than the real place.',
      steps: list.map(function (x) { return (x[1] ? 'True: ' : 'Not true: ') + x[0][0] + ' ' + x[0][1]; }) };
  });

  /* ------------------------------------------------------------------ maps.birds-eye-view */
  var EASY = ['table', 'tree', 'house', 'car', 'cup', 'bed', 'lamp', 'plate', 'bucket', 'chair'];
  var LOOKALIKE = { cup: ['plate', 'bucket'], plate: ['cup', 'lamp'], bucket: ['cup', 'lamp'], lamp: ['plate', 'bucket'], table: ['bed', 'chair'], bed: ['table', 'car'], chair: ['table', 'house'], tree: ['lamp', 'plate'], car: ['bed', 'table'], house: ['table', 'bed'] };
  function topDesc(k) { return { table: 'a rectangle (the tabletop)', chair: 'a square seat with the back along one edge', bed: 'a long rectangle with the pillow at one end', cup: 'a circle, with the handle sticking out', tree: 'a round green top; the trunk is hidden', house: 'the two halves of the roof', car: 'the roof and the windows, long and narrow', lamp: 'a circle (the shade), with the bulb in the middle', plate: 'a big circle with a rim', bucket: 'a circle (the rim), with the handle across it', ball: 'a circle, the same as from the side', bike: 'a thin line, with the handlebars across the front' }[k]; }
  G('maps.birds-eye-view', function (R, ctx) {
    var L = ctx.level || 1, key, others, from = 'side';
    if (L === 1) { key = R.pick(EASY); others = R.sample(EASY.filter(function (k) { return k !== key && (LOOKALIKE[key] || []).indexOf(k) < 0; }), 2); }
    else if (L === 2) { key = R.pick(EASY); others = LOOKALIKE[key].slice(); }
    else { if (R.coin()) { key = R.pick(['ball', 'bike']); others = key === 'ball' ? ['plate', 'cup'] : ['lamp', 'table']; } else { key = R.pick(EASY); others = LOOKALIKE[key].slice(); from = 'top'; } }
    var ch = R.shuffle([key].concat(others)), ok = ch.indexOf(key), name = ML.geog.THINGS[key];
    var q = from === 'top' ? 'This is something seen from above. Which picture shows the same thing from the side?' : 'Here is ' + art(name) + ' from the side. Which picture shows the ' + name + ' from above?';
    return { q: READ + big(q), viz: { name: 'gg-birdseye', opts: { ask: key, choices: ch, from: from, quiet: true, interactive: false, big: true } },
      a: { t: 'mc', choices: LET.slice(0, 3).map(function (l) { return 'Picture ' + l; }), v: ok, keep: true },
      hint: from === 'top' ? 'Imagine looking down at each picture. Which one would have that top?' : 'Imagine you are a bird looking straight down at the ' + name + '. What would you see?',
      steps: ['From above, ' + art(name) + ' looks like ' + topDesc(key) + '.', 'That is picture ' + LET[ok] + '.'].concat(key === 'ball' ? ['A ball is round every way you look at it, so it looks like a circle from the side and from above.'] : key === 'bike' ? ['From above you see only the narrow top of the bike, so it looks thin.'] : []) };
  });

  /* ------------------------------------------------------------------ maps.room-map */
  function roomThings() { var T = ML.geog.ROOM.things; return T.map(function (t) { return { k: t[0], c: t[1], r: t[2], w: t[3], h: t[4], cx: t[1] + (t[3] || 1) / 2, cy: t[2] + (t[4] || 1) / 2 }; }); }
  G('maps.room-map', function (R, ctx) {
    var L = ctx.level || 1, N = ML.geog.ROOM_NAMES, things = roomThings(), inside = things.filter(function (t) { return t.k !== 'door' && t.k !== 'window'; });
    var shape = L === 1 ? 'what' : L === 2 ? R.pick(['what', 'near', 'far']) : R.pick(['near', 'far', 'size']);
    var room = { layout: 'room', quiet: true, interactive: false, labels: false };
    if (shape === 'what') {
      var t = R.pick(inside), wr = R.sample(inside.filter(function (x) { return x.k !== t.k; }), L === 1 ? 1 : 2).map(function (x) { return N[x.k]; });
      var ch = R.shuffle([N[t.k]].concat(wr)).map(function (x) { return 'The ' + x; });
      return { q: READ + big('This is a map of a bedroom, seen from above. What is at the question mark?'), viz: { name: 'gg-town', opts: Object.assign(room, { ask: t.k }) },
        a: mc(ch, 'The ' + N[t.k]), hint: 'Look at the shape from above. What would look like that from the ceiling?',
        steps: ['The question mark is on the ' + N[t.k] + '.', 'From above, the ' + N[t.k] + ' looks like ' + ({ bed: 'a long rectangle with a pillow', desk: 'a rectangle with a book on it', chair: 'a small square seat', rug: 'a soft rectangle with a border', toybox: 'a box full of toys', shelf: 'a narrow shelf of books', lamp: 'a round shade', plant: 'a round pot with leaves' }[t.k] || 'that shape') + '.'] };
    }
    if (shape === 'near' || shape === 'far') {
      var ref = R.pick(['door', 'window']), rf = things.filter(function (x) { return x.k === ref; })[0];
      var refY = ref === 'door' ? 4 : 0, dist = function (x) { return Math.hypot(x.cx - rf.cx, x.cy - refY); };
      var cand = R.sample(inside, 3), sorted = cand.slice().sort(function (a, b) { return dist(a) - dist(b); });
      if (Math.abs(dist(sorted[0]) - dist(sorted[1])) < 0.6 || Math.abs(dist(sorted[1]) - dist(sorted[2])) < 0.6) { cand = [inside.filter(function (x) { return x.k === 'rug'; })[0], inside.filter(function (x) { return x.k === 'bed'; })[0], inside.filter(function (x) { return x.k === 'shelf'; })[0]]; sorted = cand.slice().sort(function (a, b) { return dist(a) - dist(b); }); }
      var ans = shape === 'near' ? sorted[0] : sorted[sorted.length - 1], word = shape === 'near' ? 'closest to' : 'farthest from';
      var ch3 = R.shuffle(cand.map(function (x) { return 'The ' + N[x.k]; }));
      return { q: READ + big('Look at the map of the bedroom. Which is ' + word + ' the ' + N[ref] + '?'), viz: { name: 'gg-town', opts: Object.assign(room, { labels: true }) },
        a: mc(ch3, 'The ' + N[ans.k]), hint: 'Find the ' + N[ref] + ' first. Then look at how far each thing is from it.',
        steps: ['The ' + N[ref] + ' is on the ' + (ref === 'door' ? 'bottom' : 'top') + ' wall of the map.', 'Of the ' + cand.map(function (x) { return N[x.k]; }).join(', the ') + ', the ' + N[ans.k] + ' is ' + word + ' it.'] };
    }
    var t2 = R.coin();
    return { q: READ + big(t2 ? 'True or false? The map of the room is smaller than the real room, but things are in the same places.' : 'True or false? The bed on a map of your room must be as big as your real bed.'),
      viz: { name: 'gg-town', opts: room }, a: { t: 'tf', v: t2 }, hint: 'Could a map of your room fit on a piece of paper?',
      steps: [t2 ? 'True. A map makes everything smaller, but it keeps each thing in its place.' : 'False. A map makes everything smaller so the whole room fits on the page.', 'The bed is still next to the same wall; it is just drawn small.'] };
  });

  /* ------------------------------------------------------------------ maps.map-symbols */
  var TOWNK = ['house', 'school', 'store', 'library', 'hospital', 'fire', 'post', 'farm', 'playground', 'park', 'pond', 'tree', 'busstop'];
  var SIMILAR = { school: ['library', 'town', 'store'], library: ['school', 'store', 'town'], store: ['house', 'library', 'school'], house: ['store', 'farm', 'school'], farm: ['house', 'fire', 'store'], fire: ['hospital', 'farm', 'police'], hospital: ['fire', 'school', 'post'], post: ['library', 'store', 'hospital'], park: ['tree', 'playground', 'farm'], tree: ['park', 'farm', 'playground'], pond: ['park', 'lake', 'tree'], playground: ['park', 'school', 'busstop'], busstop: ['post', 'playground', 'store'] };
  function townWith(R, kinds) { // a random town: the given kinds plus a few others, each in its own square of a 6 x 6 grid
    var cells = R.sample(Array.apply(null, Array(36)).map(function (_, i) { return [i % 6, Math.floor(i / 6)]; }), kinds.length);
    return kinds.map(function (k, i) { return { kind: k, c: cells[i][0], r: cells[i][1] }; });
  }
  function nm(k) { return (ML.geog.SYMBOLS[k] || k).toLowerCase(); }
  G('maps.map-symbols', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'what' : L === 2 ? R.pick(['what', 'what', 'tf']) : R.pick(['which', 'tf']);
    if (shape === 'what') {
      var k = R.pick(TOWNK), wr = L === 1 ? R.sample(TOWNK.filter(function (x) { return x !== k && SIMILAR[k].indexOf(x) < 0; }), 2) : R.sample(SIMILAR[k].filter(function (x) { return ML.geog.SYMBOLS[x]; }), 2);
      var pl = townWith(R, R.shuffle([k].concat(R.sample(TOWNK.filter(function (x) { return x !== k; }), 5))));
      var ch = R.shuffle([k].concat(wr)).map(function (x) { return cap(art(nm(x))); });
      return { q: READ + big('A map uses small pictures called symbols. What does the symbol with the question mark stand for?'), viz: { name: 'gg-town', opts: { places: pl, ask: k, key: false, quiet: true, interactive: false, grid: false, compass: false } },
        a: mc(ch, cap(art(nm(k)))), hint: 'What real place would look like that little picture?',
        steps: ['The symbol with the question mark stands for ' + art(nm(k)) + '.', 'The little picture is not the real size; it just shows where ' + art(nm(k)) + ' is.'] };
    }
    if (shape === 'tf') {
      var st = R.pick([['A small tree symbol on a map stands for a real tree, or a group of trees.', true, 'The symbol is tiny, but the trees are real and big.'], ['A tiny house symbol means the real house is tiny too.', false, 'Symbols are small so they fit; the real house is full size.'],
        ['A red line for a road means the real road is painted red.', false, 'Mapmakers pick colors to make things easy to see, not to show the real color.'], ['A symbol is a little picture or shape that stands for a real thing.', true, 'That is what a symbol is.'],
        ['Every map uses exactly the same symbols.', false, 'Different maps can use different symbols. That is why maps have a key.']]);
      return { q: READ + big('True or false? ' + st[0]), a: { t: 'tf', v: st[1] }, hint: 'Is the symbol the real thing, or a little picture that stands for it?', steps: [(st[1] ? 'True. ' : 'False. ') + st[2]] };
    }
    var kinds = R.sample(TOWNK.filter(function (x) { return x !== 'tree' && x !== 'pond'; }), 3), want = R.pick(kinds), marks = {}; kinds.forEach(function (k, i) { marks[k] = LET[i]; });
    var pl2 = townWith(R, R.shuffle(kinds.concat(R.sample(TOWNK.filter(function (x) { return kinds.indexOf(x) < 0; }), 3))));
    return { q: READ + big('Which letter is on the symbol for ' + art(nm(want)) + '?'), viz: { name: 'gg-town', opts: { places: pl2, marks: marks, key: false, quiet: true, interactive: false, grid: false, compass: false } },
      a: { t: 'mc', choices: ['A', 'B', 'C'], v: kinds.indexOf(want), keep: true }, hint: 'Look at each lettered symbol. Which one looks like ' + art(nm(want)) + '?',
      steps: ['Letter ' + marks[want] + ' is on the symbol for ' + art(nm(want)) + '.', 'The other letters are on ' + kinds.filter(function (k) { return k !== want; }).map(function (k) { return art(nm(k)) + ' (' + marks[k] + ')'; }).join(' and ') + '.'] };
  });

  /* ------------------------------------------------------------------ maps.map-key */
  var SPECIAL = { house: ['Grandma\'s house', 'Leo\'s house', 'the blue house'], store: ['the toy store', 'the bakery', 'the shoe store'], park: ['Maple Park', 'the dog park'], tent: ['the campground'], picnic: ['the picnic area'], field: ['the ball field'], school: ['Oak School', 'Hill School'] };
  G('maps.map-key', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 || (L === 2 && R.coin())) {
      var kinds = R.sample(TOWNK.filter(function (x) { return x !== 'tree'; }), 5), k = R.pick(kinds), pl = townWith(R, kinds);
      var wr = R.sample(kinds.filter(function (x) { return x !== k; }), L === 1 ? 1 : 2), ch = R.shuffle([k].concat(wr)).map(function (x) { return cap(art(nm(x))); });
      return { q: READ + big('Use the map key. What is at the question mark?'), viz: { name: 'gg-town', opts: { places: pl, ask: k, key: true, quiet: true, interactive: false, grid: false } },
        a: mc(ch, cap(art(nm(k)))), hint: 'Find the same symbol in the map key. The key tells you its name.',
        steps: ['Find the symbol with the question mark.', 'Find the same symbol in the map key.', 'The key says it is ' + art(nm(k)) + '.'] };
    }
    if (L === 2) { // the key gives names a learner cannot guess from the picture
      var base = R.sample(['house', 'store', 'school', 'park'], 3), names = {}; base.forEach(function (b) { names[b] = R.pick(SPECIAL[b]); });
      var want = R.pick(base), pl2 = townWith(R, base.concat(R.sample(['library', 'pond', 'fire', 'post'], 2))), marks = {}; base.forEach(function (b, i) { marks[b] = LET[i]; });
      var nmm = function (b) { return names[b]; };
      return { q: READ + big('This map\'s key gives names. Which letter marks ' + nmm(want) + '?'), viz: { name: 'gg-town', opts: { places: pl2, marks: marks, key: base, names: names, quiet: true, interactive: false, grid: false } },
        a: { t: 'mc', choices: ['A', 'B', 'C'], v: base.indexOf(want), keep: true }, hint: 'Find "' + nmm(want) + '" in the key, look at its symbol, then find that symbol on the map.',
        steps: ['In the key, ' + nmm(want) + ' has the ' + nm(want) + ' symbol.', 'On the map, that symbol has the letter ' + marks[want] + '.'] };
    }
    // level 3: a key with symbols a child would not guess, so the key must be read
    var camp = ['tent', 'picnic', 'field', 'mountain', 'lake'], use = R.sample(camp, 3), want3 = R.pick(use), marks3 = {}; use.forEach(function (b, i) { marks3[b] = LET[i]; });
    var pl3 = townWith(R, use.concat(['house', 'store'])), nm3 = { tent: 'Campground', picnic: 'Picnic area', field: 'Ball field', mountain: 'Mountain', lake: 'Lake' };
    var ask3 = R.coin();
    if (ask3) return { q: READ + big('Use the key. Which letter marks the ' + nm3[want3].toLowerCase() + '?'), viz: { name: 'gg-town', opts: { layout: 'hill', places: pl3, marks: marks3, key: use, quiet: true, interactive: false, grid: false } },
      a: { t: 'mc', choices: ['A', 'B', 'C'], v: use.indexOf(want3), keep: true }, hint: 'Find the word in the key first, then its symbol.', steps: ['The key shows the symbol for the ' + nm3[want3].toLowerCase() + '.', 'On the map that symbol has the letter ' + marks3[want3] + '.'] };
    var tf = R.pick([['A map key tells what the symbols on the map mean.', true, 'The key (or legend) lists each symbol and its meaning.'], ['If you are not sure what a symbol means, you should guess.', false, 'Check the key! Each map can use its own symbols.'], ['Another name for a map key is a legend.', true, 'Key and legend mean the same thing on a map.']]);
    return { q: READ + big('True or false? ' + tf[0]), a: { t: 'tf', v: tf[1] }, hint: 'What is the key for?', steps: [(tf[1] ? 'True. ' : 'False. ') + tf[2]] };
  });

  /* ------------------------------------------------------------------ maps.map-colors */
  G('maps.map-colors', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var w = R.pick([['water', 'Blue', ['Green', 'Brown']], ['the land', 'Tan or green', ['Blue', 'White']]]);
      return { q: READ + big('On this map of the world, what color is ' + w[0] + '?'), viz: { name: 'gg-map', opts: { color: 'plain', quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A map of the world.' } },
        a: mc(R.shuffle([w[1]].concat(w[2])), w[1]), hint: 'Most of Earth is ocean. Which color covers most of the map?',
        steps: ['On most maps, water is blue.', 'On this map the oceans are blue and the land is a light tan.'] };
    }
    if (L === 2) {
      var right = 'To tell one country from the next', ch = R.shuffle([right, 'Because the land there really is that color', 'To show which countries are hot and which are cold']);
      var reg = R.pick(['sam', 'AF', 'nca', 'EU']);
      return { q: READ + big('Why are the countries on this map different colors?'), viz: { name: 'gg-map', opts: { region: reg, quiet: true, interactive: false, dots: false, label: 'A map with each country in its own color.' } },
        a: mc(ch, right), hint: 'Are the real countries painted pink, green and yellow?',
        steps: ['The real land is not pink or green or yellow.', 'Mapmakers color countries differently so you can see where one ends and the next begins.', 'Neighbors are always different colors.'] };
    }
    var conts = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'], COL = { 0: 'blue', 1: 'orange', 2: 'green', 3: 'red', 5: 'yellow', 6: 'purple' }, pick = R.sample([0, 1, 2, 3, 5, 6], 6), cols = COL, cats = {}, names = [null, null, null, null, null, null, null];
    ML.geog.C.forEach(function (c) { var i = conts.indexOf(c.cont); if (i >= 0 && c.id !== 'RUS') cats[c.id] = pick[i]; }); // Russia spans Europe and Asia: left uncolored
    for (var i = 0; i < 6; i++) names[pick[i]] = ML.geog.CONT[conts[i]].replace('Oceania', 'Australia and Oceania');
    var j = R.int(0, 5), colorName = cols[pick[j]], right3 = names[pick[j]];
    var wrong3 = R.sample(names.filter(function (n) { return n && n !== right3; }), 2);
    return { q: READ + big('Use the map key. Which continent is colored ' + colorName + '?'), viz: { name: 'gg-map', opts: { cats: cats, catNames: names, legend: 'Map key', quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A world map with each continent in its own color, and a key.' } },
      a: mc(R.shuffle([right3].concat(wrong3)), right3), hint: 'Find the ' + colorName + ' square in the key and read the name next to it.',
      steps: ['In the key, the ' + colorName + ' square says ' + right3 + '.', 'So ' + right3 + ' is the ' + colorName + ' part of the map.', 'The colors on this map come from its key, not from the real color of the land.'] };
  });
  /* =====================================================================================================================
     The other 36 topics (course builder c_maps). Same conventions as the six above: a "Read to me" line, one big question,
     two to four choices (letters keep their order), quiet pictures computed from the same data as the answer.
     ===================================================================================================================== */
  function tfq(it, hint) { return { q: READ + big('True or false? ' + it[0]), a: { t: 'tf', v: it[1] }, hint: hint, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] }; }
  function mcq(q, right, wrongs, o) { // a one-answer mc; o: { viz, hint, steps, keep (keep the order given in o.order) }
    o = o || {}; var ch = o.order || [right].concat(wrongs);
    return { q: READ + big(q), viz: o.viz, a: mc(ch, right, !!o.order), hint: o.hint, steps: o.steps };
  }
  function the(k) { return 'the ' + nm(k); }
  var DIRW = { N: 'north', E: 'east', S: 'south', W: 'west', NE: 'northeast', SE: 'southeast', SW: 'southwest', NW: 'northwest' };
  var DXY = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }, OPP = { N: 'S', S: 'N', E: 'W', W: 'E', NE: 'SW', SW: 'NE', SE: 'NW', NW: 'SE' };
  var CARD = ['N', 'E', 'S', 'W'], INTER = ['NE', 'SE', 'SW', 'NW'];
  function Cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var PLACEK = ['house', 'school', 'store', 'library', 'hospital', 'fire', 'post', 'farm', 'playground', 'park', 'pond', 'busstop'];
  function sq(c, r) { return LET6[c] + (r + 1); }
  var LET6 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  function quietTown(extra) { return Object.assign({ quiet: true, interactive: false, key: false, grid: false, compass: false }, extra); }

  /* ------------------------------------------------------------------ maps.parts-of-a-map */
  var PARTS = {
    title: { n: 'The title', q: 'Which part of a map tells you what place the map shows?', does: 'tells what place the map shows' },
    key: { n: 'The map key', q: 'Which part of a map tells you what each symbol means?', does: 'tells what each symbol means' },
    compass: { n: 'The compass rose', q: 'Which part of a map shows which way is north?', does: 'shows the directions: north, east, south and west' },
    scale: { n: 'The scale bar', q: 'Which part of a map helps you tell how far apart two places really are?', does: 'shows how far a length on the map is in real life' }
  };
  var PART_MIX = { key: 'compass', compass: 'key', title: 'key', scale: 'compass' };
  var PART_STORY = [
    ['key', 'Mia sees a little tent on a park map. She wants to know what it means. Which part of the map should she look at?'],
    ['compass', 'Leo wants to walk north. Which part of the map shows him which way north is?'],
    ['scale', 'Ana wants to know if the lake is 1 mile away or 10 miles away. Which part of the map can tell her?'],
    ['title', 'Sam finds an old map in a drawer. Which part tells him what place it shows?']];
  G('maps.parts-of-a-map', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(PARTS);
    var viz = { name: 'gg-town', opts: { layout: 'maple', title: 'Maple Town', scale: { blocks: 2, label: '2 blocks' }, grid: false, quiet: true, interactive: false, label: 'A map of Maple Town with a title, a map key, a compass rose and a scale bar.' } };
    var k, q;
    if (L === 3) { var st = R.pick(PART_STORY); k = st[0]; q = st[1]; } else { k = R.pick(ks); q = PARTS[k].q; }
    var wr = L === 1 ? R.sample(ks.filter(function (x) { return x !== k && x !== PART_MIX[k]; }), 2) : [PART_MIX[k]].concat(R.sample(ks.filter(function (x) { return x !== k && x !== PART_MIX[k]; }), 1));
    if (L === 3) wr = ks.filter(function (x) { return x !== k; });
    return mcq(q, PARTS[k].n, wr.map(function (x) { return PARTS[x].n; }), { viz: viz, hint: 'Think about what each part does: the title says what, the key explains symbols, the compass rose shows directions, the scale shows how far.',
      steps: [PARTS[k].n + ' ' + PARTS[k].does + '.'].concat(wr.indexOf(PART_MIX[k]) >= 0 ? [PARTS[PART_MIX[k]].n + ' ' + PARTS[PART_MIX[k]].does + ', so it is not the answer.'] : []) });
  });

  /* ------------------------------------------------------------------ maps.location-words */
  // five places in a plus shape: a center, one on each side; every answer is read off these positions
  G('maps.location-words', function (R, ctx) {
    var L = ctx.level || 1, ks = R.sample(PLACEK, 5), ox = R.int(0, 2), oy = R.int(0, 3);
    var P = { mid: { k: ks[0], c: ox + 1, r: oy + 1 }, left: { k: ks[1], c: ox, r: oy + 1 }, right: { k: ks[2], c: ox + 2, r: oy + 1 }, up: { k: ks[3], c: ox + 1, r: oy }, down: { k: ks[4], c: ox + 1, r: oy + 2 } };
    var places = Object.keys(P).map(function (x) { return { kind: P[x].k, c: P[x].c, r: P[x].r }; });
    var viz = { name: 'gg-town', opts: quietTown({ places: places, labels: true, label: 'A small picture map with five places, each with its name.' }) };
    var shape = L === 1 ? R.pick(['up', 'down', 'betweenLR', 'betweenUD']) : L === 2 ? R.pick(['left', 'right', 'left', 'right', 'betweenLR']) : R.pick(['pair', 'pair', 'left', 'right']);
    var C = function (x) { return Cap(the(P[x].k)); }, all = ['mid', 'left', 'right', 'up', 'down'];
    if (shape === 'up' || shape === 'down') {
      var w1 = R.sample(all.filter(function (x) { return x !== shape && x !== 'mid'; }), 2);
      return mcq('Look at the map. What is just ' + (shape === 'up' ? 'above' : 'below') + ' ' + the(P.mid.k) + '?', C(shape), w1.map(C), { viz: viz, hint: 'Find ' + the(P.mid.k) + ' first. Then look straight ' + (shape === 'up' ? 'up' : 'down') + ' on the map.',
        steps: ['Find ' + the(P.mid.k) + ' in the middle.', 'Just ' + (shape === 'up' ? 'above' : 'below') + ' it on the map is ' + the(P[shape].k) + '.'] });
    }
    if (shape === 'betweenLR' || shape === 'betweenUD') {
      var a = shape === 'betweenLR' ? 'left' : 'up', b = shape === 'betweenLR' ? 'right' : 'down';
      return mcq('What is between ' + the(P[a].k) + ' and ' + the(P[b].k) + '?', C('mid'), R.sample(all.filter(function (x) { return x !== 'mid' && x !== a && x !== b; }), 2).map(C), { viz: viz, hint: 'Find both places. What is in the middle, with one on each side?',
        steps: [Cap(the(P[a].k)) + ' is on one side and ' + the(P[b].k) + ' is on the other.', 'In the middle, between them, is ' + the(P.mid.k) + '.'] });
    }
    if (shape === 'left' || shape === 'right') {
      var opp = shape === 'left' ? 'right' : 'left', w2 = [opp, R.pick(['up', 'down'])];
      return mcq('Look at the map. What is just to the ' + shape + ' of ' + the(P.mid.k) + '?', C(shape), w2.map(C), { viz: viz, hint: 'Use the map\'s ' + shape + ' side, as you look at the page. Which hand is your ' + shape + ' hand?',
        steps: ['Find ' + the(P.mid.k) + ' in the middle.', 'On the map, the ' + shape + ' side is the side of your ' + shape + ' hand as you look at the page.', 'Just to the ' + shape + ' of it is ' + the(P[shape].k) + '.'] });
    }
    var right = 'The ' + nm(P.left.k) + ' and the ' + nm(P.right.k), w3 = ['The ' + nm(P.left.k) + ' and the ' + nm(P.up.k), 'The ' + nm(P.up.k) + ' and the ' + nm(P.right.k)];
    if (R.coin()) { right = 'The ' + nm(P.up.k) + ' and the ' + nm(P.down.k); w3 = ['The ' + nm(P.up.k) + ' and the ' + nm(P.left.k), 'The ' + nm(P.down.k) + ' and the ' + nm(P.right.k)]; }
    return mcq(Cap(the(P.mid.k)) + ' is between which two places?', right, w3, { viz: viz, hint: 'Between means one place on each side, in a line.',
      steps: ['Find ' + the(P.mid.k) + '.', right + ' are on opposite sides of it, in a straight line.', 'So ' + the(P.mid.k) + ' is between ' + right.charAt(0).toLowerCase() + right.slice(1) + '.'] });
  });

  /* ------------------------------------------------------------------ maps.cardinal-directions */
  var CARD_TF = [['On most maps, north is at the top.', true, 'Mapmakers usually put north at the top. The compass rose tells you for sure.'],
    ['North means straight up into the sky.', false, 'North is a direction across the ground, toward the North Pole. On a map we draw it at the top.'],
    ['If you walk north and then turn all the way around, you are facing south.', true, 'North and south are opposites.'],
    ['East and west are opposites.', true, 'When you face east, west is behind you.'],
    ['On a map with north at the top, east is on the left side.', false, 'With north at the top, east is on the right side and west is on the left.'],
    ['South is the opposite of north.', true, 'They point opposite ways.']];
  G('maps.cardinal-directions', function (R, ctx) {
    var L = ctx.level || 1, ks = R.sample(PLACEK.filter(function (x) { return x !== 'house'; }), 4), around = {}; CARD.forEach(function (d, i) { around[d] = ks[i]; });
    var viz = { name: 'gg-compass', opts: { around: around, labels: true, quiet: true, interactive: false } };
    if (L === 3 && R.chance(0.6)) return tfq(R.pick(CARD_TF), 'On most maps north is at the top, south at the bottom, east on the right and west on the left.');
    var d = R.pick(CARD);
    if (L === 1) {
      var wr = R.sample(CARD.filter(function (x) { return x !== d; }), 2);
      return mcq('What is ' + DIRW[d] + ' of the house?', Cap(the(around[d])), wr.map(function (x) { return Cap(the(around[x])); }), { viz: viz, hint: 'Find the N on the little compass rose. North is up, south is down, east is right, west is left.',
        steps: ['On this map north is at the top, south at the bottom, east on the right and west on the left.', DIRW[d].charAt(0).toUpperCase() + DIRW[d].slice(1) + ' of the house is ' + the(around[d]) + '.'] });
    }
    var ord = ['North', 'East', 'South', 'West'];
    return mcq('Which way is ' + the(around[d]) + ' from the house?', Cap(DIRW[d]), [], { viz: viz, order: ord, hint: 'Is it above, below, to the right or to the left of the house? Up is north.',
      steps: [Cap(the(around[d])) + ' is ' + { N: 'above', S: 'below', E: 'to the right of', W: 'to the left of' }[d] + ' the house on the map.', 'On this map that is ' + DIRW[d] + '.'] });
  });

  /* ------------------------------------------------------------------ maps.compass-rose */
  G('maps.compass-rose', function (R, ctx) {
    var L = ctx.level || 1, ord = ['North', 'East', 'South', 'West'];
    if (L === 3) {
      if (R.chance(0.3)) return tfq(R.pick([['Going around a compass rose like a clock\'s hands, from north, the order is north, east, south, west.', true, 'N, E, S, W: "Never Eat Soggy Waffles."'],
        ['On a compass rose, east is across from west.', true, 'They are opposites, so they sit across from each other.'],
        ['On a compass rose, east and north are across from each other.', false, 'North is across from south, and east is across from west.'],
        ['A compass rose has only one direction on it: north.', false, 'It shows north, east, south and west, and sometimes the in-between directions too.'], ['The letter W on a compass rose stands for west.', true, 'N, E, S and W stand for north, east, south and west.'],
        ['The letter E on a compass rose stands for every direction.', false, 'E stands for east.']]), 'Say the order: Never Eat Soggy Waffles.');
      var d = R.pick(['E', 'S', 'W']);
      return mcq('The arrow points one way. Only the N is shown. Which way does the arrow point?', Cap(DIRW[d]), [], { order: ord, viz: { name: 'gg-compass', opts: { hideAll: true, arrow: d, quiet: true, interactive: false } },
        hint: 'Start at N and go around like a clock: north, east, south, west.',
        steps: ['N is at the top. Going around like a clock: N, then E on the right, then S at the bottom, then W on the left.', 'The arrow points ' + { E: 'to the right', S: 'down', W: 'to the left' }[d] + ', so it points ' + DIRW[d] + '.'] });
    }
    if (R.chance(0.35)) { var d0 = R.pick(CARD);
      return mcq('On a compass rose, which direction is across from ' + DIRW[d0] + '?', Cap(DIRW[OPP[d0]]), [], { order: ord, viz: L === 1 ? { name: 'gg-compass', opts: { words: true, quiet: true, interactive: false } } : undefined,
        hint: 'Across means on the opposite side of the circle.', steps: [Cap(DIRW[d0]) + ' and ' + DIRW[OPP[d0]] + ' are opposites, so they sit across from each other.'] }); }
    var a = L === 1 ? R.pick(CARD) : R.pick(['E', 'W', 'E', 'W', 'S']);
    var wr = L === 1 ? R.sample(CARD.filter(function (x) { return x !== a && x !== OPP[a]; }), 2) : [OPP[a], R.pick(CARD.filter(function (x) { return x !== a && x !== OPP[a]; }))];
    return mcq('Which direction goes where the question mark is?', Cap(DIRW[a]), wr.map(function (x) { return Cap(DIRW[x]); }), { viz: { name: 'gg-compass', opts: { ask: a, words: R.coin(), quiet: true, interactive: false } },
      hint: 'Start at the top, north, and go around like a clock: Never Eat Soggy Waffles.',
      steps: ['Going around from the top: north, east, south, west (Never Eat Soggy Waffles).', 'The question mark is ' + { N: 'at the top', E: 'on the right', S: 'at the bottom', W: 'on the left' }[a] + ', so it is ' + DIRW[a] + '.'] });
  });

  /* ------------------------------------------------------------------ maps.follow-directions */
  function inGrid(p) { return p[0] >= 0 && p[1] >= 0 && p[0] < 6 && p[1] < 6; }
  function walk(p, d, n) { return [p[0] + DXY[d][0] * n, p[1] + DXY[d][1] * n]; }
  function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  G('maps.follow-directions', function (R, ctx) {
    var L = ctx.level || 1;
    for (var tries = 0; tries < 200; tries++) {
      var start = [R.int(0, 5), R.int(0, 5)], nmv = L === 1 ? 1 : 2, moves = [], d1 = R.pick(CARD);
      moves.push([d1, R.int(L === 1 ? 2 : 1, 3)]);
      if (nmv === 2) { var d2 = R.pick(CARD.filter(function (x) { return x !== d1 && x !== OPP[d1]; })); moves.push([d2, R.int(L === 3 ? 2 : 1, 3)]); }
      var mid = walk(start, moves[0][0], moves[0][1]), end = nmv === 2 ? walk(mid, moves[1][0], moves[1][1]) : mid;
      var last = moves[moves.length - 1], before = nmv === 2 ? mid : start;
      var wrongTurn = walk(before, OPP[last[0]], last[1]), countStart = walk(before, last[0], last[1] - 1);
      if (!inGrid(mid) || !inGrid(end) || !inGrid(wrongTurn)) continue;
      var bad = [wrongTurn, countStart];
      if (bad.some(function (b) { return same(b, end) || same(b, start); }) || same(wrongTurn, countStart)) continue;
      break;
    }
    var ks = R.sample(PLACEK, 6), places = [{ kind: ks[0], c: end[0], r: end[1] }, { kind: ks[1], c: wrongTurn[0], r: wrongTurn[1] }, { kind: ks[2], c: countStart[0], r: countStart[1] }];
    var used = [start, end, wrongTurn, countStart, mid], k = 3;
    while (places.length < 6 && k < 60) { var cell = [R.int(0, 5), R.int(0, 5)]; k++; if (used.some(function (u) { return same(u, cell); })) continue; used.push(cell); places.push({ kind: ks[places.length], c: cell[0], r: cell[1] }); }
    var say = moves.map(function (m) { return 'go ' + m[1] + ' block' + (m[1] > 1 ? 's' : '') + ' ' + DIRW[m[0]]; }), txt = say.join(', then ');
    var viz = { name: 'gg-town', opts: quietTown({ places: places, you: start, compass: true, key: true, labels: true, label: 'A picture map of a town with a walker, a compass rose and places with their names.' }) };
    var lr = { N: 'up', S: 'down', E: 'to the right', W: 'to the left' };
    return mcq('Start at the child on the map. ' + Cap(txt) + '. Where are you?', Cap(the(ks[0])), [Cap(the(ks[1])), Cap(the(ks[2]))], { viz: viz,
      hint: 'North is up and east is right. Count each block you walk; the square you start on does not count.',
      steps: ['North is up, south is down, east is to the right and west is to the left.'].concat(moves.map(function (m) { return 'Go ' + m[1] + ' block' + (m[1] > 1 ? 's' : '') + ' ' + DIRW[m[0]] + ': move ' + lr[m[0]] + ' ' + m[1] + ' square' + (m[1] > 1 ? 's' : '') + '.'; })).concat(['You end at ' + the(ks[0]) + '.']) });
  });

  /* ------------------------------------------------------------------ maps.intermediate-directions */
  G('maps.intermediate-directions', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) {
      var pair = R.pick([['N', 'E', 'NE'], ['S', 'E', 'SE'], ['S', 'W', 'SW'], ['N', 'W', 'NW']]), right = Cap(DIRW[pair[2]]);
      var flip = Cap(DIRW[pair[1]] + DIRW[pair[0]]), other = Cap(DIRW[OPP[pair[0]]] + DIRW[pair[1]]);
      return mcq('What do we call the direction halfway between ' + DIRW[pair[0]] + ' and ' + DIRW[pair[1]] + '?', right, [flip, other], { hint: 'In-between directions always start with north or south.',
        steps: ['In-between directions start with north or south, then add east or west.', 'Halfway between ' + DIRW[pair[0]] + ' and ' + DIRW[pair[1]] + ' is ' + DIRW[pair[2]] + '.'] });
    }
    if (L === 3) {
      var ks = R.sample(PLACEK.filter(function (x) { return x !== 'house'; }), 4), around = {}; INTER.forEach(function (d, i) { around[d] = ks[i]; });
      var d = R.pick(INTER), wr = [OPP[d], R.pick(INTER.filter(function (x) { return x !== d && x !== OPP[d]; }))];
      return mcq('What is ' + DIRW[d] + ' of the house?', Cap(the(around[d])), wr.map(function (x) { return Cap(the(around[x])); }), { viz: { name: 'gg-compass', opts: { around: around, labels: true, quiet: true, interactive: false } },
        hint: DIRW[d].charAt(0).toUpperCase() + DIRW[d].slice(1) + ' is between ' + DIRW[d.charAt(0)] + ' and ' + DIRW[d.charAt(1)] + '. Look at the corners.',
        steps: [Cap(DIRW[d]) + ' is halfway between ' + DIRW[d.charAt(0)] + ' (' + (d.charAt(0) === 'N' ? 'up' : 'down') + ') and ' + DIRW[d.charAt(1)] + ' (' + (d.charAt(1) === 'E' ? 'right' : 'left') + ').', 'That corner has ' + the(around[d]) + '.'] });
    }
    var a = R.pick(INTER), wr2 = L === 1 ? R.sample(CARD, 2) : [a.charAt(0) + OPP[a.charAt(1)], OPP[a.charAt(0)] + a.charAt(1)];
    return mcq('Which direction goes where the question mark is?', Cap(DIRW[a]), wr2.map(function (x) { return Cap(DIRW[x]); }), { viz: { name: 'gg-compass', opts: { points: 8, ask: a, quiet: true, interactive: false } },
      hint: 'Which two big directions is the question mark between?',
      steps: ['The question mark is between ' + DIRW[a.charAt(0)] + ' and ' + DIRW[a.charAt(1)] + '.', 'So it is ' + DIRW[a] + ' (' + a + ').'] });
  });

  /* ------------------------------------------------------------------ maps.sun-directions */
  G('maps.sun-directions', function (R, ctx) {
    var L = ctx.level || 1, ord = ['North', 'East', 'South', 'West'];
    if (L === 3 && R.chance(0.35)) return sunStory(R);
    if (L === 3) {
      if (R.coin()) return tfq(R.pick([['The Sun rises in the west.', false, 'The Sun rises in the east and sets in the west.'], ['The Sun sets in the west.', true, 'In the evening the Sun goes down in the western sky.'],
        ['In the morning, the Sun is in the eastern part of the sky.', true, 'It rises in the east, so in the morning it is in the eastern sky.'], ['The Sun comes up in a different direction every morning, so it cannot help you find your way.', false, 'It always rises in the eastern part of the sky, so it is a good helper.']]), 'Remember: the Sun rises in the east and sets in the west.');
      if (R.chance(0.3)) return mcq('At midday, in most of the United States, which part of the sky is the Sun in?', 'South', [], { order: ord, viz: { name: 'gg-compass', opts: { sun: 'noon', quiet: true, interactive: false } }, hint: 'It rises in the east, sets in the west, and in between it passes across one side of the sky.',
        steps: ['The Sun rises in the east and sets in the west.', 'At midday, north of the tropics (most of the United States), it is high in the southern part of the sky.'] });
      var m = R.coin();
      return mcq(m ? 'In the morning you stand with the rising Sun in your face. Which way is behind you?' : 'In the evening you face the setting Sun. Which way is behind you?', m ? 'West' : 'East', [], { order: ord,
        hint: 'Which way are you facing? Behind you is the opposite way.', steps: [m ? 'The Sun rises in the east, so you are facing east.' : 'The Sun sets in the west, so you are facing west.', 'Behind you is the opposite direction: ' + (m ? 'west' : 'east') + '.'] });
    }
    if (R.chance(0.45)) return sunStory(R);
    var rise = R.coin(), dir = rise ? 'E' : 'W';
    var viz = { name: 'gg-compass', opts: { sun: rise ? 'rise' : 'set', ask: dir, quiet: true, interactive: false } };
    var q = rise ? 'It is morning. The Sun is coming up. Which direction is the question mark?' : 'It is evening. The Sun is going down. Which direction is the question mark?';
    var wr = L === 1 ? ['North'] : [Cap(DIRW[OPP[dir]]), 'North'];
    return mcq(q, Cap(DIRW[dir]), wr, { viz: viz, hint: rise ? 'Where does the Sun come up in the morning?' : 'Where does the Sun go down in the evening?',
      steps: [rise ? 'The Sun rises in the east.' : 'The Sun sets in the west.', 'So the question mark is ' + DIRW[dir] + '.'] });
  });
  function sunStory(R) {
    var ord = ['North', 'East', 'South', 'West'];
      var who = R.pick(['Maya', 'Leo', 'Ana', 'Sam', 'Zoe', 'Eli']), sr = R.coin(), thing = R.pick(['her bedroom window', 'his bedroom window', 'the porch', 'the kitchen window', 'the tent door', 'the classroom window', 'the front door', 'the barn door']).replace(/her|his/, function (m) { return /^(Maya|Ana|Zoe)$/.test(who) ? 'her' : 'his'; });
      return mcq(who + ' sees the Sun ' + (sr ? 'come up in the morning' : 'go down in the evening') + ' right outside ' + thing + '. Which way does ' + thing.replace(/^(her|his) /, 'the ') + ' face?', sr ? 'East' : 'West', [], { order: ord,
        hint: sr ? 'Where does the Sun rise?' : 'Where does the Sun set?', steps: [sr ? 'The Sun rises in the east.' : 'The Sun sets in the west.', 'So ' + thing.replace(/^(her|his) /, 'the ') + ' faces ' + (sr ? 'east' : 'west') + '.'] });
  }

  /* ------------------------------------------------------------------ maps.using-a-compass */
  G('maps.using-a-compass', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return mcq('This is a compass. Which way does the needle point?', 'North', ['The way you are walking', 'Down to the ground'], { viz: { name: 'gg-compass', opts: { needle: true, quiet: true, interactive: false } },
      hint: 'A compass needle always swings to point the same way.', steps: ['A compass needle is a small magnet.', 'It swings around until it points north.'] });
    if (R.chance(0.4)) {
      var k1 = R.pick(PLACEK), k2 = R.pick(PLACEK.filter(function (x) { return x !== k1; })), beh = R.coin();
      return beh ? mcq('Your compass needle points toward ' + the(k1) + '. ' + Cap(the(k2)) + ' is right behind you. Which way is ' + the(k2) + '?', 'South', [], { order: ['North', 'East', 'South', 'West'], hint: 'Behind you is the opposite of the way the needle points.',
          steps: ['The needle points north, so ' + the(k1) + ' is north of you.', 'Behind you is the opposite way: south. ' + Cap(the(k2)) + ' is south.'] })
        : mcq('You hold a compass. The needle points toward ' + the(k1) + '. Which way is ' + the(k1) + '?', 'North', [], { order: ['North', 'East', 'South', 'West'], hint: 'Which way does a compass needle always point?', steps: ['A compass needle points north.', 'So ' + the(k1) + ' is to the north.'] });
    }
    if (L === 2 || R.coin()) {
      var a = R.pick(['E', 'S', 'W']), wr = [Cap(DIRW[OPP[a]]), Cap(DIRW[R.pick(CARD.filter(function (x) { return x !== a && x !== OPP[a]; }))])];
      return mcq('The N on the compass lines up with the needle. Which direction is the question mark?', Cap(DIRW[a]), wr, { viz: { name: 'gg-compass', opts: { needle: true, ask: a, quiet: true, interactive: false } },
        hint: 'The needle points north. Go around like a clock: north, east, south, west.',
        steps: ['The needle and the N point north.', 'Going around like a clock: north, east, south, west.', 'The question mark is ' + { E: 'on the right', S: 'at the bottom', W: 'on the left' }[a] + ', so it is ' + DIRW[a] + '.'] });
    }
    return tfq(R.pick([['A compass needle points the way you are walking.', false, 'The needle points north no matter which way you walk.'], ['A compass needle points north no matter which way you face.', true, 'Turn around and the needle still swings back to north.'],
      ['Once you know which way is north, you can find south, east and west.', true, 'South is opposite north; east is on your right when you face north; west is on your left.'],
      ['A magnet held close to a compass can pull the needle the wrong way.', true, 'The needle is a magnet, so other magnets and some metal things can pull on it.']]), 'The needle is a little magnet that points north.');
  });

  /* ------------------------------------------------------------------ maps.grid-squares and maps.grid-locate */
  function gridWrongs(R, c, r, cols, rows, near) { // wrong square names: swapped letter/number, and neighbors
    var out = [], add = function (cc, rr) { if (cc >= 0 && rr >= 0 && cc < cols && rr < rows && !(cc === c && rr === r)) { var s = sq(cc, rr); if (out.indexOf(s) < 0) out.push(s); } };
    if (near) { add(r, c); add(c, r + 1); add(c, r - 1); add(c + 1, r); add(c - 1, r); }
    else { var t = 0; while (out.length < 4 && t++ < 50) { var cc = R.int(0, cols - 1), rr = R.int(0, rows - 1); if (Math.abs(cc - c) >= 2 && Math.abs(rr - r) >= 2) add(cc, rr); } }
    return out;
  }
  function uniquePlaces(layout) { var T = ML.geog.TOWNS[layout], cnt = {}; T.places.forEach(function (p) { cnt[p[0]] = (cnt[p[0]] || 0) + 1; }); return T.places.filter(function (p) { return cnt[p[0]] === 1 && ML.geog.SYMBOLS[p[0]]; }); }
  G('maps.grid-squares', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3) { // what is in square X? (the maple town)
      var U = uniquePlaces('maple'), p = R.pick(U), oth = R.sample(U.filter(function (x) { return x !== p; }), 2);
      return mcq('What is in square ' + sq(p[1], p[2]) + '?', Cap(the(p[0])), oth.map(function (x) { return Cap(the(x[0])); }), { viz: { name: 'gg-town', opts: { layout: 'maple', quiet: true, interactive: false, key: true, compass: false } },
        hint: 'Find the letter ' + LET6[p[1]] + ' at the top. Go down to row ' + (p[2] + 1) + '.',
        steps: ['Find column ' + LET6[p[1]] + ' along the top.', 'Go down that column to row ' + (p[2] + 1) + '.', 'Square ' + sq(p[1], p[2]) + ' has ' + the(p[0]) + '.'] });
    }
    var c = R.int(0, 5), r = R.int(0, 5), wr = gridWrongs(R, c, r, 6, 6, L === 2);
    wr = L === 2 ? wr.slice(0, 2) : R.sample(wr, 2);
    return mcq('Which square is colored orange?', sq(c, r), wr, { viz: { name: 'gg-town', opts: { layout: 'maple', places: [], highlightCell: [c, r], quiet: true, interactive: false, key: false, compass: false, label: 'An empty grid with letters A to F along the top and numbers 1 to 6 down the side. One square is colored.' } },
      hint: 'Look straight up from the square to find its letter. Then look straight across to find its number.',
      steps: ['Go straight up from the orange square: the letter is ' + LET6[c] + '.', 'Go straight across to the side: the number is ' + (r + 1) + '.', 'Letter first, then number: ' + sq(c, r) + '.'] });
  });
  G('maps.grid-locate', function (R, ctx) {
    var L = ctx.level || 1, lay = R.pick(['maple', 'river', 'hill']), T = ML.geog.TOWNS[lay], U = uniquePlaces(lay), p = R.pick(U);
    var viz = { name: 'gg-town', opts: { layout: lay, quiet: true, interactive: false, key: true, compass: false } };
    if (L === 3 && R.coin()) {
      var near = U.filter(function (x) { return x !== p && Math.abs(x[1] - p[1]) + Math.abs(x[2] - p[2]) <= 2; }), oth = R.sample(near.length >= 2 ? near : U.filter(function (x) { return x !== p; }), 2);
      return mcq('What is in square ' + sq(p[1], p[2]) + '?', Cap(the(p[0])), oth.map(function (x) { return Cap(the(x[0])); }), { viz: viz, hint: 'Letter first: find column ' + LET6[p[1]] + '. Then go to row ' + (p[2] + 1) + '.',
        steps: ['Column ' + LET6[p[1]] + ' is along the top; row ' + (p[2] + 1) + ' is down the side.', 'Where they meet is ' + the(p[0]) + '.'] });
    }
    var wr = gridWrongs(R, p[1], p[2], T.cols, T.rows, L >= 2);
    wr = L >= 2 ? wr.slice(0, 2) : R.sample(wr, 2);
    return mcq('In which square is ' + the(p[0]) + '?', sq(p[1], p[2]), wr, { viz: viz, hint: 'Find ' + the(p[0]) + '. Look up to the letter, then across to the number.',
      steps: ['Find ' + the(p[0]) + ' on the map (the key shows its symbol).', 'Straight up is the letter ' + LET6[p[1]] + '; straight across is the number ' + (p[2] + 1) + '.', 'So it is in square ' + sq(p[1], p[2]) + '.'] });
  });

  /* ------------------------------------------------------------------ maps.routes */
  G('maps.routes', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3) {
      if (R.chance(0.3)) return tfq(R.pick([['The route that looks straightest on a map is always the shortest way to walk.', false, 'You can only walk where there are roads and paths. Count the blocks to compare routes.'],
        ['A route is the way you travel from one place to another.', true, 'You can trace a route on a map with your finger.'], ['On a town map, you can walk right through a building to make your route shorter.', false, 'Routes follow streets and paths, not through buildings.']]), 'Routes follow the streets.');
      var a1 = R.int(1, 3), a2 = R.int(1, 3), b = R.intNot(2, 6, a1 + a2), ana = a1 + a2, nmA = R.pick(['Ana', 'Mia', 'Lucy']), nmB = R.pick(['Ben', 'Leo', 'Sam']);
      var right = ana > b ? nmA : nmB;
      return mcq(nmA + ' walks ' + a1 + ' block' + (a1 > 1 ? 's' : '') + ' north and then ' + a2 + ' block' + (a2 > 1 ? 's' : '') + ' east. ' + nmB + ' walks ' + b + ' blocks east. Who walks farther?', right, [ana > b ? nmB : nmA, 'They walk the same'], { order: [nmA, nmB, 'They walk the same'],
        hint: 'Add up all the blocks for each person.', steps: [nmA + ' walks ' + a1 + ' + ' + a2 + ' = ' + ana + ' blocks.', nmB + ' walks ' + b + ' blocks.', right + ' walks farther.'] });
    }
    for (var t = 0; t < 200; t++) {
      var s0 = [R.int(0, 5), R.int(0, 5)], d1 = R.pick(CARD), n1 = R.int(1, 3), d2 = R.pick(CARD.filter(function (x) { return x !== d1 && x !== OPP[d1]; })), n2 = R.int(1, 3);
      var m = walk(s0, d1, n1), e = walk(m, d2, n2); if (inGrid(m) && inGrid(e)) break;
    }
    var cells = []; for (var i = 1; i <= n1; i++) cells.push(walk(s0, d1, i)); for (i = 1; i <= n2; i++) cells.push(walk(m, d2, i));
    var route = [s0].concat(cells), len = n1 + n2, ks = R.sample(PLACEK.filter(function (x) { return x !== 'house'; }), 4), places = [{ kind: 'house', c: s0[0], r: s0[1] }, { kind: ks[0], c: e[0], r: e[1] }];
    var off = [], tt = 0; while (places.length < 4 && tt++ < 80) { var cl = [R.int(0, 5), R.int(0, 5)]; if (route.some(function (q) { return same(q, cl); }) || off.some(function (q) { return same(q, cl); })) continue; off.push(cl); places.push({ kind: ks[places.length - 1], c: cl[0], r: cl[1] }); }
    var viz = { name: 'gg-town', opts: quietTown({ places: places, route: route, labels: true, compass: true, key: true, label: 'A picture map of a town with a route drawn from the house.' }) };
    if (L === 1) return mcq('Follow the route from the house. Where does it end?', Cap(the(ks[0])), [Cap(the(ks[1])), Cap(the(ks[2]))], { viz: viz, hint: 'Put your finger on the house and follow the line to the dot at its end.',
      steps: ['Start at the house.', 'Follow the line ' + n1 + ' block' + (n1 > 1 ? 's' : '') + ' ' + DIRW[d1] + ', then ' + n2 + ' block' + (n2 > 1 ? 's' : '') + ' ' + DIRW[d2] + '.', 'The route ends at ' + the(ks[0]) + '.'] });
    var nums = [len - 1, len, len + 1];
    return mcq('How many blocks long is the route from the house to ' + the(ks[0]) + '? Each square is one block.', String(len), [], { viz: viz, order: nums.map(String),
      hint: 'Count each square the line moves into. Do not count the square where you start.',
      steps: ['Do not count the house\'s own square.', 'The route goes ' + n1 + ' block' + (n1 > 1 ? 's' : '') + ' ' + DIRW[d1] + ' and ' + n2 + ' block' + (n2 > 1 ? 's' : '') + ' ' + DIRW[d2] + '.', n1 + ' + ' + n2 + ' = ' + len + ' blocks.'] });
  });

  /* ------------------------------------------------------------------ maps.map-scale */
  G('maps.map-scale', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 && R.coin()) {
      var u1 = R.pick([1, 5]), u2 = R.pick([10, 100]), n = R.int(2, 3);
      return mcq('On Map A, one square is ' + u1 + ' mile' + (u1 > 1 ? 's' : '') + '. On Map B, one square is ' + u2 + ' miles. Two towns are ' + n + ' squares apart on each map. On which map are the towns farther apart in real life?', 'Map B', ['Map A', 'The same'], { order: ['Map A', 'Map B', 'The same'],
        hint: 'Skip-count the miles for each map.', steps: ['Map A: ' + n + ' squares × ' + u1 + ' = ' + n * u1 + ' miles.', 'Map B: ' + n + ' squares × ' + u2 + ' = ' + n * u2 + ' miles.', 'Map B\'s towns are farther apart. The same length on paper can mean very different distances.'] });
    }
    var unit = L === 1 ? R.pick([5, 10]) : R.pick([5, 10, 100]), n2 = R.int(2, L === 1 ? 3 : 4), across = R.coin(), ks = R.sample(PLACEK, 3), a, b;
    if (across) { var r = R.int(0, 5), c0 = R.int(0, 5 - n2); a = [c0, r]; b = [c0 + n2, r]; } else { var c = R.int(0, 5), r0 = R.int(0, 5 - n2); a = [c, r0]; b = [c, r0 + n2]; }
    var places = [{ kind: ks[0], c: a[0], r: a[1] }, { kind: ks[1], c: b[0], r: b[1] }];
    var o; do { o = [R.int(0, 5), R.int(0, 5)]; } while (same(o, a) || same(o, b)); places.push({ kind: ks[2], c: o[0], r: o[1] });
    var unitW = unit === 1 ? 'mile' : 'miles', right = n2 * unit, choices = [n2, right, (n2 + 1) * unit].sort(function (x, y) { return x - y; }).map(function (x) { return x + ' miles'; });
    var viz = { name: 'gg-town', opts: quietTown({ places: places, labels: true, gridLines: true, scale: { blocks: 1, label: '1 square = ' + unit + ' ' + unitW }, label: 'A picture map with three places and a scale bar: one square is ' + unit + ' miles.' }) };
    return mcq('Use the scale bar: one square is ' + unit + ' miles. How far is it from ' + the(ks[0]) + ' to ' + the(ks[1]) + '?', right + ' miles', [], { viz: viz, order: choices,
      hint: 'Count the squares from one place to the other. Then skip-count by ' + unit + ' for each square.',
      steps: ['From ' + the(ks[0]) + ' to ' + the(ks[1]) + ' is ' + n2 + ' squares.', 'Each square is ' + unit + ' miles. Skip-count: ' + Array.apply(null, Array(n2)).map(function (_, i) { return (i + 1) * unit; }).join(', ') + '.', 'So it is ' + right + ' miles.'] });
  });

  /* ------------------------------------------------------------------ maps.address */
  var STREETS = ['Maple Street', 'Oak Lane', 'River Road', 'Pine Avenue', 'Elm Street', 'Hill Road'], TOWNS2 = ['Maple Town', 'River Bend', 'Pine Hill', 'Oak Valley', 'Cedar Glen'];
  function addr(R) {
    var st = R.pick(ML.geog.states()), a = { num: String(R.int(2, 98) * (R.coin() ? 1 : 10) + 1), street: R.pick(STREETS), town: R.pick(TOWNS2), state: st.n, zip: String(R.int(10000, 99999)) };
    a.html = '<p class="gg-address"><b>' + a.num + ' ' + a.street + '</b><br>' + a.town + ', ' + a.state + ' ' + a.zip + '</p>'; return a;
  }
  var APART = { num: 'house number', street: 'street', town: 'town', state: 'state', zip: 'ZIP code' };
  G('maps.address', function (R, ctx) {
    var L = ctx.level || 1, A = addr(R);
    if (L === 3) {
      if (R.coin()) return { q: READ + A.html + big('Which part of this address names the biggest place?'), a: mc([A.state, A.town, A.street], A.state), hint: 'Which is bigger: a street, a town or a state?',
        steps: ['A street is inside a town, and a town is inside a state.', 'So the biggest place is the state: ' + A.state + '.'] };
      return mcq('Two friends live on the same street, in the same town. Which part of their addresses is different?', 'The house number', ['The street', 'The state'], { hint: 'What tells the houses on one street apart?',
        steps: ['They share the street, the town, the state and the ZIP code.', 'Each house on a street has its own number, so the house number is different.'] });
    }
    var part = L === 1 ? R.pick(['street', 'town', 'state']) : R.pick(['num', 'zip', 'town', 'state']);
    var wrongs = L === 1 ? R.sample(['street', 'town', 'state', 'num'].filter(function (x) { return x !== part; }), 2) : ({ num: ['zip', 'street'], zip: ['num', 'state'], town: ['state', 'street'], state: ['town', 'zip'] })[part];
    return { q: READ + A.html + big('Which part of this address is the ' + APART[part] + '?'), a: mc([A[part]].concat(wrongs.map(function (x) { return A[x]; })), A[part]),
      hint: { num: 'The house number comes first, before the street.', zip: 'The ZIP code is the five numbers at the very end.', town: 'The town comes after the street, before the comma.', state: 'The state comes after the comma.', street: 'The street name comes right after the house number.' }[part],
      steps: ['An address goes from small to big: house number, street, then town, state and ZIP code.', 'The ' + APART[part] + ' here is ' + A[part] + '.'] };
  });

  /* ------------------------------------------------------------------ maps.nested-places */
  var NEST = ['Earth', 'North America', 'The United States', 'A state', 'A town or city', 'A neighborhood', 'A home'];
  G('maps.nested-places', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3) {
      var three = R.sample([1, 2, 3, 4, 5, 6], 3).sort(), ask = R.coin() ? 'biggest' : 'smallest', right = NEST[ask === 'biggest' ? three[0] : three[2]];
      return mcq('Which of these is the ' + ask + '?', right, three.map(function (i) { return NEST[i]; }).filter(function (x) { return x !== right; }), { hint: 'The bigger place holds the smaller one inside it.', steps: ['From big to small: ' + three.map(function (i) { return NEST[i].toLowerCase(); }).join(', then ') + '.', 'The ' + ask + ' is ' + right.toLowerCase() + '.'] });
    }
    var i = R.int(1, 6), pool = [1, 2, 3, 4, 5, 6].filter(function (j) { return j !== i && (L === 1 ? Math.abs(j - i) >= 2 : Math.abs(j - i) === 1); });
    if (pool.length < 2) pool = [1, 2, 3, 4, 5, 6].filter(function (j) { return j !== i && Math.abs(j - i) <= 2; });
    var wr = R.sample(pool, 2);
    return mcq('Places fit inside bigger places. Which place goes in the box with the question mark?', NEST[i], wr.map(function (j) { return NEST[j]; }), { viz: { name: 'gg-nested', opts: { ask: i, quiet: true, interactive: false } },
      hint: 'Read the boxes from the outside in. What fits between ' + NEST[i - 1].toLowerCase() + (i < 6 ? ' and ' + NEST[i + 1].toLowerCase() : '') + '?',
      steps: ['The box outside it is ' + NEST[i - 1].toLowerCase() + '.', i < 6 ? 'The box inside it is ' + NEST[i + 1].toLowerCase() + '.' : 'It is the smallest box.', 'So the question mark is ' + NEST[i].toLowerCase() + '.'] });
  });

  /* ------------------------------------------------------------------ maps.city-suburb-rural */
  var CSR = {
    city: [['Tall buildings stand close together, and busy streets are full of buses, cars and people.', 1], ['Many thousands of people live in apartment buildings, and there are stores on almost every block.', 1], ['Subway trains run under the streets, and lots of people work in tall office buildings.', 2]],
    suburb: [['Streets of houses with yards, near a big city. Many people drive or ride the train into the city for work.', 1], ['Houses, schools and shopping centers spread out just outside a big city.', 2], ['A quieter town of homes next to a city, with parks and driveways.', 2]],
    rural: [['Farms and fields stretch far, and the houses are far apart.', 1], ['Cows graze in a pasture, and the nearest neighbor lives down a long dirt road.', 1], ['A small town with one main street, surrounded by open land and woods.', 2]]
  };
  G('maps.city-suburb-rural', function (R, ctx) {
    var L = ctx.level || 1, ord = ['A city', 'A suburb', 'A rural place'];
    if (L === 3) return tfq(R.pick([['Rural means a place with few people and lots of open land.', true, 'Farms, fields and small towns are rural.'], ['Rural means a place that is very far from everything.', false, 'Rural means few people and lots of open space; a rural place can be close to a town.'],
      ['A suburb is a town of homes near a big city.', true, 'Suburbs are next to cities.'], ['Every town is a city.', false, 'A city is a big, busy place with many people. Many towns are smaller.'], ['A big city has many more people than a rural place of the same size.', true, 'Cities are crowded; rural places have people spread far apart.']]), 'City: big and busy. Suburb: homes near a city. Rural: few people, lots of open land.');
    if (R.chance(0.5)) {
      var SEE = { city: ['skyscrapers', 'a subway station', 'crowded sidewalks', 'tall apartment buildings', 'taxis and city buses'], suburb: ['rows of houses with yards and driveways', 'a quiet street of homes near a big city', 'a shopping center with a big parking lot'], rural: ['a tractor in a wide field', 'a barn and a silo', 'cows in a pasture', 'a long dirt road between farms'] };
      var t0 = R.pick(['city', 'rural', L === 1 ? 'city' : 'suburb']), w0 = Object.keys(SEE).filter(function (x) { return x !== t0; }).map(function (x) { return R.pick(SEE[x]); }), ttl = { city: 'a city', suburb: 'a suburb', rural: 'a rural place' }[t0];
      var r0 = R.pick(SEE[t0]);
      return mcq('Which would you most likely see in ' + ttl + '?', Cap(r0), w0.map(Cap), { hint: 'Picture the place. Is it crowded, full of homes near a city, or open land?', steps: [Cap(r0) + ' fits ' + ttl + '.'] });
    }
    var k = R.pick(['city', 'suburb', 'rural']), it = R.pick(CSR[k].filter(function (x) { return x[1] <= L; })), right = { city: 'A city', suburb: 'A suburb', rural: 'A rural place' }[k];
    return mcq(it[0] + ' What kind of place is this?', right, [], { order: ord, hint: 'Are there many people close together, homes near a city, or lots of open land?',
      steps: [{ city: 'Many people, tall buildings and busy streets mean a city.', suburb: 'Homes with yards next to a big city mean a suburb.', rural: 'Farms, fields, open land and few people mean a rural place.' }[k]] });
  });

  /* ------------------------------------------------------------------ maps.states-of-us */
  var BIGSTATES = ['TX', 'CA', 'FL', 'AK', 'HI', 'ME', 'MI'];
  G('maps.states-of-us', function (R, ctx) {
    var L = ctx.level || 1, Gg = ML.geog;
    if (L === 1) {
      if (R.coin()) return mcq('How many states are in the United States?', '50', [], { order: ['7', '50', '100'], viz: { name: 'gg-map', opts: { map: 'us', quiet: true, interactive: false, label: 'A map of the United States with each state in its own color.' } },
        hint: 'Count by tens: 10, 20, 30, 40, ...', steps: ['The United States has 50 states.', 'Each color on the map is one state.'] });
      var s0 = Gg.state(R.pick(['TX', 'CA', 'MT', 'CO', 'NY', 'GA', 'IL', 'AZ']));
      return mcq('The orange shape is one part of the United States. What is it?', 'A state', ['A country', 'A continent'], { viz: { name: 'gg-map', opts: { map: 'us', highlight: [s0.id], color: 'plain', quiet: true, interactive: false } },
        hint: 'The United States is a country made of 50 smaller parts.', steps: ['The United States is one country.', 'It is made of 50 states. The orange shape is one state: ' + s0.n + '.'] });
    }
    if (L === 2 && R.coin()) return mcq('Which two states do not touch any of the other 48 states?', 'Alaska and Hawaii', ['Texas and Florida', 'Maine and California'], { viz: { name: 'gg-map', opts: { map: 'us', quiet: true, interactive: false } },
      hint: 'On this map, two states are drawn in little boxes at the bottom left.', steps: ['Alaska is far to the northwest, next to Canada.', 'Hawaii is a group of islands in the Pacific Ocean.', 'Neither touches the other 48 states.'] });
    var want = R.pick(BIGSTATES), others = R.sample(BIGSTATES.filter(function (x) { return x !== want && !(want === 'AK' && x === 'HI') && !(want === 'HI' && x === 'AK'); }), 2), ids = R.shuffle([want].concat(others)), mark = {};
    ids.forEach(function (id, i) { mark[id] = LET[i]; });
    var hints = { TX: 'Texas is very big and sits at the bottom, in the middle.', CA: 'California is long and runs along the Pacific coast on the left.', FL: 'Florida sticks out into the water at the bottom right.', AK: 'Alaska is the biggest state, drawn in a box at the bottom left.', HI: 'Hawaii is a chain of islands drawn in a box at the bottom left.', ME: 'Maine is at the very top right corner.', MI: 'Michigan looks like a mitten, between big lakes.' };
    return { q: READ + big('Which letter is on ' + Gg.state(want).n + '?'), viz: { name: 'gg-map', opts: { map: 'us', mark: mark, color: 'plain', quiet: true, interactive: false } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: ids.indexOf(want), keep: true }, hint: hints[want], steps: [hints[want], 'It has the letter ' + mark[want] + '.'] };
  });

  /* ------------------------------------------------------------------ maps.capital-city */
  G('maps.capital-city', function (R, ctx) {
    var L = ctx.level || 1, Gg = ML.geog;
    if (L === 1) return mcq('The star shows the capital of the United States. What city is it?', 'Washington, D.C.', ['New York City', 'Los Angeles'], { viz: { name: 'gg-map', opts: { map: 'us', capitals: ['DC'], capLabels: false, color: 'plain', quiet: true, interactive: false } },
      hint: 'The capital is where the country\'s government meets. It is named for the first President.', steps: ['The capital of the United States is Washington, D.C.', 'New York City is bigger, but it is not the capital.'] });
    if (L === 2) return tfq(R.pick([['The biggest city in a country is always its capital.', false, 'New York City is the biggest city in the United States (about 8.8 million people in 2020), but the capital is Washington, D.C.'],
      ['Each of the 50 states has its own capital city.', true, 'A state\'s capital is where its government meets.'], ['The capital of the United States is Washington, D.C.', true, 'The country\'s government meets there.'],
      ['New York City is the capital of the United States.', false, 'New York City is the biggest city, but the capital is Washington, D.C.']]), 'A capital is where the government meets. It is not always the biggest city.');
    var s = R.pick(Gg.states()), nb = Gg.state(R.pick(s.nb.filter(function (x) { return x !== 'DC'; }).concat(['TX', 'NY', 'CA']).filter(function (x) { return x !== s.id; })));
    return mcq('The star shows the capital of ' + s.n + '. Which city is the capital?', s.cap, [s.city, nb.cap], { viz: { name: 'gg-map', opts: { map: 'us', highlight: [s.id], capitals: [s.id], capLabels: false, color: 'plain', quiet: true, interactive: false } },
      hint: 'A capital is not always the biggest or best-known city.', steps: ['The capital of ' + s.n + ' is ' + s.cap + '.', s.city + ' is a well-known city in ' + s.n + ', but it is not the capital.', nb.cap + ' is the capital of ' + nb.n + '.'] });
  });

  /* ------------------------------------------------------------------ maps.north-america */
  var NAM = { CAN: 'Canada', USA: 'The United States', MEX: 'Mexico' };
  G('maps.north-america', function (R, ctx) {
    var L = ctx.level || 1, ids = R.shuffle(['CAN', 'USA', 'MEX']), mark = {}; ids.forEach(function (id, i) { mark[id] = LET[i]; });
    var mapv = { name: 'gg-map', opts: { region: ['CAN', 'USA', 'MEX'], mark: mark, color: 'plain', dots: false, quiet: true, interactive: false, label: 'A map of North America with three countries marked by letters.' } };
    if (L === 1) { var w = R.pick(['CAN', 'MEX', 'USA']);
      return { q: READ + big('Which letter is on ' + NAM[w].replace('The', 'the') + '?'), viz: mapv, a: { t: 'mc', choices: LET.slice(0, 3), v: ids.indexOf(w), keep: true },
        hint: 'Canada is at the top (north), Mexico at the bottom (south), and the United States in between.', steps: ['North is at the top of the map.', { CAN: 'Canada is the big country to the north.', USA: 'The United States is in the middle.', MEX: 'Mexico is to the south.' }[w], 'It has the letter ' + mark[w] + '.'] }; }
    if (L === 2) {
      if (R.coin()) return mcq('Which continent is Mexico on?', 'North America', ['South America', 'Europe'], { viz: { name: 'gg-map', opts: { region: ['CAN', 'MEX', 'COL', 'BRA'], highlight: ['MEX'], color: 'plain', quiet: true, interactive: false } }, hint: 'Mexico shares a border with the United States.',
        steps: ['Mexico is just south of the United States.', 'Canada, the United States and Mexico are all on the continent of North America.'] });
      var s = R.coin();
      return mcq('Which country is just ' + (s ? 'south' : 'north') + ' of the United States?', s ? 'Mexico' : 'Canada', [s ? 'Canada' : 'Mexico', 'Brazil'], { viz: mapv, hint: 'North is up on the map; south is down.',
        steps: ['On the map, north is up and south is down.', s ? 'Mexico is below (south of) the United States.' : 'Canada is above (north of) the United States.'] });
    }
    if (R.coin()) { var qq = R.pick([['Which of these three countries is the biggest?', 'Canada', ['Mexico', 'The United States'], 'Canada is the biggest country in North America and the second biggest in the world.'],
      ['Which ocean is along the west coast of the United States?', 'The Pacific Ocean', ['The Atlantic Ocean', 'The Arctic Ocean'], 'The Pacific Ocean is to the west; the Atlantic Ocean is to the east.'],
      ['Which ocean is along the east coast of the United States?', 'The Atlantic Ocean', ['The Pacific Ocean', 'The Indian Ocean'], 'The Atlantic Ocean is to the east; the Pacific Ocean is to the west.'],
      ['Which country shares the longest border with the United States?', 'Canada', ['Mexico', 'Brazil'], 'The border with Canada, including Alaska\'s, is the longest border between two countries in the world.']]);
      return mcq(qq[0], qq[1], qq[2], { viz: { name: 'gg-map', opts: { region: ['CAN', 'USA', 'MEX'], color: 'political', labels: true, oceans: true, quiet: true, interactive: false, dots: false } }, hint: 'Look at the map.', steps: [qq[3]] }); }
    var q = R.pick([['Canada', 'the United States', 'North'], ['Mexico', 'the United States', 'South'], ['the United States', 'Canada', 'South'], ['the United States', 'Mexico', 'North']]);
    return mcq('Which direction is ' + q[0] + ' from ' + q[1] + '?', q[2], [], { order: ['North', 'East', 'South', 'West'], viz: mapv, hint: 'Find ' + q[1] + ' first. Is ' + q[0] + ' above it or below it?',
      steps: ['North is at the top of the map.', Cap(q[0]) + ' is ' + (q[2] === 'North' ? 'above' : 'below') + ' ' + q[1] + ', so it is to the ' + q[2].toLowerCase() + '.'] });
  });

  /* ------------------------------------------------------------------ land and water: the two landform scenes */
  var LF = function () { return ML.geog.LANDFORMS; };
  var SCENE_OF = { ocean: 'coast', island: 'coast', peninsula: 'coast', isthmus: 'coast', strait: 'coast', bay: 'coast', cape: 'coast', coast: 'coast', lake: 'coast', river: 'coast', source: 'coast', mouth: 'coast', delta: 'coast', tributary: 'coast',
    mountain: 'land', glacier: 'land', volcano: 'land', hill: 'land', valley: 'land', plain: 'land', plateau: 'land', canyon: 'land', desert: 'land', waterfall: 'land', forest: 'land' };
  function sceneAsk(R, k, wrongs, q, hint, extra, scene) {
    var D = LF()[k], v = { name: 'gg-landforms', opts: { scene: scene || SCENE_OF[k], ask: k, quiet: true, interactive: false } };
    return mcq(q || 'What is at the question mark?', Cap(art(D.n)), wrongs.map(function (w) { return Cap(art(LF()[w].n)); }), { viz: v, hint: hint || 'Look closely at the shape around the question mark.',
      steps: ['The question mark is on ' + art(D.n) + ': ' + D.d + '.'].concat(extra || []) });
  }
  // letters on three features of a scene: "Which letter is on the bay?"
  function sceneMarks(R, k, others, scene, hint) {
    var D = LF()[k], marked = R.shuffle([k].concat(others)), marks = {}; marked.forEach(function (x, i) { marks[x] = LET[i]; });
    return { q: READ + big('Which letter is on ' + art(D.n) + '?'), viz: { name: 'gg-landforms', opts: { scene: scene || SCENE_OF[k], marks: marks, quiet: true, interactive: false } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: marked.indexOf(k), keep: true }, hint: hint || (Cap(art(D.n)) + ' is ' + D.d + '.'),
      steps: [Cap(art(D.n)) + ' is ' + D.d + '.', 'Letter ' + marks[k] + ' is on ' + art(D.n) + '.'] };
  }
  function defAsk(R, k, wrongs) { var D = LF()[k]; return mcq('What do we call ' + D.d + '?', Cap(art(D.n)), wrongs.map(function (w) { return Cap(art(LF()[w].n)); }), { hint: 'Picture it in your head. What is its name?', steps: [Cap(art(D.n)) + ' is ' + D.d + '.'] }); }

  /* ------------------------------------------------------------------ maps.land-and-water */
  var LANDWATER = ['ocean', 'island', 'peninsula', 'strait', 'bay', 'lake', 'mountain', 'plain', 'desert', 'forest', 'plateau', 'hill', 'cape', 'isthmus', 'canyon', 'valley', 'volcano', 'delta'];
  G('maps.land-and-water', function (R, ctx) {
    var L = ctx.level || 1;
    var gl = { name: 'gg-globe', opts: { center: [R.pick([-160, -120, -30, 20, 80, 150]), R.pick([-20, 0, 20])], color: 'plain', quiet: true, interactive: false, buttons: false } };
    if (L === 1) return R.coin() ? mcq('Look at the globe. Does Earth have more land or more water?', 'More water', ['More land', 'The same'], { order: ['More land', 'More water', 'The same'], viz: gl,
      hint: 'Which color covers most of the globe: blue or tan?', steps: ['Blue is water and tan is land.', 'Most of Earth is covered by water, mostly ocean.'] })
      : mcq('On this globe, what color is the water?', 'Blue', ['Tan', 'Green'], { viz: gl, hint: 'Look at the biggest part of the globe.', steps: ['On this globe, water is blue and land is tan.', 'Turn a real globe and you will see blue almost everywhere.'] });
    if (L === 2 && R.coin()) return mcq('Where is most of Earth\'s water?', 'In the oceans', ['In rivers', 'In lakes'], { hint: 'Think of the biggest bodies of water.', steps: ['The oceans hold almost all of Earth\'s water: about 96 out of every 100 drops.', 'Rivers and lakes hold only a tiny part.'] });
    if (L === 2) return mcq('About how much of Earth\'s surface is covered by water?', 'About 7 out of every 10 parts', ['About 3 out of every 10 parts', 'About half'], { hint: 'Most of Earth is ocean: much more than half.',
      steps: ['Scientists measure that about 71 out of every 100 parts of Earth\'s surface are water.', 'That is about 7 out of every 10 parts, much more than half.'] });
    if (R.coin()) { var wat = R.coin(), sc2 = R.pick(['coast', 'land']), POOL = { coast: { water: ['ocean', 'strait', 'bay', 'lake'], land: ['island', 'peninsula', 'cape', 'isthmus', 'delta'] }, land: { water: ['lake', 'river', 'waterfall'], land: ['mountain', 'plain', 'desert', 'forest', 'plateau', 'hill', 'canyon', 'valley', 'volcano'] } }[sc2];
      var one = R.pick(POOL[wat ? 'water' : 'land']), two = R.sample(POOL[wat ? 'land' : 'water'], 2);
      var pr = sceneMarks(R, one, two, sc2, 'Blue is water. Green, tan and gray are land.'); pr.q = READ + big('Only one letter is on ' + (wat ? 'water' : 'land') + '. Which letter?');
      pr.steps = [Cap(art(LF()[one].n)) + ' is ' + LF()[one].d + ', so it is ' + (wat ? 'water' : 'land') + '.', 'The other two letters are on ' + two.map(function (x) { return art(LF()[x].n); }).join(' and ') + ', which are ' + (wat ? 'land' : 'water') + '.', 'The answer is letter ' + pr.viz.opts.marks[one] + '.']; return pr; }
    var k = R.pick(LANDWATER), isW = LF()[k].k === 'water';
    return mcq('Is the question mark on land or on water?', isW ? 'Water' : 'Land', [], { order: ['Land', 'Water'], viz: { name: 'gg-landforms', opts: { scene: SCENE_OF[k], ask: k, quiet: true, interactive: false } },
      hint: 'Blue is water. Green, tan and gray are land.', steps: ['The question mark is on ' + art(LF()[k].n) + ', ' + LF()[k].d + '.', 'So it is ' + (isW ? 'water' : 'land') + '.'] });
  });

  /* ------------------------------------------------------------------ maps.mountains-hills-valleys */
  G('maps.mountains-hills-valleys', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['mountain', 'hill', 'valley']);
    if (L === 1) return sceneAsk(R, k, R.sample(['lake', 'desert', 'forest', 'river'], 2), null, 'Is it very high, a little high and round, or low between high places?');
    if (L === 2) return sceneAsk(R, k, ['mountain', 'hill', 'valley', 'river'].filter(function (x) { return x !== k; }).slice(0, k === 'valley' ? 3 : 2).slice(k === 'valley' ? 1 : 0), null, 'Mountains are very high. Hills are lower and rounder. Valleys are the low land between them.',
      k === 'valley' ? ['A river often runs along a valley\'s bottom, but the valley is the low land itself.'] : []);
    if (R.coin()) return defAsk(R, k, ['mountain', 'hill', 'valley'].filter(function (x) { return x !== k; }));
    return tfq(R.pick([['A valley is the same thing as a river.', false, 'A valley is low land. A river often flows through it.'], ['A hill is lower and rounder than a mountain.', true, 'Mountains are higher and steeper.'],
      ['Every bump in the ground is a mountain.', false, 'A small bump is not a mountain. Mountains are very high land with steep sides.'], ['A valley is low land between hills or mountains.', true, 'That is what a valley is.']]), 'High, higher, low: hill, mountain, valley.');
  });

  /* ------------------------------------------------------------------ maps.plains-plateaus */
  G('maps.plains-plateaus', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['plain', 'plateau']);
    if (L === 1) return sceneAsk(R, k, R.sample(['lake', 'volcano', 'river', 'forest'], 2), null, 'Is the flat land low, or high up with steep sides?');
    if (L === 2) { var kk = R.pick(['plain', 'plateau', 'canyon']); return sceneAsk(R, kk, ['plain', 'plateau', 'canyon', 'mountain'].filter(function (x) { return x !== kk; }).slice(0, 2), null, 'A plain is flat and low. A plateau is flat on top but high, like a tabletop. A canyon is a deep cut with steep sides.'); }
    if (R.chance(0.4)) { var k3 = R.pick(['plain', 'plateau', 'canyon']); return defAsk(R, k3, ['plain', 'plateau', 'canyon', 'valley'].filter(function (x) { return x !== k3; }).slice(0, 2)); }
    return tfq(R.pick([['All flat land is a plain.', false, 'A plateau is flat too, but it is high above the land around it.'], ['A plateau is flat land high up, with steep sides.', true, 'Like a giant tabletop.'], ['A plain is wide, flat, low land.', true, 'Many farms are on plains.'], ['A plateau is a kind of deep valley.', false, 'A plateau is high and flat; a valley is low.'],
      ['A plateau is higher than the plain around it.', true, 'A plateau rises high above the land around it, with steep sides.'], ['Many farms are on wide, flat plains.', true, 'Flat, low land is easy to plow and plant.'], ['A canyon is a deep, narrow valley with steep sides.', true, 'Rivers often cut canyons, sometimes into plateaus.'],
      ['The Great Plains in the middle of the United States are mostly flat land.', true, 'They are wide, flat plains with farms and ranches.'], ['A plateau is sometimes called a tableland.', true, 'Its flat top and steep sides make it look like a table.'], ['A plain has steep sides like a table.', false, 'That describes a plateau. A plain is flat and low.']]), 'Plain: flat and low. Plateau: flat and high.');
  });

  /* ------------------------------------------------------------------ maps.island-peninsula */
  var REAL_IP = [['FL', 'us', ['FL', 'GA', 'AL', 'SC'], 'peninsula', 'Florida'], ['ITA', 'world', ['ITA', 'FRA', 'CHE', 'AUT', 'SVN', 'HRV', 'TUN'], 'peninsula', 'Italy'], ['KORP', 'world', ['KOR', 'PRK', 'JPN'], 'peninsula', 'Korea'],
    ['ESPP', 'world', ['ESP', 'PRT', 'FRA', 'MAR'], 'peninsula', 'Spain and Portugal'], ['GRL', 'world', ['GRL', 'CAN', 'ISL'], 'island', 'Greenland'], ['CUB', 'world', ['CUB', 'JAM', 'BHS', 'HTI'], 'island', 'Cuba'],
    ['MDG', 'world', ['MDG', 'MOZ'], 'island', 'Madagascar'], ['ISL', 'world', ['ISL', 'GBR', 'NOR'], 'island', 'Iceland'], ['LKA', 'world', ['LKA', 'IND'], 'island', 'Sri Lanka']];
  G('maps.island-peninsula', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['island', 'peninsula']);
    if (L === 1) return R.coin() ? sceneAsk(R, k, ['lake', 'river'], null, 'Is there water all around it, or on three sides?') : sceneMarks(R, k, R.sample(['lake', 'ocean', 'river', 'bay'], 2), 'coast', k === 'island' ? 'An island has water all around it.' : 'A peninsula has water on three sides.');
    if (L === 2 && R.coin()) return sceneMarks(R, k, [k === 'island' ? 'peninsula' : 'island', R.pick(['isthmus', 'cape', 'lake'])], 'coast', 'Follow the coast with your finger. Does the land join the mainland?');
    if (L === 2) return sceneAsk(R, k, ['island', 'peninsula', 'isthmus'].filter(function (x) { return x !== k; }), null, 'Follow the coast with your finger. Does the land join the mainland?',
      [k === 'peninsula' ? 'It joins the mainland on one side, so it is not an island.' : 'Water goes all the way around it, so it is not a peninsula.']);
    var P = R.pick(REAL_IP), hi = P[0] === 'KORP' ? ['KOR', 'PRK'] : P[0] === 'ESPP' ? ['ESP', 'PRT'] : [P[0]], isP = P[3] === 'peninsula';
    return mcq('The orange land is ' + P[4] + '. Is the orange land an island or a peninsula?', isP ? 'A peninsula' : 'An island', [], { order: ['An island', 'A peninsula'],
      viz: { name: 'gg-map', opts: { map: P[1], region: P[2], highlight: hi, color: 'plain', dots: false, quiet: true, interactive: false, disputedNote: false } },
      hint: 'Is there water all the way around, or does it join a bigger piece of land?',
      steps: [isP ? P[4] + (P[0] === 'ESPP' ? ' share land' : ' has land') + ' with water on three sides, joined to the mainland on one side.' : P[4] + ' has water all the way around it.', 'So it is ' + (isP ? 'a peninsula' : 'an island') + '.'] });
  });

  /* ------------------------------------------------------------------ maps.oceans-lakes-rivers */
  G('maps.oceans-lakes-rivers', function (R, ctx) {
    var L = ctx.level || 1, k = R.pick(['ocean', 'lake', 'river']);
    var sc = k === 'ocean' ? 'coast' : R.pick(['coast', 'land']);
    if (L === 1) return R.coin() ? sceneAsk(R, k, sc === 'coast' ? R.sample(['mountain', 'island', 'peninsula'], 2) : R.sample(['mountain', 'forest', 'desert', 'hill'], 2), null, 'Is it huge salty water, water with land all around, or water flowing across the land?', null, sc)
      : sceneMarks(R, k, k === 'ocean' ? R.sample(['island', 'peninsula', 'lake'], 2) : sc === 'coast' ? R.sample(['island', 'peninsula', 'ocean'], 2) : R.sample(['mountain', 'forest', 'desert'], 2), sc);
    if (L === 2) return R.coin() ? sceneAsk(R, k, ['ocean', 'lake', 'river'].filter(function (x) { return x !== k; }), null, 'An ocean is huge and salty. A lake has land all around it. A river flows.', null, sc)
      : sceneMarks(R, k, k === 'ocean' ? ['lake', 'river'] : [k === 'lake' ? 'river' : 'lake', sc === 'coast' ? 'ocean' : 'waterfall'], sc, 'An ocean is huge and salty. A lake has land all around it. A river flows.');
    return tfq(R.pick([['Ocean water is salty.', true, 'All the oceans are salt water.'], ['All lakes are small.', false, 'Some lakes are huge. You cannot see across Lake Superior, one of the Great Lakes.'],
      ['A lake has land all around it.', true, 'That is what makes it a lake.'], ['A river is water that flows across the land.', true, 'Rivers flow downhill, toward a lake or the sea.'], ['A lake and an ocean are the same thing.', false, 'An ocean is a huge body of salt water; a lake is water with land all around it, and most lakes are fresh water.'],
      ['Most lakes and rivers have fresh water, not salt water.', true, 'Most do, though a few lakes, like the Great Salt Lake, are salty.']]), 'Ocean: huge and salty. Lake: land all around. River: flowing water.');
  });

  /* ------------------------------------------------------------------ maps.river-parts */
  G('maps.river-parts', function (R, ctx) {
    var L = ctx.level || 1;
    var sc = R.pick(['coast', 'land']);
    if (L === 1) { var k = R.pick(['source', 'mouth']); return R.coin() ? sceneAsk(R, k, [k === 'source' ? 'mouth' : 'source', sc === 'coast' ? 'island' : 'mountain'], 'What part of the river is at the question mark?', 'The source is where a river begins. The mouth is where it ends.', null, sc)
      : sceneMarks(R, k, [k === 'source' ? 'mouth' : 'source', sc === 'coast' ? 'island' : 'mountain'], sc, k === 'source' ? 'The source is where the river begins, high up.' : 'The mouth is where the river ends, at a lake or the sea.'); }
    if (L === 2) { var k2 = R.pick(['source', 'mouth', 'tributary']); return R.coin() ? sceneAsk(R, k2, ['source', 'mouth', 'tributary'].filter(function (x) { return x !== k2; }), 'What part of the river is at the question mark?', 'Follow the river from where it starts up high to where it ends.', null, sc)
      : sceneMarks(R, k2, ['source', 'mouth', 'tributary'].filter(function (x) { return x !== k2; }), sc); }
    if (R.coin()) return sceneAsk(R, 'delta', ['mouth', 'island'], 'Mud and sand build up where the river reaches the sea. What is the land at the question mark?', 'It is new flat land made by the river.');
    return tfq(R.pick([['Rivers always flow toward the south.', false, 'Rivers flow downhill, in any direction. The Nile in Africa flows north.'], ['A river flows downhill, from its source to its mouth.', true, 'Water always runs downhill.'],
      ['A tributary is a smaller river that flows into a bigger river.', true, 'Many tributaries make a big river bigger.'], ['The mouth of a river is where the river begins.', false, 'The source is where a river begins. The mouth is where it ends.'],
      ['On a map, rivers always flow from the bottom to the top.', false, 'Rivers flow downhill, which can be any direction on a map.']]), 'Source: the start. Mouth: the end. Water flows downhill.');
  });

  /* ------------------------------------------------------------------ maps.bays-gulfs */
  G('maps.bays-gulfs', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) return R.coin() ? sceneAsk(R, 'bay', R.sample(['mountain', 'island', 'river'], 2), null, 'Look at the water that curves into the land.') : sceneMarks(R, R.pick(['bay', 'coast']), R.sample(['island', 'lake', 'river'], 2), 'coast');
    if (L === 2 && R.coin()) { var km = R.pick(['bay', 'cape', 'coast']); return sceneMarks(R, km, km === 'bay' ? ['lake', R.pick(['strait', 'cape'])] : km === 'cape' ? ['bay', 'peninsula'] : ['bay', 'lake'], 'coast'); }
    if (L === 2) { var k = R.pick(['bay', 'bay', 'cape']); return sceneAsk(R, k, k === 'bay' ? ['lake', 'river'] : ['bay', 'lake'], null, 'Does the water open to the sea on one side, or is it closed in by land?', k === 'bay' ? ['A lake is closed in by land on every side. A bay opens to the sea.'] : []); }
    if (R.coin()) return mcq('What do we call a very large bay?', 'A gulf', ['A lake', 'A river'], { hint: 'Its name starts with G.', steps: ['A gulf is a very large bay: part of the sea that reaches into the land.'] });
    if (R.coin()) { var kd = R.pick(['bay', 'cape', 'coast', 'strait']); return defAsk(R, kd, R.sample(['bay', 'cape', 'coast', 'strait', 'lake', 'island'].filter(function (x) { return x !== kd; }), 2)); }
    return tfq(R.pick([['A bay is closed in by land on every side.', false, 'A bay opens to the sea on one side. Water closed in by land on every side is a lake.'], ['A coast is where the land meets the sea.', true, 'Beaches and cliffs are on coasts.'],
      ['A gulf is a very large bay.', true, 'Gulfs and bays both curve into the land; gulfs are usually bigger.'], ['A bay is part of the sea that curves into the land.', true, 'That is what a bay is.'],
      ['A cape is a point of land that sticks out into the water.', true, 'Ships sail around capes.'], ['A coast is far from the sea.', false, 'A coast is the land right along the sea.'], ['Boats often stay in bays because the water is calmer there.', true, 'Land around a bay blocks some of the wind and waves.'], ['Hudson Bay in Canada is a bay because it opens to the ocean.', true, 'It is a huge bay that opens to the ocean through waterways to the north.']]), 'Bay: the sea curving into the land, open on one side.');
  });

  /* ------------------------------------------------------------------ maps.landform-pairs */
  var PAIRS = [['island', 'lake'], ['peninsula', 'bay'], ['isthmus', 'strait']];
  G('maps.landform-pairs', function (R, ctx) {
    var L = ctx.level || 1, P = R.pick(PAIRS), fl = R.coin(), a = fl ? P[1] : P[0], b = fl ? P[0] : P[1];
    if (L === 1) { var wr = R.sample(['river', 'mountain', 'ocean', 'plain'].filter(function (x) { return x !== a; }), 2);
      return mcq('What is the opposite of ' + art(LF()[a].n) + '?', Cap(art(LF()[b].n)), wr.map(function (x) { return Cap(art(LF()[x].n)); }), { hint: 'Swap land and water.',
        steps: [Cap(art(LF()[a].n)) + ' is ' + LF()[a].d + '.', Cap(art(LF()[b].n)) + ' is ' + LF()[b].d + '.', 'Land and water have switched places, so they are opposites.'] }); }
    if (L === 2) { var others = PAIRS.filter(function (p) { return p !== P; }).map(function (p) { return LF()[a].k === 'land' ? p[1] : p[0]; });
      return mcq(Cap(art(LF()[a].n)) + ' is ' + LF()[a].d + '. Which is its opposite?', Cap(art(LF()[b].n)), others.map(function (x) { return Cap(art(LF()[x].n)); }), { hint: 'Find the ' + (LF()[a].k === 'land' ? 'water' : 'land') + ' shape that matches it.',
        steps: [Cap(art(LF()[b].n)) + ' is ' + LF()[b].d + '.', 'It is the same shape with land and water switched.'] }); }
    var cands = ['island', 'lake', 'peninsula', 'bay', 'isthmus', 'strait'].filter(function (x) { return x !== a && x !== b; }), marked = R.shuffle([b].concat(R.sample(cands, 2))), marks = {};
    marked.forEach(function (x, i) { marks[x] = LET[i]; });
    return { q: READ + big('The opposite of ' + art(LF()[a].n) + ' is ' + art(LF()[b].n) + '. Which letter is on ' + art(LF()[b].n) + '?'), viz: { name: 'gg-landforms', opts: { scene: 'coast', marks: marks, quiet: true, interactive: false } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: marked.indexOf(b), keep: true }, hint: Cap(art(LF()[b].n)) + ' is ' + LF()[b].d + '.',
      steps: [Cap(art(LF()[b].n)) + ' is ' + LF()[b].d + '.', 'Letter ' + marks[b] + ' is on ' + art(LF()[b].n) + '.'] };
  });

  /* ------------------------------------------------------------------ maps.deserts-forests-grasslands */
  var DFG = { desert: ['desert', 'a place that gets very little rain'], grassland: ['grassland', 'wide open land covered with grass'], deciduous: ['forest', 'a large area covered with trees'] };
  G('maps.deserts-forests-grasslands', function (R, ctx) {
    var L = ctx.level || 1, ks = Object.keys(DFG), k = R.pick(ks);
    if (L === 1 && R.coin()) { var DD = { desert: ['Cactus plants grow, and it almost never rains.', 'Sand dunes stretch as far as you can see, and rain is very rare.', 'The ground is dry and rocky, and only a little rain falls all year.'], grassland: ['Tall grass waves in the wind, and there are only a few trees.', 'Bison or zebras graze on open, grassy land.', 'Wide, open land is covered with grass and wildflowers.'], deciduous: ['Tall trees grow close together, and their leaves make shade.', 'Squirrels and owls live among thousands of trees.', 'You walk on a path under tall trees all around you.'] };
      var dsc = R.pick(DD[k]); return mcq(dsc + ' What kind of place is this?', Cap(art(DFG[k][0])), ks.filter(function (x) { return x !== k; }).map(function (x) { return Cap(art(DFG[x][0])); }), { hint: 'Think about rain, grass and trees.', steps: [Cap(art(DFG[k][0])) + ' is ' + DFG[k][1] + '.'] }); }
    if (L === 1) return mcq('What do we call ' + DFG[k][1] + '?', Cap(art(DFG[k][0])), ks.filter(function (x) { return x !== k; }).map(function (x) { return Cap(art(DFG[x][0])); }), { hint: 'Think about rain, grass and trees.', steps: [Cap(art(DFG[k][0])) + ' is ' + DFG[k][1] + '.'] });
    if (L === 2) { var order = R.shuffle(ks);
      return { q: READ + big('Which picture shows ' + art(DFG[k][0]) + '?'), viz: { name: 'gg-biome', opts: { biomes: order, quiet: true, interactive: false } }, a: { t: 'mc', choices: LET.slice(0, 3).map(function (l) { return 'Picture ' + l; }), v: order.indexOf(k), keep: true },
        hint: { desert: 'Look for dry ground and very few plants.', grassland: 'Look for wide open grass with few trees.', deciduous: 'Look for lots of trees.' }[k], steps: [Cap(art(DFG[k][0])) + ' is ' + DFG[k][1] + '.', 'That is picture ' + LET[order.indexOf(k)] + '.'] }; }
    if (R.coin()) { var FIND = { desert: ['a cactus', 'sand dunes', 'a camel', 'dry, cracked ground'], grassland: ['tall grass and wildflowers', 'a herd of bison', 'zebras grazing'], deciduous: ['tall trees with falling leaves', 'a woodpecker on a tree trunk', 'acorns under an oak tree'] };
      var place = R.pick(ks), it2 = R.pick(FIND[place]), wr2 = ks.filter(function (x) { return x !== place; }).map(function (x) { return Cap(R.pick(FIND[x])); });
      return mcq('Which would you most likely find in ' + art(DFG[place][0]) + '?', Cap(it2), wr2, { hint: 'Think about how much rain, grass and trees each place has.', steps: [Cap(it2) + ' fits ' + art(DFG[place][0]) + ', ' + DFG[place][1] + '.'] }); }
    return tfq(R.pick([['Every desert is hot and sandy.', false, 'A desert is any place with very little rain or snow. Some deserts are cold, rocky or icy.'], ['Antarctica is a desert.', true, 'Very little snow falls there each year, so it counts as a desert, the biggest one on Earth.'],
      ['Some deserts get cold winters.', true, 'Many deserts are cold in winter, like the Gobi Desert in Asia.'], ['A grassland is covered with tall trees.', false, 'A grassland is open land covered with grass, with few trees.'], ['A forest is a large area covered with trees.', true, 'That is what a forest is.'],
      ['The Sahara in Africa is a hot desert.', true, 'It is the biggest hot desert on Earth.'], ['A desert is a place that gets lots of rain.', false, 'A desert gets very little rain or snow.'], ['Grasslands often have few trees.', true, 'Grass covers the land, with only a few trees here and there.'], ['Cactus plants can live in dry deserts.', true, 'They store water in their thick stems.']]), 'A desert is about how little rain falls, not about heat or sand.');
  });

  /* ------------------------------------------------------------------ our world: helpers */
  var CONT_PT = {}; function contPt(id) { if (!CONT_PT[id]) ML.geog.CONTINENT_LABELS.forEach(function (c) { CONT_PT[c.id] = c; }); return CONT_PT[id]; }
  var CN = { NA: 'North America', SA: 'South America', EU: 'Europe', AF: 'Africa', AS: 'Asia', OC: 'Australia', AN: 'Antarctica' };
  function contHi(id) { // countries (and big territories) to color for a continent; Europe and Asia are never colored this way (Russia spans both)
    var Gg = ML.geog; if (id === 'AN') return ['ATA']; if (id === 'OC') return ['AUS'];
    var ids = Gg.countries({ cont: id }).map(function (c) { return c.id; }); if (id === 'NA') ids.push('GRL', 'PRI'); if (id === 'SA') ids.push('FLK'); return ids;
  }
  // a continents map as categories (Russia, which lies in both Europe and Asia, gets its own color; Antarctica stays plain)
  var CONT_CAT = { NA: 1, SA: 2, AS: 3, OC: 4, AF: 5, EU: 6 }, CONT_CAT_NAMES = [null, 'North America', 'South America', 'Asia', 'Australia and Oceania', 'Africa', 'Europe', 'Russia (part in Europe, part in Asia)'];
  var CONT_FIX = { GRL: 'NA', PRI: 'NA', VIR: 'NA', GUM: 'OC', MNP: 'OC', ASM: 'OC', TWN: 'AS', XKX: 'EU', ESH: 'AF', SOL: 'AF', CYN: 'AS', KAS: 'AS', HKG: 'AS', MAC: 'AS', FLK: 'SA', NCL: 'OC', PYF: 'OC', ABW: 'NA', CUW: 'NA', SXM: 'NA', MAF: 'NA', BLM: 'NA', AIA: 'NA', BMU: 'NA', CYM: 'NA', VGB: 'NA', TCA: 'NA', MSR: 'NA', SPM: 'NA', FRO: 'EU', ALD: 'EU', JEY: 'EU', GGY: 'EU', IMN: 'EU', COK: 'OC', NIU: 'OC', NFK: 'OC', WLF: 'OC', PCN: 'OC', ATC: 'OC' }; // as the kit's contOf
  function contCats() { var Gg = ML.geog, out = {}; Gg.C.concat(Gg.O).forEach(function (a) { if (a.id === 'RUS') { out.RUS = 7; return; } var ct = a.cont || (a.of && Gg.country(a.of) ? (CONT_FIX[a.id] || Gg.country(a.of).cont) : CONT_FIX[a.id]); if (CONT_CAT[ct]) out[a.id] = CONT_CAT[ct]; }); return out; }
  function contMap(extra) { return Object.assign({ cats: contCats(), catNames: CONT_CAT_NAMES, continents: true, quiet: true, interactive: false, dots: false, disputedNote: false }, extra || {}); }
  function contPoints(ids, marks) { return ids.map(function (id) { var c = contPt(id); return { lon: c.lon, lat: c.lat, mark: marks[id] }; }); }

  /* ------------------------------------------------------------------ maps.globe */
  G('maps.globe', function (R, ctx) {
    var L = ctx.level || 1, gv = { name: 'gg-globe', opts: { center: [R.pick([-100, -60, 20, 60, 100, 140]), R.pick([15, 30])], color: 'plain', quiet: true, interactive: false, buttons: false } };
    if (L === 1) return mcq(R.pick(['What shape is Earth?', 'Earth is shaped most like which of these?']), 'Round, like a ball', R.sample(['Flat, like a plate', 'Square, like a box', 'Flat, like a pancake', 'Long, like a banana'], 2), { viz: gv, hint: 'A globe is a model of Earth. What shape is the globe?', steps: ['Earth is round, like a ball.', 'That is why a globe, its model, is round too.'] });
    if (L === 2) { var gq = R.pick([['Which is the truest model of Earth\'s shape?', 'A globe', ['A flat map', 'A compass']], ['Which is a small, round model of Earth?', 'A globe', ['A flat map', 'A beach ball']], ['What is a globe?', 'A small, round model of Earth', ['A map of one town', 'A kind of compass']],
      ['Why does a globe spin on a stand?', 'So you can turn it and see every side of Earth', ['So it can tell the time', 'So it can show the weather']]]);
      return mcq(gq[0], gq[1], gq[2], { viz: gv, hint: 'A globe is round, like Earth.', steps: ['A globe is a small, round model of Earth.', 'It shows land and water in their true shapes, and you turn it to see every side.'] }); }
    return tfq(R.pick([['A globe shows land and water in their true shapes.', true, 'Because a globe is round like Earth, nothing has to be stretched.'], ['Earth is flat, like the maps in a book.', false, 'Earth is round. A flat map is a drawing of a round Earth on flat paper.'],
      ['On a globe, blue shows water.', true, 'Most globes color the oceans blue.'], ['A globe is a toy that has nothing to do with Earth.', false, 'A globe is a model of Earth, shrunk down.'],
      ['You can see all of Earth at once on a globe without turning it.', false, 'You see only one side of a globe at a time; turn it to see the rest.'], ['A globe is much, much smaller than Earth.', true, 'A globe shrinks the whole Earth so it fits on a desk.'], ['A globe shows the oceans and the continents.', true, 'Blue oceans and the shapes of the land.'], ['On a globe, the North Pole is at the top.', true, 'Most globes put the North Pole at the top.'], ['A globe is flat.', false, 'A globe is round like a ball, just like Earth.']]), 'A globe is a small, round model of Earth.');
  });

  /* ------------------------------------------------------------------ maps.globe-vs-map */
  G('maps.globe-vs-map', function (R, ctx) {
    var L = ctx.level || 1, Gg = ML.geog;
    // [orange area, its name, blue area ids, their name, how many times bigger the blue one really is (areas: CIA World Factbook)]
    var GP = R.pick([['GRL', 'Greenland', 'AF', 'Africa', 'about 14 times'], ['GRL', 'Greenland', 'SA', 'South America', 'about 8 times'], ['GRL', 'Greenland', 'AUS', 'Australia', 'about 3 and a half times'], ['RUS', 'Russia', 'AF', 'Africa', 'almost 2 times'], ['GRL', 'Greenland', 'IND', 'India', 'about 1 and a half times'], ['CAN', 'Canada', 'AF', 'Africa', 'about 3 times']]);
    if (L === 3) GP = R.pick([['GRL', 'Greenland', 'AF', 'Africa', 'about 14 times'], ['GRL', 'Greenland', 'SA', 'South America', 'about 8 times']]);
    var blue = GP[2].length === 2 ? Gg.countries({ cont: GP[2] }).map(function (c) { return c.id; }) : [GP[2]];
    var mv = { name: 'gg-projection', opts: { proj: 'mercator', highlight: [GP[0]], highlight2: blue, keeps: false, quiet: true, interactive: false, label: 'A flat world map. ' + GP[1] + ' is orange and ' + GP[3] + ' is blue.' } };
    if (L === 1 && R.coin()) return tfq(R.pick([['A globe shows the true shapes and sizes of places.', true, 'A globe is round like Earth, so nothing is stretched.'], ['A flat map is easy to fold and carry.', true, 'That is why people take paper maps on trips.'],
      ['Every flat map stretches some places.', true, 'You cannot flatten a round Earth onto paper without stretching something.'], ['A globe fits in your pocket.', false, 'A globe is round and does not fold. A paper map folds up small.'], ['A flat map can show the whole world at once.', true, 'You can see every continent at the same time.'], ['On a globe, you can see the whole world at once.', false, 'You see only one side; you turn it to see the rest.']]), 'A globe is round and true; a flat map is easy to carry but stretches some places.');
    if (L === 2 && R.coin()) return mcq('On this flat map, why does ' + GP[1] + ' look so big?', 'The flat map stretches places near the poles', ['Because it really is bigger than ' + GP[3], 'Because it grows a little every year'], { viz: mv, hint: 'Compare it with a globe.',
      steps: ['A round Earth cannot lie flat without stretching.', 'This kind of flat map stretches places near the poles the most, so ' + GP[1] + ' looks bigger than it is.'] });
    if (R.chance(0.3)) { var gc = { AF: [10, 30], SA: [-45, 20], AUS: [10, 10], IND: [20, 40] }[GP[2]] || [10, 30];
      gc = GP[0] === 'RUS' ? [60, 30] : GP[0] === 'CAN' ? [-40, 30] : gc; gc = [gc[0] + R.pick([-10, 0, 10]), gc[1] + R.pick([-5, 0, 5])];
      return mcq('This globe shows true sizes. ' + GP[1] + ' is orange. Which is bigger: ' + GP[1] + ' or ' + GP[3] + '?', GP[3], [GP[1]], { order: [GP[1], GP[3]], viz: { name: 'gg-globe', opts: { center: gc, highlight: [GP[0]], color: 'plain', quiet: true, interactive: false, buttons: false } },
        hint: 'On a globe nothing is stretched, so you can compare sizes.', steps: ['A globe shows every place at its true size.', GP[3] + ' is ' + GP[4] + ' as big as ' + GP[1] + '.'] }); }
    if (L === 3 && R.coin()) return mcq(R.pick(['Where does a flat map like this one stretch places the most?', 'On a flat map like this, which places look much bigger than they really are?']), 'Places near the North and South Poles', ['Places near the equator', 'Places in the middle of the oceans'], { viz: mv,
      hint: 'Look at Greenland and Antarctica on a flat map. Are they near the equator or near the poles?', steps: ['This kind of flat map stretches places more and more toward the poles.', 'That is why ' + GP[1] + ' looks so big here.'] });
    if (L === 1) { var c = R.pick([['Which one would you take on a hike in your backpack?', 'A paper map', 'A globe', 'A paper map folds flat and fits in a backpack.'], ['Which one is round, like Earth?', 'A globe', 'A paper map', 'A globe is round like Earth.'], ['Which one can show your town street by street, big enough to read?', 'A flat map', 'A globe', 'A flat map can zoom in on one small place; a globe shows the whole Earth small.'],
      ['Which one can you fold up and put in a pocket?', 'A paper map', 'A globe', 'A paper map folds flat; a globe is round and stays round.'], ['Which one shows Earth\'s true shape?', 'A globe', 'A paper map', 'A globe is round like Earth, so nothing is stretched.'], ['Which one shows the whole world at once, all on one page?', 'A flat map', 'A globe', 'On a globe you only see one side at a time.']]);
      return mcq(c[0], c[1], [c[2]], { order: c[1] === 'A globe' ? ['A globe', c[2]] : [c[2], c[1]], hint: 'Think about a ball and a sheet of paper.', steps: [c[3]] }); }
    if (L === 2) return mcq('On this flat map, ' + GP[1] + ' (orange) looks very big next to ' + GP[3] + ' (blue). Which is really bigger?', GP[3], [GP[1], 'They are the same size'], { order: [GP[3], GP[1], 'They are the same size'], viz: mv,
      hint: 'Flat maps like this one stretch places near the top and bottom.', steps: ['This flat map stretches places far from the equator, so ' + GP[1] + ' looks bigger than it is.', 'On a globe you see the true sizes: ' + GP[3] + ' is ' + GP[4] + ' as big as ' + GP[1] + '.'] });
    var big = GP[3] === 'Africa' ? ['About 14 times', '30 million', '14'] : ['About 8 times', '17.8 million', '8'];
    return mcq('About how many times bigger than Greenland is ' + GP[3] + '?', big[0], [], { order: ['The same size', 'About 2 times', big[0]], viz: mv,
      hint: 'A globe shows true sizes. Greenland is much smaller than it looks here.', steps: [GP[3] + ' covers about ' + big[1] + ' square kilometers; Greenland about 2.2 million.', big[1].split(' ')[0] + ' ÷ 2.2 is about ' + big[2] + ', so ' + GP[3] + ' is about ' + big[2] + ' times bigger.'] });
  });

  /* ------------------------------------------------------------------ maps.continents */
  var NOTCONT = ['France', 'Texas', 'Canada', 'Brazil', 'Japan', 'Egypt', 'Florida', 'China'];
  G('maps.continents', function (R, ctx) {
    var L = ctx.level || 1, all = ['Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America'];
    if (L === 1) return mcq('How many continents are there?', '7', [], { order: ['5', '7', '50'], viz: { name: 'gg-globe', opts: { center: [20, 15], color: 'plain', quiet: true, interactive: false, buttons: false } },
      hint: 'Africa, Antarctica, Asia, Australia, Europe, North America, South America...', steps: ['The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America and South America.'] });
    if (L === 2) {
      if (R.coin()) { var c = R.pick(['Africa', 'Asia', 'Europe', 'South America']);
        return mcq('Is ' + c + ' a country or a continent?', 'A continent', ['A country'], { order: ['A country', 'A continent'], hint: 'A continent is a huge area of land with many countries.', steps: [c + ' is a continent. It holds many countries' + (c === 'Africa' ? ': more than 50.' : '.')] }); }
      var right = R.pick(all); return mcq('Which of these is a continent?', right, R.sample(NOTCONT, 2), { hint: 'Two of these are countries or states.', steps: [right + ' is one of the seven continents.'] });
    }
    var yes = R.sample(all, R.int(2, 3)), no = R.sample(NOTCONT, 5 - yes.length), list = R.shuffle(yes.concat(no));
    return { q: READ + big('Which of these are continents? Choose all that are.'), a: { t: 'mc', choices: list, v: list.map(function (x, i) { return yes.indexOf(x) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }) },
      hint: 'There are only seven continents.', steps: list.map(function (x) { return x + (yes.indexOf(x) >= 0 ? ' is a continent.' : ' is not a continent; it is ' + (['Texas', 'Florida'].indexOf(x) >= 0 ? 'a state.' : 'a country.')); }) };
  });

  /* ------------------------------------------------------------------ maps.find-continents */
  var FAR = { NA: ['AF', 'OC', 'AN'], SA: ['AS', 'EU', 'OC'], EU: ['SA', 'OC', 'AN'], AF: ['NA', 'OC', 'AN'], AS: ['SA', 'NA', 'AN'], OC: ['NA', 'EU', 'SA'], AN: ['EU', 'NA', 'AS'] };
  var NEAR = { NA: ['SA', 'EU'], SA: ['NA', 'AF'], EU: ['AS', 'AF'], AS: ['EU', 'OC'], AF: ['EU', 'SA'], OC: ['AS', 'AN'], AN: ['OC', 'SA'] };
  var CLUE = { AS: 'the biggest continent', OC: 'the smallest continent', AN: 'the continent at the bottom of the world, covered in ice' };
  G('maps.find-continents', function (R, ctx) {
    var L = ctx.level || 1, ids = Object.keys(CN);
    if (L === 3 && R.coin()) {
      var k = R.pick(['AF', 'SA', 'NA', 'OC', 'AN']), hi = contHi(k), wr = R.sample(NEAR[k].concat(FAR[k]).filter(function (x, i, a) { return a.indexOf(x) === i; }), 2);
      return mcq('Which continent is colored orange?', CN[k], wr.map(function (x) { return CN[x]; }), { viz: { name: 'gg-map', opts: { color: 'plain', highlight: hi, quiet: true, interactive: false, dots: false, disputedNote: false } },
        hint: 'Look at its shape and where it is on the map.', steps: ['The orange land is ' + CN[k] + '.', { AF: 'Africa is in the middle of the map, below Europe.', SA: 'South America is below North America, on the left side.', NA: 'North America is at the top left.', OC: 'Australia is at the bottom right.', AN: 'Antarctica is all along the bottom.' }[k]] });
    }
    if (L === 3) { var c = R.pick(Object.keys(CLUE)), w2 = R.sample(ids.filter(function (x) { return x !== c && !CLUE[x]; }), 2);
      return mcq('Which is ' + CLUE[c] + '?', CN[c], w2.map(function (x) { return CN[x]; }), { viz: { name: 'gg-map', opts: contMap() }, hint: 'Look at the map. Which continent fits?',
        steps: [CN[c] + ' is ' + CLUE[c] + '.'] }); }
    var want = R.pick(ids), others = L === 1 ? R.sample(FAR[want], 2) : NEAR[want].slice(), marked = R.shuffle([want].concat(others)), marks = {};
    marked.forEach(function (x, i) { marks[x] = LET[i]; });
    return { q: READ + big('Which letter is on ' + CN[want] + '?'), viz: { name: 'gg-map', opts: { color: 'plain', points: contPoints(marked, marks), quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A world map with letters on three continents.' } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: marked.indexOf(want), keep: true }, hint: { NA: 'North America is at the top left, above South America.', SA: 'South America is below North America.', EU: 'Europe is the smaller land at the top middle, west of Asia.', AF: 'Africa is in the middle, below Europe.', AS: 'Asia is the biggest land, at the top right.', OC: 'Australia is the small continent at the bottom right.', AN: 'Antarctica is along the very bottom.' }[want],
      steps: [{ NA: 'North America is at the top left.', SA: 'South America is at the bottom left.', EU: 'Europe is at the top middle.', AF: 'Africa is in the middle.', AS: 'Asia is the big land at the top right.', OC: 'Australia is at the bottom right.', AN: 'Antarctica is at the bottom.' }[want], 'It has the letter ' + marks[want] + '.'] };
  });

  /* ------------------------------------------------------------------ maps.oceans */
  var OCN = { pacific: 'Pacific Ocean', atlantic: 'Atlantic Ocean', indian: 'Indian Ocean', arctic: 'Arctic Ocean', southern: 'Southern Ocean' };
  var BETWEEN = [['Which ocean is between Africa and Australia?', 'indian'], ['Which ocean is between North America and Europe?', 'atlantic'], ['Which ocean is between Asia and North America?', 'pacific'], ['Which ocean is all around Antarctica?', 'southern'], ['Which ocean is around the North Pole?', 'arctic']];
  G('maps.oceans', function (R, ctx) {
    var L = ctx.level || 1, ids = Object.keys(OCN), Gg = ML.geog;
    if (L === 1 && R.coin()) return mcq('Which ocean is the biggest?', 'Pacific Ocean', ['Arctic Ocean', 'Indian Ocean'], { hint: 'It is so big that all the land on Earth could fit inside it.', steps: ['The Pacific Ocean is the biggest ocean.', 'The Arctic Ocean is the smallest.'] });
    if (L === 3) {
      if (R.chance(0.25)) return tfq(R.pick([['All the oceans are connected to each other.', true, 'They join into one world ocean. We give its parts names.'], ['Each ocean is a separate pool with land all around it.', false, 'The oceans are all connected into one world ocean.'], ['The Arctic Ocean is the smallest ocean.', true, 'It is around the North Pole.']]), 'Look at a globe: can a ship sail from one ocean to the next?');
      var b = R.pick(BETWEEN), wr = R.sample(ids.filter(function (x) { return x !== b[1]; }), 2);
      return mcq(b[0], OCN[b[1]], wr.map(function (x) { return OCN[x]; }), { viz: { name: 'gg-map', opts: contMap() }, hint: 'Find the two places on the map. Which water lies between them?',
        steps: ['On the map, the ' + OCN[b[1]] + ' is ' + b[0].replace(/^Which ocean is /, '').replace(/\?$/, '') + '.'] });
    }
    var want = L === 2 ? R.pick(['arctic', 'southern', 'indian', 'atlantic', 'pacific']) : R.pick(ids), pool = L === 2 && (want === 'arctic' || want === 'southern') ? [want === 'arctic' ? 'southern' : 'arctic', R.pick(['pacific', 'atlantic', 'indian'])] : R.sample(ids.filter(function (x) { return x !== want; }), 2);
    var marked = R.shuffle([want].concat(pool)), marks = {}; marked.forEach(function (x, i) { marks[x] = LET[i]; });
    var pts = marked.map(function (x) { var o = Gg.OCEANS.filter(function (q) { return q.id === x; })[0]; return { lon: o.lon, lat: o.lat, mark: marks[x] }; });
    return { q: READ + big('Which letter is on the ' + OCN[want] + '?'), viz: { name: 'gg-map', opts: { color: 'plain', continents: true, points: pts, quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A world map with the continents named and letters on three oceans.' } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: marked.indexOf(want), keep: true }, hint: { pacific: 'The Pacific is the huge ocean between Asia and the Americas.', atlantic: 'The Atlantic is between the Americas and Europe and Africa.', indian: 'The Indian Ocean is south of Asia, between Africa and Australia.', arctic: 'The Arctic Ocean is at the very top, around the North Pole.', southern: 'The Southern Ocean is near the bottom, all around Antarctica.' }[want],
      steps: [{ pacific: 'The Pacific Ocean lies between Asia and Australia on one side and the Americas on the other.', atlantic: 'The Atlantic Ocean lies between the Americas and Europe and Africa.', indian: 'The Indian Ocean lies south of Asia, between Africa and Australia.', arctic: 'The Arctic Ocean is at the top of the world, around the North Pole.', southern: 'The Southern Ocean is at the bottom, all around Antarctica.' }[want], 'It has the letter ' + marks[want] + '.'] };
  });

  /* ------------------------------------------------------------------ maps.continent-animals */
  var ANIMALS = [['giraffe', '🦒', 'AF'], ['zebra', '🦓', 'AF'], ['gorilla', '🦍', 'AF'], ['hippo', '🦛', 'AF'], ['kangaroo', '🦘', 'OC'], ['koala', '🐨', 'OC'], ['platypus', '', 'OC'],
    ['giant panda', '🐼', 'AS'], ['tiger', '🐅', 'AS'], ['orangutan', '🦧', 'AS'], ['American bison', '🦬', 'NA'], ['bald eagle', '🦅', 'NA'], ['Amazon river dolphin', '🐬', 'SA'], ['Andean condor', '', 'SA'],
    ['emperor penguin', '🐧', 'AN'], ['Iberian lynx', '', 'EU'], ['Alpine ibex', '', 'EU']];
  function aname(a) { return (a[1] ? a[1] + ' ' : '') + a[0]; }
  G('maps.continent-animals', function (R, ctx) {
    var L = ctx.level || 1, a = R.pick(ANIMALS), ids = Object.keys(CN);
    if (L === 1) return mcq('Where does the ' + aname(a) + ' live in the wild?', CN[a[2]], R.sample(FAR[a[2]], 2).map(function (x) { return CN[x]; }), { hint: 'Think of where it lives on its own, not in a zoo.',
      steps: ['In the wild, the ' + a[0] + ' lives in ' + CN[a[2]] + '.', 'You might see one in a zoo anywhere, but its wild home is ' + CN[a[2]] + '.'] });
    if (L === 2) { var others = R.sample(ids.filter(function (x) { return x !== a[2]; }), 2), marked = R.shuffle([a[2]].concat(others)), marks = {}; marked.forEach(function (x, i) { marks[x] = LET[i]; });
      return { q: READ + big('The ' + aname(a) + ' lives wild on one of the lettered continents. Which letter?'), viz: { name: 'gg-map', opts: { color: 'plain', points: contPoints(marked, marks), quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: { t: 'mc', choices: LET.slice(0, 3), v: marked.indexOf(a[2]), keep: true }, hint: 'First think of the continent. Then find it on the map.', steps: ['The ' + a[0] + ' lives wild in ' + CN[a[2]] + '.', CN[a[2]] + ' has the letter ' + marks[a[2]] + '.'] }; }
    if (R.coin()) return tfq(R.pick([['Elephants live wild on only one continent.', false, 'Wild elephants live in Africa and in Asia.'], ['Polar bears and penguins live together at the North Pole.', false, 'Polar bears live in the far north. Almost all wild penguins live in the southern half of the world.'],
      ['You can see a giraffe in a zoo far away, but in the wild it lives in Africa.', true, 'A zoo is not an animal\'s wild home.'], ['Polar bears live in the Arctic, in the far north of North America, Europe and Asia.', true, 'They live on the sea ice and coasts around the Arctic Ocean.']]), 'Think of where the animal lives on its own, not in a zoo.');
    var cont = R.pick(ids), right = R.pick(ANIMALS.filter(function (x) { return x[2] === cont; })), wrong = R.sample(ANIMALS.filter(function (x) { return x[2] !== cont; }), 2);
    return mcq('Which animal lives wild in ' + CN[cont] + '?', Cap(aname(right)), wrong.map(function (x) { return Cap(aname(x)); }), { hint: 'Think of each animal\'s wild home.',
      steps: ['The ' + right[0] + ' lives wild in ' + CN[cont] + '.'].concat(wrong.map(function (x) { return 'The ' + x[0] + ' lives wild in ' + CN[x[2]] + '.'; })) });
  });

  /* ------------------------------------------------------------------ maps.equator */
  var CROSS = ['Africa', 'South America'], NOCROSS = ['Europe', 'North America', 'Antarctica', 'Australia'];
  G('maps.equator', function (R, ctx) {
    var L = ctx.level || 1, Gg = ML.geog;
    if (L === 1) return mcq('What is the name of the imaginary line around the middle of Earth?', 'The equator', ['The North Pole', 'A river'], { viz: { name: 'gg-globe', opts: { center: [R.pick([-60, 20, 110]), 10], lines: ['equator'], lineLabels: false, color: 'plain', quiet: true, interactive: false, buttons: false } },
      hint: 'Its name sounds like "equal": it cuts Earth into two equal halves.', steps: ['The line around the middle of Earth is the equator.', 'It is halfway between the North Pole and the South Pole.'] });
    if (L === 2) return tfq(R.pick([['You could see the equator painted on the ground.', false, 'The equator is imaginary. Mapmakers draw it to help us find places.'], ['The equator is halfway between the North Pole and the South Pole.', true, 'It is the same distance from both poles.'],
      ['The equator goes all the way around Earth.', true, 'It is about 25,000 miles (40,000 kilometers) around.'], ['The equator runs from the North Pole to the South Pole.', false, 'The equator goes around the middle of Earth, east and west. Lines from pole to pole are different lines.']]), 'The equator is an imaginary line around the middle of Earth.');
    if (R.coin()) { var right = R.pick(CROSS);
      return mcq('Which continent does the equator cross?', right, R.sample(NOCROSS, 2), { viz: { name: 'gg-map', opts: contMap({ lines: ['equator'] }) }, hint: 'Follow the equator line across the map.',
        steps: ['The equator crosses Africa and South America.', 'It does not cross ' + NOCROSS.join(', ').replace(/, (?=[^,]*$)/, ' or ') + '.'] }); }
    var cs = Gg.CITIES.filter(function (c) { return Math.abs(c.lat) > 12; }), c = R.pick(cs), north = c.lat > 0;
    return mcq('Is the dot north or south of the equator?', north ? 'North' : 'South', [], { order: ['North', 'South'], viz: { name: 'gg-map', opts: { color: 'plain', lines: ['equator'], points: [{ lon: c.lon, lat: c.lat, mark: '?' }], quiet: true, interactive: false, dots: false, disputedNote: false } },
      hint: 'North is above the equator line on the map; south is below it.', steps: ['The dot is ' + (north ? 'above' : 'below') + ' the equator line.', 'So it is ' + (north ? 'north' : 'south') + ' of the equator. (The dot is ' + c.n + '.)'] });
  });

  /* ------------------------------------------------------------------ maps.poles */
  G('maps.poles', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1 && R.coin()) { var pq = R.pick([['Which pole is on a continent?', 'The South Pole', ['The North Pole'], 'The South Pole is on Antarctica. The North Pole is in the Arctic Ocean.'], ['Is there land under the North Pole?', 'No, it is ocean covered with ice', ['Yes, a big continent'], 'The North Pole is in the middle of the Arctic Ocean, on floating sea ice.'],
      ['Which direction is the North Pole from where you live in the United States?', 'North', ['South'], 'The North Pole is as far north as you can go.'], ['Which continent is the South Pole on?', 'Antarctica', ['Australia', 'South America'], 'The South Pole is on Antarctica, covered by thick ice.']]);
      return mcq(pq[0], pq[1], pq[2], { viz: { name: 'gg-globe', opts: { center: [0, R.pick([50, -50])], color: 'plain', quiet: true, interactive: false, buttons: false } }, hint: 'The North Pole is at the top of the globe; the South Pole is at the bottom.', steps: [pq[3]] }); }
    if (L === 1) { var n = R.coin();
      return n ? mcq('Where is the North Pole?', 'On floating sea ice in the Arctic Ocean', ['On the land of Antarctica', 'In Africa'], { hint: 'There is no land at the North Pole.', steps: ['The North Pole is in the middle of the Arctic Ocean.', 'The ocean there is covered by floating sea ice, not land.'] })
        : mcq('Where is the South Pole?', 'On the land of Antarctica', ['In the Arctic Ocean', 'In Africa'], { hint: 'It is at the bottom of the world, on the icy continent.', steps: ['The South Pole is on Antarctica, a continent covered with thick ice.'] }); }
    if (L === 2) { var s = R.coin();
      var NA2 = ['🐻‍❄️ Polar bear', 'Walrus', 'Arctic fox'], SA2 = ['🐧 Emperor penguin', 'Adélie penguin'], OTH = ['🦘 Kangaroo', '🦒 Giraffe', '🐅 Tiger'];
      if (R.coin()) return s ? mcq('Which animal lives in the far north, near the North Pole?', R.pick(NA2), [R.pick(SA2), R.pick(OTH)], { hint: 'Which one lives on Arctic ice and cold northern coasts?', steps: ['Polar bears, walruses and Arctic foxes live in the far north, around the Arctic Ocean.', 'Penguins live in the south.'] })
        : mcq('Which animal lives in the far south, near the South Pole?', R.pick(SA2), [R.pick(NA2), R.pick(OTH)], { hint: 'Which one lives on Antarctic ice?', steps: ['Emperor and Adélie penguins live around Antarctica, in the far south.', 'Polar bears, walruses and Arctic foxes live in the far north.'] });
      return s ? mcq('Which animal lives near the North Pole?', '🐻‍❄️ Polar bear', ['🐧 Emperor penguin', '🦘 Kangaroo'], { hint: 'This bear is white and hunts on the sea ice.', steps: ['Polar bears live around the Arctic Ocean, in the far north.', 'Emperor penguins live in the far south, around Antarctica.'] })
        : mcq('Which animal lives near the South Pole?', '🐧 Emperor penguin', ['🐻‍❄️ Polar bear', '🦒 Giraffe'], { hint: 'This bird cannot fly, but it swims very well.', steps: ['Emperor penguins live around Antarctica, in the far south.', 'Polar bears live in the far north.'] }); }
    var north = R.coin(), pole = north ? [0, 90] : [0, -90], center = [R.pick([-20, 20, 60]), north ? 45 : -45], oth = [[center[0] + 40, north ? 20 : -20], [center[0] - 50, north ? 35 : -35]];
    var marked = R.shuffle([0, 1, 2]), pts = [pole].concat(oth).map(function (p, i) { return { lon: p[0], lat: p[1], mark: LET[marked[i]] }; });
    return { q: READ + big('Which letter is at the ' + (north ? 'North' : 'South') + ' Pole?'), viz: { name: 'gg-globe', opts: { center: center, points: pts, color: 'plain', quiet: true, interactive: false, buttons: false, label: 'A globe with three lettered dots.' } },
      a: { t: 'mc', choices: LET.slice(0, 3), v: marked[0], keep: true }, hint: north ? 'The North Pole is the farthest point north: the very top of the globe.' : 'The South Pole is the farthest point south: the very bottom of the globe.',
      steps: ['The ' + (north ? 'North' : 'South') + ' Pole is the ' + (north ? 'top' : 'bottom') + ' point of Earth, where all the lines from pole to pole meet.', 'That dot has the letter ' + LET[marked[0]] + '.'] };
  });

  /* ------------------------------------------------------------------ maps.hemispheres */
  // countries that lie wholly inside the named hemispheres (checked against the map data in /tmp/work_maps/test.js)
  var HEMI_C = [['Australia', 'S', 'E'], ['China', 'N', 'E'], ['Japan', 'N', 'E'], ['India', 'N', 'E'], ['Egypt', 'N', 'E'], ['Argentina', 'S', 'W'], ['Mexico', 'N', 'W'], ['Canada', 'N', 'W'], ['Chile', 'S', 'W'], ['South Africa', 'S', 'E']];
  var HW = { N: 'Northern', S: 'Southern', E: 'Eastern', W: 'Western' };
  G('maps.hemispheres', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 3 || (L === 2 && R.coin())) {
      var c = R.pick(HEMI_C), right = HW[c[1]] + ' and ' + HW[c[2]], wr = [HW[c[1] === 'N' ? 'S' : 'N'] + ' and ' + HW[c[2]], HW[c[1]] + ' and ' + HW[c[2] === 'E' ? 'W' : 'E']];
      if (L === 3) wr.push(HW[c[1] === 'N' ? 'S' : 'N'] + ' and ' + HW[c[2] === 'E' ? 'W' : 'E']);
      return mcq('Which two hemispheres is ' + c[0] + ' in?', right, wr, { viz: { name: 'gg-map', opts: { color: 'plain', lines: ['equator', 'prime', 'dateline'], lineLabels: false, highlight: [ML.geog.C.filter(function (x) { return x.n === c[0]; })[0].id], quiet: true, interactive: false, dots: false, disputedNote: false, label: 'A world map with one country in orange, the equator, and the line through London from pole to pole.' } },
        hint: 'Is it above or below the equator? Is it east or west of the line from pole to pole through London?',
        steps: [c[0] + ' is ' + (c[1] === 'N' ? 'north' : 'south') + ' of the equator: the ' + HW[c[1]] + ' Hemisphere.', 'It is ' + (c[2] === 'E' ? 'east' : 'west') + ' of the line through London: the ' + HW[c[2]] + ' Hemisphere.', 'Every place is in two hemispheres at once.'] });
    }
    var h = L === 1 ? R.pick(['N', 'S']) : R.pick(['E', 'W']), ord = L === 1 ? ['Northern', 'Southern', 'Eastern'] : ['Eastern', 'Western', 'Northern'];
    return mcq('Which half of Earth is colored?', HW[h] + ' Hemisphere', [], { order: ord.map(function (x) { return x + ' Hemisphere'; }), viz: { name: 'gg-globe', opts: { center: [0, 0], hemi: h, lines: L === 1 ? ['equator'] : ['prime'], lineLabels: false, color: 'plain', quiet: true, interactive: false, buttons: false } },
      hint: L === 1 ? 'Is the colored half above or below the equator?' : 'Is the colored half to the right (east) or the left (west)?',
      steps: [L === 1 ? 'The equator cuts Earth into a northern half and a southern half.' : 'A line from the North Pole to the South Pole through London cuts Earth into an eastern half and a western half.', 'The colored half is the ' + HW[h] + ' Hemisphere.'] });
  });
})(window.MathLadder);
