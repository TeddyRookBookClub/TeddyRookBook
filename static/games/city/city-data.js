/* Streets of Rome and Athens: the two city maps, their landmarks and the missions.
   Rome about AD 110, under Trajan, with Latin words. Athens about AD 50, when Paul visited (Acts 17), with Koine Greek words.
   Tiles: 0 road, 1 building, 2 paved square, 3 grass, 4 water, 5 bridge, 6 landmark (solid), 7 tree, 8 sand track, 9 stone (solid), 10 rock (solid), 11 rock top (walkable). */
(function (W) {
  'use strict';
  var WALK = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1]; // index = tile code
  function Map(w, h) { this.w = w; this.h = h; this.t = new Uint8Array(w * h).fill(1); this.lm = []; this.spots = {}; this.deco = []; }
  var M = Map.prototype;
  M.get = function (x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 1; return this.t[y * this.w + x]; };
  M.set = function (x, y, v) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.t[y * this.w + x] = v; };
  M.fill = function (x0, y0, x1, y1, v, only) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (only == null || this.get(x, y) === only) this.set(x, y, v); };
  M.ellipse = function (cx, cy, rx, ry, v, only) { for (var y = Math.floor(cy - ry); y <= cy + ry; y++) for (var x = Math.floor(cx - rx); x <= cx + rx; x++) { var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1 && (only == null || this.get(x, y) === only)) this.set(x, y, v); } };
  M.line = function (x0, y0, x1, y1, wd, v, only) { var n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2); for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; this.fill(Math.floor(x), Math.floor(y), Math.floor(x + wd - 1), Math.floor(y + wd - 1), v, only); } };
  M.walk = function (x, y) { return !!WALK[this.get(x, y)]; };
  // a landmark: word and English, centre, label position, and how to draw it
  M.mark = function (o) { this.lm.push(o); return o; };
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  function streets(m, ys, xs, seed) {
    var r = rng(seed);
    ys.forEach(function (y) { m.fill(0, y, m.w - 1, y + 1, 0); });
    xs.forEach(function (x) { m.fill(x, 0, x + 1, m.h - 1, 0); });
    // alleys inside each block, joining the avenues
    var Y = [0].concat(ys.map(function (y) { return y + 2; })), X = [0].concat(xs.map(function (x) { return x + 2; }));
    for (var j = 0; j < Y.length; j++) for (var i = 0; i < X.length; i++) {
      var x0 = X[i], x1 = (i + 1 < X.length ? xs[i] : m.w) - 1, y0 = Y[j], y1 = (j + 1 < Y.length ? ys[j] : m.h) - 1;
      if (x1 - x0 < 4 || y1 - y0 < 4) continue;
      if ((i + j) % 2) { var ay = y0 + 2 + Math.floor(r() * (y1 - y0 - 4)); m.fill(x0, ay, x1, ay, 0); }
      else { var ax = x0 + 2 + Math.floor(r() * (x1 - x0 - 4)); m.fill(ax, y0, ax, y1, 0); }
      if (r() < 0.45) { var bx = x0 + 1 + Math.floor(r() * (x1 - x0 - 2)), by = y0 + 1 + Math.floor(r() * (y1 - y0 - 2)); if (r() < 0.5) m.fill(bx, y0, bx, by, 0); else m.fill(x0, by, bx, by, 0); }
    }
    // the edge of the map is a wall of houses
    m.fill(0, 0, m.w - 1, 0, 1); m.fill(0, m.h - 1, m.w - 1, m.h - 1, 1); m.fill(0, 0, 0, m.h - 1, 1); m.fill(m.w - 1, 0, m.w - 1, m.h - 1, 1);
  }
  function trees(m, x0, y0, x1, y1, n, seed) { var r = rng(seed); for (var i = 0; i < n; i++) { var x = x0 + Math.floor(r() * (x1 - x0 + 1)), y = y0 + Math.floor(r() * (y1 - y0 + 1)); if (m.get(x, y) === 3) m.set(x, y, 7); } }

  // ---------- Rome ----------
  function rome() {
    var m = new Map(96, 72);
    streets(m, [5, 17, 29, 41, 53, 65], [15, 29, 43, 57, 71, 85], 7);
    // the Tiber, with two bridges
    m.river = [];
    for (var y = 0; y < m.h; y++) { var cx = 9 + Math.round(2.5 * Math.sin(y / 9)); m.river.push(cx); m.fill(cx - 2, y, cx + 1, y, 4); }
    [17, 53].forEach(function (y) { m.fill(m.river[y] - 2, y, m.river[y] + 1, y + 1, 5); m.fill(m.river[y + 1] - 2, y + 1, m.river[y + 1] + 1, y + 1, 5); });
    m.mark({ id: 'river', w: 'Tiberis', e: 'the Tiber', x: m.river[30] - 0.5, y: 30, label: 1, solidFoot: 1 });
    m.mark({ id: 'bridge', w: 'pons', e: 'bridge', x: m.river[53], y: 54, label: 1 });
    // the Forum, with two temples
    m.fill(40, 30, 55, 40, 2); m.fill(41, 31, 43, 32, 6); m.fill(52, 38, 54, 39, 6);
    m.deco.push({ k: 'temple', x: 41, y: 31, w: 3, h: 2 }, { k: 'temple', x: 52, y: 38, w: 3, h: 2 });
    m.mark({ id: 'forum', w: 'forum', e: 'forum, public square', x: 48, y: 35, label: 1 });
    // the Capitol
    m.fill(30, 27, 38, 39, 3); m.fill(32, 30, 36, 33, 6); trees(m, 30, 27, 38, 39, 10, 3);
    m.deco.push({ k: 'temple', x: 32, y: 30, w: 5, h: 4, big: 1 });
    m.mark({ id: 'templum', w: 'templum', e: 'temple', x: 34.5, y: 35, label: 1 });
    // the Colosseum
    m.fill(59, 31, 75, 45, 2); m.ellipse(67, 38, 6, 5, 6);
    m.deco.push({ k: 'amph', x: 67, y: 38, rx: 6, ry: 5 });
    m.mark({ id: 'amph', w: 'amphitheatrum', e: 'amphitheatre (the Colosseum)', x: 67, y: 38, label: 1, onTop: 1 });
    // the Circus Maximus: stands, sand track, the central barrier (spina), a gate at the west end
    m.fill(30, 50, 62, 62, 9); m.fill(32, 52, 60, 60, 8); m.fill(37, 56, 55, 56, 9); m.fill(28, 55, 31, 57, 8); m.fill(26, 55, 28, 57, 0);
    m.deco.push({ k: 'circus', x: 30, y: 50, w: 33, h: 13 });
    m.mark({ id: 'circus', w: 'circus', e: 'racecourse (the Circus Maximus)', x: 46, y: 56.5, label: 1, onTop: 1 });
    // the Pantheon
    m.fill(21, 11, 31, 21, 2); m.ellipse(26, 14.5, 2.6, 2.6, 6); m.fill(25, 17, 27, 18, 6);
    m.deco.push({ k: 'pantheon', x: 26, y: 14.5, r: 2.6 });
    m.mark({ id: 'pantheum', w: 'Pantheum', e: 'the Pantheon, “temple of all the gods”', x: 26, y: 20, label: 1 });
    // the Baths of Trajan
    m.fill(72, 21, 83, 31, 2); m.fill(74, 22, 81, 28, 6);
    m.deco.push({ k: 'baths', x: 74, y: 22, w: 8, h: 7 });
    m.mark({ id: 'thermae', w: 'thermae', e: 'public baths', x: 78, y: 30, label: 1 });
    // the river harbour
    for (y = 44; y <= 50; y++) m.fill(m.river[y] + 2, y, m.river[y] + 6, y, 2);
    m.mark({ id: 'portus', w: 'portus', e: 'harbour', x: m.river[47] + 4, y: 47, label: 1 });
    // stables, a wine shop, Gaius's house, gardens
    m.fill(18, 42, 24, 47, 2); m.mark({ id: 'stabulum', w: 'stabulum', e: 'stable', x: 21, y: 44.5, label: 1 });
    m.fill(58, 46, 64, 49, 2); m.mark({ id: 'stabulum2', w: 'stabulum', e: 'stable', x: 61, y: 47.5, label: 1 });
    m.fill(60, 11, 64, 15, 2); m.fill(61, 11, 63, 11, 6); m.deco.push({ k: 'shop', x: 61, y: 11, w: 3, h: 1 }); m.mark({ id: 'taberna', w: 'taberna', e: 'shop, tavern', x: 62, y: 13.5, label: 1 });
    m.fill(21, 61, 27, 67, 2); m.fill(22, 61, 26, 62, 6); m.deco.push({ k: 'house', x: 22, y: 61, w: 5, h: 2 }); m.mark({ id: 'domus', w: 'domus', e: 'house, home', x: 24, y: 64.5, label: 1 });
    m.fill(76, 52, 92, 68, 3); trees(m, 76, 52, 92, 68, 40, 11); m.fill(76, 59, 92, 59, 0); m.fill(84, 52, 84, 68, 0);
    m.mark({ id: 'horti', w: 'horti', e: 'gardens', x: 80, y: 56, label: 1 });
    m.spots = { start: [24, 66.4], patron: [24, 64.2], chariots: [[19.5, 43.5], [21.5, 43.5], [23.5, 43.5], [59.5, 47.5], [62.5, 47.5]], carts: 5,
      race: { pts: [[46, 58.5], [56.5, 58.5], [58.6, 56], [56.5, 53.5], [46, 53.5], [35.5, 53.5], [33.6, 56], [35.5, 58.5]], grid: [[36.5, 57.6], [36.5, 59.3], [34.6, 57.6], [34.6, 59.3]], laps: 3, vehicle: 1,
        rivals: [['Reds', '#c0392b'], ['Whites', '#eeeeee'], ['Blues', '#2f6fb5']], you: ['Greens', '#2e8b57'] },
      scrolls: [[45, 6], [8, 30], [88, 20], [70, 66], [36, 46]] };
    m.name = 'Rome'; m.when = 'about AD 110, under Trajan'; m.lang = 'l'; m.guards = { name: 'the night watch (vigiles)', col: '#a8201a' };
    m.palette = { road: '#c9b997', roof: ['#b5583a', '#a84e33', '#c0643f', '#9c4a30'], grass: '#86a858', plaza: '#e3d8c3' };
    m.lines = [['Salve!', 'Hello!'], ['Vale!', 'Goodbye!'], ['Cave!', 'Watch out!'], ['Quid agis?', 'How are you?'], ['Ita vero!', 'Yes indeed!'], ['Festina!', 'Hurry!'], ['Euge!', 'Well done!'], ['Bene est.', 'All is well.']];
    m.missions = [
      { id: 'vinum', title: 'Vinum', brief: 'Gaius the merchant needs wine for his shop. Fetch an amphora of wine (vinum) from the river harbour, the portus, and bring it to his taberna in the Subura.', time: 200, words: [['vinum', 'wine'], ['amphora', 'two-handled jar']],
        steps: [{ t: 'go', at: 'portus', text: 'Fetch the wine from the portus (harbour).', item: 'amphora', pick: 'You pick up the amphora.' }, { t: 'go', at: 'taberna', text: 'Take the wine to the taberna (shop).' }] },
      { id: 'stabulum', title: 'Stabulum', brief: 'Gaius has hired you a chariot. Take it from the stabulum (stable) by the Tiber and drive to the forum before the senators go home. Get in with E or the “Get in” button.', time: 120, words: [['currus', 'chariot'], ['equus', 'horse']],
        steps: [{ t: 'ride', at: 'stabulum', text: 'Go to the stabulum (stable) and get into a chariot.' }, { t: 'go', at: 'forum', need: 'vehicle', text: 'Drive to the forum.' }] },
      { id: 'fur', title: 'Fur!', brief: 'A thief (fur) has snatched Gaius’s purse in the forum! Catch him before he gets away. He is quick, but he will tire.', time: 100, words: [['fur', 'thief'], ['sacculus', 'little bag, purse']],
        steps: [{ t: 'go', at: 'forum', text: 'Hurry to the forum.' }, { t: 'catch', text: 'Catch the fur (thief)!' }] },
      { id: 'circus', title: 'Circus Maximus', brief: 'Gaius has entered you in a race at the Circus Maximus, driving for the Greens against the Reds, the Whites and the Blues. Three laps, anticlockwise round the spina, the central barrier, as the Romans raced.', time: 0, words: [['circus', 'racecourse'], ['meta', 'turning post']],
        steps: [{ t: 'race', text: 'Win the race: three laps!' }] },
      { id: 'libri', title: 'Libri', brief: 'Five of Gaius’s scrolls (libri) blew off a cart. Find them all around the city before anyone else does. The map in the corner shows where they are.', time: 240, words: [['liber', 'book, scroll'], ['epistula', 'letter']],
        steps: [{ t: 'collect', text: 'Collect the five libri (scrolls).' }] },
      { id: 'vigiles', title: 'Vigiles', brief: 'The vigiles, the night watch that Augustus set up to fight fires and keep order, think you are the purse thief! Lose them and get back to Gaius’s domus (house). They give up if you stay out of sight for a while.', time: 0, words: [['vigiles', 'the watch, firemen'], ['fuga', 'escape, flight']],
        steps: [{ t: 'escape', at: 'domus', wanted: 3, text: 'Lose the vigiles and reach the domus (house).' }] },
      { id: 'thermae', title: 'Ad thermas', brief: 'One last job: carry Gaius’s letters to the baths (thermae), then to the Pantheon, then home, by chariot and against the clock. The watch is still looking for you.', time: 170, words: [['ad', 'to, towards'], ['celeriter', 'quickly']],
        steps: [{ t: 'ride', at: 'stabulum2', text: 'Get a chariot at the stabulum near the Colosseum.' }, { t: 'go', at: 'thermae', need: 'vehicle', wanted: 1, text: 'Drive to the thermae (baths).' }, { t: 'go', at: 'pantheum', need: 'vehicle', text: 'Now the Pantheum (Pantheon).' }, { t: 'go', at: 'domus', text: 'Back to the domus (house)!' }] }
    ];
    return m;
  }

  // ---------- Athens ----------
  function athens() {
    var m = new Map(96, 72);
    streets(m, [8, 20, 34, 60], [12, 26, 62, 76, 88], 21);
    // the city wall and the Dipylon gate
    m.fill(2, 0, 3, m.h - 1, 9); m.fill(0, 0, 1, m.h - 1, 3); trees(m, 0, 0, 1, m.h - 1, 20, 5);
    m.fill(1, 7, 7, 10, 2); m.fill(2, 7, 3, 7, 9); m.fill(2, 10, 3, 10, 9);
    m.mark({ id: 'pyle', w: 'πύλη', e: 'gate (the Dipylon)', x: 5, y: 8.5, label: 1 });
    // the Panathenaic Way, from the gate through the market to the Acropolis
    m.line(6, 8, 30, 24, 2, 0, 1); m.line(36, 32, 40, 38, 2, 0, 1);
    // the market (agora) with the Stoa of Attalos and a temple
    m.fill(28, 21, 43, 32, 2); m.fill(44, 21, 45, 32, 6); m.deco.push({ k: 'stoa', x: 44, y: 21, w: 2, h: 12 }); m.fill(29, 22, 31, 23, 6); m.deco.push({ k: 'temple', x: 29, y: 22, w: 3, h: 2 });
    m.mark({ id: 'agora', w: 'ἀγορά', e: 'market place', x: 36, y: 26.5, label: 1 });
    m.mark({ id: 'stoa', w: 'στοά', e: 'colonnade, porch', x: 45, y: 27, label: 1, onTop: 1 });
    // the Acropolis rock, with the road round it, and the Parthenon
    m.ellipse(48, 44, 14, 8.5, 0, 1); m.ellipse(48, 44, 11, 6, 10);
    m.deco.push({ k: 'parthenon', x: 50, y: 43 });
    m.mark({ id: 'naos', w: 'ναός', e: 'temple (the Parthenon)', x: 50, y: 41, label: 1, onTop: 1, visit: [38.5, 44] });
    // the Areopagus, the rock of Ares
    m.ellipse(33, 41, 4.6, 3.6, 0, 1); m.ellipse(33, 41, 3.2, 2.3, 11);
    m.mark({ id: 'areopagus', w: 'Ἄρειος Πάγος', e: 'the Areopagus, “hill of Ares”, where the council met', x: 33, y: 41, label: 1 });
    // the fountain house
    m.fill(37, 34, 41, 36, 2); m.fill(38, 34, 39, 35, 6); m.deco.push({ k: 'fountain', x: 38, y: 34, w: 2, h: 2 }); m.mark({ id: 'pege', w: 'πηγή', e: 'spring, fountain', x: 39, y: 36.4, label: 1 });
    // the Roman market and the Tower of the Winds
    m.fill(54, 23, 61, 31, 2); m.ellipse(59.5, 27, 1.3, 1.3, 6); m.deco.push({ k: 'tower', x: 59.5, y: 27 });
    m.mark({ id: 'winds', w: '', e: 'Tower of the Winds (a water clock)', x: 57, y: 30, label: 1 });
    // the theatre of Dionysus on the south slope
    m.fill(51, 51, 61, 58, 2); m.ellipse(56, 51.5, 4.6, 4.6, 6, 2); m.fill(51, 51, 61, 51, 0);
    m.deco.push({ k: 'theatre', x: 56, y: 51.5, r: 4.6 });
    m.mark({ id: 'theatron', w: 'θέατρον', e: 'theatre', x: 56, y: 57.5, label: 1 });
    // the stadium, and its turning posts
    m.fill(71, 46, 91, 61, 9); m.fill(73, 48, 89, 59, 8); m.fill(78, 53, 85, 54, 9); m.fill(64, 52, 72, 55, 8); m.fill(63, 52, 63, 55, 0);
    m.deco.push({ k: 'stadium', x: 71, y: 46, w: 21, h: 16 });
    m.mark({ id: 'stadion', w: 'στάδιον', e: 'stadium, race track', x: 81.5, y: 50, label: 1, onTop: 1 });
    // the Ilissos stream
    for (var x = 40; x < m.w - 1; x++) m.fill(x, 64 + Math.round(Math.sin(x / 6)), x, 65 + Math.round(Math.sin(x / 6)), 4);
    [62, 76, 88].forEach(function (bx) { m.fill(bx, 62, bx + 1, 68, 5, 4); });
    // stables, Nikias's house, a garden
    m.fill(15, 43, 21, 48, 2); m.mark({ id: 'hippoi', w: 'ἵπποι', e: 'horses (the stables)', x: 18, y: 45.5, label: 1 });
    m.fill(64, 36, 70, 40, 2); m.mark({ id: 'hippoi2', w: 'ἵπποι', e: 'horses (the stables)', x: 67, y: 38, label: 1 });
    m.fill(15, 24, 21, 29, 2); m.fill(16, 24, 20, 25, 6); m.deco.push({ k: 'house', x: 16, y: 24, w: 5, h: 2 }); m.mark({ id: 'oikos', w: 'οἶκος', e: 'house', x: 18, y: 27.5, label: 1 });
    m.fill(64, 10, 74, 18, 3); trees(m, 64, 10, 74, 18, 26, 9); m.fill(64, 14, 74, 14, 0);
    m.mark({ id: 'kepos', w: 'κῆπος', e: 'garden', x: 69, y: 12, label: 1 });
    m.spots = { start: [18, 28.7], patron: [18, 27.2], chariots: [[16.5, 44.5], [18.5, 44.5], [20.5, 44.5], [65.5, 37.5], [68.5, 37.5]], carts: 5,
      race: { pts: [[81.5, 57.5], [87.5, 57.5], [87.6, 53.5], [87.5, 49.5], [81.5, 49.5], [75, 49.5], [74.6, 53.5], [75, 57.5]], grid: [[77, 56.6], [77, 58.2], [75.6, 56.6], [75.6, 58.2]], laps: 2, foot: 1,
        rivals: [['Kallias', '#c0392b'], ['Dion', '#eeeeee'], ['Lykon', '#2f6fb5']], you: ['You', '#2e8b57'] },
      scrolls: [[5, 40], [40, 9], [92, 30], [70, 70], [30, 62]] };
    m.name = 'Athens'; m.when = 'about AD 50, when Paul visited'; m.lang = 'g'; m.guards = { name: 'the city guards (φύλακες)', col: '#2f5f9a' };
    m.palette = { road: '#d2c4a4', roof: ['#c06a45', '#b35f3d', '#c97a50', '#a95a3a'], grass: '#9aab62', plaza: '#ece4d2' };
    m.lines = [['Χαῖρε!', 'Greetings!'], ['Εἰρήνη!', 'Peace!'], ['Βλέπετε!', 'Watch out!'], ['Ναί.', 'Yes.'], ['Οὔ.', 'No.'], ['Ἔρρωσθε.', 'Farewell.'], ['Εὖ!', 'Well done!'], ['Ταχέως!', 'Quickly!']];
    m.missions = [
      { id: 'elaion', title: 'Ἔλαιον', brief: 'Nikias sells olive oil (ἔλαιον). Carry a jar of it from the ἀγορά (market place) to the θέατρον (theatre), for the lamps at tonight’s play.', time: 200, words: [['ἔλαιον', 'olive oil'], ['ἀγορά', 'market place']],
        steps: [{ t: 'go', at: 'agora', text: 'Collect the oil at the ἀγορά (market).', item: 'jar', pick: 'You pick up the jar of oil.' }, { t: 'go', at: 'theatron', text: 'Carry it to the θέατρον (theatre).' }] },
      { id: 'harma', title: 'Ἅρμα', brief: 'Take a chariot (ἅρμα) from the stables and carry Nikias’s message to the Ἄρειος Πάγος, the rock where the city council met, and where Paul once spoke to the Athenians (Acts 17).', time: 130, words: [['ἅρμα', 'chariot'], ['ἵππος', 'horse']],
        steps: [{ t: 'ride', at: 'hippoi', text: 'Go to the stables (ἵπποι) and get into a chariot.' }, { t: 'go', at: 'areopagus', need: 'vehicle', text: 'Drive to the Ἄρειος Πάγος.' }] },
      { id: 'kleptes', title: 'Κλέπτης', brief: 'A thief (κλέπτης) has stolen a purse in the market! Catch him before he escapes. He is fast at first, but he will tire.', time: 100, words: [['κλέπτης', 'thief'], ['βαλλάντιον', 'purse']],
        steps: [{ t: 'go', at: 'agora', text: 'Hurry to the ἀγορά.' }, { t: 'catch', text: 'Catch the κλέπτης (thief)!' }] },
      { id: 'stadion', title: 'Στάδιον', brief: 'A foot race in the στάδιον, the stadium of the Panathenaic Games. Two laps round the turning posts. Paul writes that in a stadium all the runners run, but only one wins the prize (1 Corinthians 9:24). Hold Shift, or the Run button, to sprint.', time: 0, words: [['στάδιον', 'stadium'], ['τρέχω', 'I run']],
        steps: [{ t: 'race', text: 'Win the race: two laps!' }] },
      { id: 'biblia', title: 'Βιβλία', brief: 'Five of Nikias’s scrolls (βιβλία) have been lost around the city. Find them all. The map in the corner shows where they are.', time: 240, words: [['βιβλίον', 'book, scroll'], ['ἐπιστολή', 'letter']],
        steps: [{ t: 'collect', text: 'Collect the five βιβλία (scrolls).' }] },
      { id: 'phylakes', title: 'Φύλακες', brief: 'The city guards (φύλακες) think you are the thief! Lose them and get back to Nikias’s οἶκος (house). They give up if you stay out of sight for a while.', time: 0, words: [['φύλαξ', 'guard'], ['φεύγω', 'I flee']],
        steps: [{ t: 'escape', at: 'oikos', wanted: 3, text: 'Lose the φύλακες and reach the οἶκος (house).' }] },
      { id: 'naos', title: 'Ναός', brief: 'One last errand, by chariot and against the clock: water from the πηγή (fountain), an offering to the ναός (temple) at the foot of the Acropolis, then home. The guards are still watching.', time: 170, words: [['ναός', 'temple'], ['πηγή', 'spring, fountain']],
        steps: [{ t: 'ride', at: 'hippoi2', text: 'Get a chariot at the stables (ἵπποι).' }, { t: 'go', at: 'pege', need: 'vehicle', wanted: 1, text: 'Drive to the πηγή (fountain).' }, { t: 'go', at: 'naos', need: 'vehicle', text: 'Now to the ναός (temple), at the foot of the Acropolis.' }, { t: 'go', at: 'oikos', text: 'Back to the οἶκος (house)!' }] }
    ];
    return m;
  }
  W.CityData = { rome: rome, athens: athens, WALK: WALK };
})(window);
