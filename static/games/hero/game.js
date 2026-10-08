/* Hero's Road: a side-scrolling platformer in three settings.
   Greece: Theseus on the road to Athens and into the Labyrinth, with Koine Greek words.
   Rome: Hercules on the road to the Tiber and into Cacus' cave, with Latin words.
   The Odyssey: Odysseus sailing island to island to the Cyclops' cave, with Koine Greek words.
   Every Greek and Latin word comes from Mosaic Match's list: Latin in its dictionary form, every Greek word found in the New Testament. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('hr'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var TR = function (s) { return W.grTranslit ? W.grTranslit(s) : ''; };

  // English -> [Koine Greek, Latin]
  var VOC = {"sun": ["ἥλιος", "sol"], "tree": ["δένδρον", "arbor"], "olive": ["ἐλαία", "oliva"], "wheat": ["σῖτος", "triticum"], "flower": ["ἄνθος", "flos"], "sheep": ["πρόβατον", "ovis"], "ox": ["βοῦς", "bos"], "horse": ["ἵππος", "equus"], "water": ["ὕδωρ", "aqua"], "road": ["ὁδός", "via"], "bread": ["ἄρτος", "panis"], "honey": ["μέλι", "mel"], "grass": ["χόρτος", "herba"], "house": ["οἶκος", "domus"], "river": ["ποταμός", "flumen"], "wine": ["οἶνος", "vinum"], "stone": ["λίθος", "lapis"], "mountain": ["ὄρος", "mons"], "sea": ["θάλασσα", "mare"], "ship": ["πλοῖον", "navis"], "wind": ["ἄνεμος", "ventus"], "cloud": ["νεφέλη", "nubes"], "rain": ["βροχή", "pluvia"], "island": ["νῆσος", "insula"], "shore": ["αἰγιαλός", "litus"], "fish": ["ἰχθύς", "piscis"], "anchor": ["ἄγκυρα", "ancora"], "net": ["δίκτυον", "rete"], "small boat": ["πλοιάριον", "navicula"], "eagle": ["ἀετός", "aquila"], "wall": ["τεῖχος", "murus"], "tower": ["πύργος", "turris"], "city": ["πόλις", "civitas"], "village": ["κώμη", "vicus"], "king": ["βασιλεύς", "rex"], "queen": ["βασίλισσα", "regina"], "crown": ["στέφανος", "corona"], "sword": ["μάχαιρα", "gladius"], "shield": ["θυρεός", "scutum"], "helmet": ["περικεφαλαία", "galea"], "spring": ["πηγή", "fons"], "lamp": ["λύχνος", "lucerna"], "light": ["φῶς", "lux"], "night": ["νύξ", "nox"], "key": ["κλείς", "clavis"], "chain": ["ἅλυσις", "catena"], "well": ["φρέαρ", "puteus"], "snake": ["ὄφις", "serpens"], "scorpion": ["σκορπίος", "scorpio"], "worm": ["σκώληξ", "vermis"], "sleep": ["ὕπνος", "somnus"], "eye": ["ὀφθαλμός", "oculus"], "hand": ["χείρ", "manus"], "foot": ["πούς", "pes"], "rope": ["σχοινίον", "funiculus"], "door": ["θύρα", "ostium"], "tomb": ["μνημεῖον", "monumentum"], "fire": ["πῦρ", "ignis"], "bow": ["τόξον", "arcus"], "trumpet": ["σάλπιγξ", "tuba"], "war": ["πόλεμος", "bellum"], "chariot": ["ἅρμα", "currus"], "wheel": ["τροχός", "rota"], "axe": ["ἀξίνη", "securis"], "cup": ["ποτήριον", "calix"], "ring": ["δακτύλιος", "anulus"], "gift": ["δῶρον", "donum"], "table": ["τράπεζα", "mensa"], "seat": ["καθέδρα", "cathedra"], "heart": ["καρδία", "cor"], "wolf": ["λύκος", "lupus"], "fox": ["ἀλώπηξ", "vulpes"], "frog": ["βάτραχος", "rana"], "locust": ["ἀκρίς", "locusta"], "sandal": ["ὑπόδημα", "calceamentum"]};
  VOC.coin = ['δραχμή', 'denarius'];

  // ---------- settings and levels ----------
  var SET = {
    gr: {
      name: 'Greece', hero: 'Theseus', lang: 'Koine Greek', coin: 'drachma', flyer: 'eagle', boss: 'the Minotaur',
      levels: [
        { name: 'The Road from Troezen', kind: 'field', words: ['sun', 'tree', 'olive', 'wheat', 'flower', 'sheep', 'ox', 'horse', 'water', 'road', 'bread', 'honey', 'grass', 'house', 'river', 'wine'],
          story: 'Theseus grew up in Troezen. To reach his father in Athens he chose the dangerous coast road instead of the sea, clearing it of bandits as he went.' },
        { name: 'The Cliffs of Sciron', kind: 'cliff', words: ['stone', 'mountain', 'sea', 'ship', 'wind', 'cloud', 'rain', 'island', 'shore', 'fish', 'anchor', 'net', 'small boat', 'eagle', 'wall', 'tower'],
          story: 'On the cliffs near Megara the bandit Sciron made travellers wash his feet, then kicked them into the sea. Theseus threw him off his own cliff.' },
        { name: 'The Labyrinth', kind: 'cave', words: ['lamp', 'light', 'night', 'key', 'chain', 'well', 'snake', 'scorpion', 'worm', 'sleep', 'eye', 'hand', 'foot', 'rope', 'door', 'tomb'],
          story: 'In Crete, King Minos fed young Athenians to the Minotaur in the Labyrinth. Ariadne gave Theseus a ball of thread so he could find his way out again.' },
        { name: 'The Minotaur’s Hall', kind: 'castle', words: ['fire', 'bow', 'trumpet', 'war', 'chariot', 'wheel', 'axe', 'king', 'crown', 'cup', 'ring', 'gift', 'table', 'seat', 'heart', 'sword'],
          story: 'At the heart of the Labyrinth waits the Minotaur, half man and half bull. Pull the lever behind him, or wear him down with stones.' }
      ],
      ending: 'Theseus killed the Minotaur and followed Ariadne’s thread back out of the Labyrinth. On the way home he forgot to change his black sails to white, and his father Aegeus, seeing them, threw himself into the sea that now bears his name.'
    },
    ro: {
      name: 'Rome', hero: 'Hercules', lang: 'Latin', coin: 'denarius', flyer: 'locust', boss: 'Cacus',
      levels: [
        { name: 'Along the Tiber', kind: 'field', words: ['sun', 'tree', 'olive', 'wheat', 'flower', 'sheep', 'ox', 'horse', 'water', 'road', 'bread', 'honey', 'grass', 'house', 'river', 'wine'],
          story: 'Hercules was driving the cattle of Geryon home from Spain. In Italy he rested them in the grassy meadows by the Tiber, where Rome would one day stand.' },
        { name: 'Evander’s Hills', kind: 'cliff', words: ['stone', 'mountain', 'wall', 'tower', 'city', 'village', 'king', 'queen', 'crown', 'sword', 'shield', 'helmet', 'spring', 'wind', 'cloud', 'rain'],
          story: 'King Evander ruled a small town on the Palatine. While Hercules slept, some of his cattle went missing, dragged backwards by their tails so the tracks would mislead him.' },
        { name: 'Cacus’ Cave', kind: 'cave', words: ['lamp', 'light', 'night', 'key', 'chain', 'well', 'snake', 'scorpion', 'worm', 'sleep', 'eye', 'hand', 'foot', 'rope', 'door', 'tomb'],
          story: 'A lowing from inside the Aventine gave the thief away. Hercules tore the roof off the cave to get in.' },
        { name: 'The Fires of Cacus', kind: 'castle', words: ['fire', 'bow', 'trumpet', 'war', 'chariot', 'wheel', 'axe', 'king', 'crown', 'cup', 'ring', 'gift', 'table', 'seat', 'heart', 'sword'],
          story: 'Cacus, a son of Vulcan, breathes fire and smoke. Pull the lever behind him, or wear him down with stones.' }
      ],
      ending: 'Hercules choked Cacus in his own smoke-filled cave and freed the cattle. Virgil tells the story in Aeneid 8, and Livy in his first book: Evander’s people honoured Hercules at the Great Altar, the Ara Maxima, beside the cattle market.'
    },
    od: {
      name: 'The Odyssey', hero: 'Odysseus', lang: 'Koine Greek', coin: 'drachma', flyer: 'eagle', boss: 'the Cyclops',
      levels: [
        { name: 'The Lotus-Eaters', kind: 'field', words: ['sun', 'flower', 'honey', 'tree', 'olive', 'water', 'bread', 'fish', 'wine', 'grass', 'river', 'sheep', 'road', 'house', 'island', 'shore'],
          story: 'Sailing home from Troy, Odysseus was blown off course to the land of the Lotus-Eaters. Whoever tasted the honey-sweet lotus forgot all about going home, so Odysseus had to drag his men back to the ships.' },
        { name: 'Island to Island', kind: 'sea', words: ['sea', 'ship', 'small boat', 'wind', 'cloud', 'rain', 'island', 'shore', 'anchor', 'net', 'fish', 'eagle', 'stone', 'mountain', 'spring', 'water'],
          story: 'Next they reached a wooded island full of wild goats, lying just off the land of the Cyclopes. Cross the strait from boat to boat and rock to rock.' },
        { name: 'The Cyclops’ Cave', kind: 'cave', words: ['lamp', 'fire', 'night', 'sheep', 'eye', 'sleep', 'cup', 'wine', 'door', 'stone', 'hand', 'foot', 'rope', 'key', 'chain', 'well'],
          story: 'Odysseus took twelve men into a huge cave full of cheeses and lambs. Its owner, the one-eyed giant Polyphemus, came home, rolled a great stone across the doorway and ate two of the men.' },
        { name: 'Polyphemus', kind: 'castle', words: ['fire', 'bow', 'war', 'king', 'queen', 'crown', 'ring', 'gift', 'table', 'seat', 'heart', 'sword', 'shield', 'helmet', 'tower', 'wall'],
          story: 'Odysseus gave the giant strong wine and told him his name was Nobody. Now get past Polyphemus and his hurled rocks: pull the lever behind him to tip him into the fire pit, or wear him down with stones.' }
      ],
      ending: 'While Polyphemus slept, Odysseus and his men drove a sharpened olive stake into his one eye. When the other Cyclopes came running, he shouted that Nobody was hurting him, so they went away. Next morning the Greeks slipped out tied under the bellies of his rams. Homer tells the story in book 9 of the Odyssey; it took Odysseus ten years in all to sail home to Ithaca.'
    }
  };
  var ORDER = ['gr', 'ro', 'od'];
  function lat() { return G && G.set === 'ro'; }
  var ENW = { wolf: 'wolf', fox: 'fox', frog: 'frog', scorp: 'scorpion', snake: 'snake', podo: 'fire', bar: 'fire' };

  // ---------- save ----------
  var KEY = 'trb-hero-v1', st = { set: 'gr', words: true, open: { gr: 1, ro: 1, od: 1 }, done: {}, seen: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  function word(eng) { var v = VOC[eng]; var g = G && G.set === 'ro' ? v[1] : v[0]; return { f: g, e: eng === 'coin' ? (G.set !== 'ro' ? 'drachma, a silver coin' : 'denarius, a silver coin') : eng, p: G && G.set !== 'ro' ? TR(g) : '' }; }

  // ---------- level building ----------
  var GY = 12, ROWS = 15;
  function Build(kind) { this.kind = kind; this.g = []; this.x = 0; this.s = 0; this.ents = []; this.gates = []; this.goalX = 0; this.noCeil = 1e9; }
  var B = Build.prototype;
  B.colm = function (x) { while (this.g.length <= x) { var c = []; for (var i = 0; i < ROWS; i++) c.push('.'); this.g.push(c); } return this.g[x]; };
  B.set = function (x, y, ch) { this.colm(x)[y] = ch; };
  B.ground = function (x) { var c = this.colm(x); for (var y = GY; y < ROWS; y++) c[y] = '#'; };
  B.flat = function (n) { this.s = this.x; for (var i = 0; i < n; i++) this.ground(this.x + i); this.x += n; return this; };
  B.pit = function (n) { this.s = this.x; for (var i = 0; i < n; i++) { this.colm(this.x + i); if (this.kind === 'castle') { this.set(this.x + i, 13, 'L'); this.set(this.x + i, 14, 'L'); } } this.x += n; return this; };
  B.at = function (dx, y, str) { for (var i = 0; i < str.length; i++) if (str[i] !== ' ') this.set(this.s + dx + i, y, str[i]); return this; };
  B.en = function (dx, k, row) { this.ents.push({ k: k, x: this.s + dx + 0.5, y: row == null ? GY : row + 1 }); return this; };
  B.col = function (dx, h, snake) { for (var j = 0; j < 2; j++) for (var y = GY - h; y < GY; y++) this.set(this.s + dx + j, y, 'P'); if (snake) this.ents.push({ k: 'snake', x: this.s + dx + 1, y: GY - h }); return this; };
  B.up = function (h) { var s = this.x; this.flat(h); for (var i = 0; i < h; i++) for (var y = GY - 1 - i; y < GY; y++) this.set(s + i, y, 'X'); this.s = s; return this; };
  B.down = function (h) { var s = this.x; this.flat(h); for (var i = 0; i < h; i++) for (var y = GY - h + i; y < GY; y++) this.set(s + i, y, 'X'); this.s = s; return this; };
  B.ledges = function (n, list) { this.pit(n); var s = this.s; list.forEach(function (l) { for (var j = 0; j < l[2]; j++) this.set(s + l[0] + j, l[1], '-'); }, this); return this; };
  B.mplat = function (n, y, a, b) { this.pit(n); this.ents.push({ k: 'plat', x: this.s + a, y: y, a: this.s + a, b: this.s + b }); return this; };
  B.check = function (dx) { this.ents.push({ k: 'check', x: this.s + dx + 0.5, y: GY }); return this; };
  B.bar = function (dx, y) { this.set(this.s + dx, y, 'X'); this.ents.push({ k: 'bar', x: this.s + dx + 0.5, y: y + 0.5 }); return this; };
  B.podo = function (dx) { this.ents.push({ k: 'podo', x: this.s + dx + 0.5, y: 14 }); return this; };
  // A gate: a wall with two doorways. The word is on the wall; each doorway is marked with a meaning.
  B.gate = function () {
    var s = this.x; this.flat(28); this.s = s;
    this.at(2, 9, '---');
    for (var j = 6; j <= 24; j++) this.set(s + j, 7, 'X');
    var wx = s + 10;
    for (var y = 1; y <= 11; y++) if (y !== 5 && y !== 6 && y !== 10 && y !== 11 && y !== 7) this.set(wx, y, 'W');
    this.gates.push({ x: wx });
    return this;
  };
  B.boss = function () {
    this.flat(5); var s = this.x; this.s = s;
    for (var i = 0; i < 14; i++) { this.colm(s + i); this.set(s + i, GY, 'b'); this.set(s + i, 13, 'L'); this.set(s + i, 14, 'L'); }
    this.x += 14; this.flat(16);
    this.ents.push({ k: 'boss', x: s + 10, y: GY }); this.ents.push({ k: 'lever', x: s + 14.5, y: GY });
    this.bridge = s; this.goalX = s + 22; return this;
  };
  B.goal = function () {
    this.up(4); this.flat(2); var px = this.x; this.flat(16); this.set(px, GY - 1, 'X');
    this.ents.push({ k: 'pole', x: px + 0.5, y: GY - 1 }); this.goalX = px; this.noCeil = px - 10; return this;
  };

  function makeLevel(li) {
    var kind = SET[G.set].levels[li].kind, b = new Build(kind), fl = G.set === 'ro' ? 'locust' : 'eagle';
    if (G.set === 'od' && li === 1) {
      // island to island: boats (moving platforms), rocks and small islets
      b.flat(14).at(6, 8, '?!?').en(11, 'frog')
        .mplat(9, 10, 1, 5)
        .flat(6).at(2, 8, '?').en(4, 'wolf')
        .ledges(11, [[1, 10, 2], [5, 9, 2], [9, 10, 2]]).at(5, 7, 'oo')
        .flat(8).en(5, fl, 7).at(3, 8, 'B?B')
        .mplat(12, 9, 1, 8)
        .flat(10).en(4, 'fox').check(7)
        .mplat(10, 10, 1, 6).at(4, 6, 'ooo')
        .flat(6).at(2, 8, '*')
        .gate()
        .flat(6).en(3, 'frog')
        .ledges(12, [[1, 10, 2], [4, 8, 2], [8, 9, 1], [10, 10, 2]])
        .flat(8).en(4, fl, 6).at(2, 8, '?B?')
        .mplat(11, 9, 1, 7)
        .flat(8).col(3, 3, true).en(6, 'wolf')
        .mplat(10, 10, 1, 6)
        .flat(4).goal();
    } else if (li === 0) {
      b.flat(22).at(12, 8, '?').at(16, 8, 'B!B?B').at(18, 4, '?').en(19, 'wolf')
        .flat(10).col(2, 2).col(7, 3).en(5, 'wolf')
        .flat(10).col(6, 4).en(2, 'wolf').en(4, 'wolf')
        .flat(6).pit(2).at(0, 9, 'oo')
        .flat(16).at(2, 8, 'B?B').at(6, 4, 'BBBBBBBB').at(7, 3, 'oooooo').en(7, 'wolf').en(9, 'wolf')
        .pit(3).at(0, 9, 'ooo')
        .flat(14).at(3, 8, 'BB?B').at(9, 8, '?').en(6, 'fox').check(12)
        .flat(12).at(2, 8, '?').at(5, 8, '?').at(5, 4, '*').at(8, 8, '?').en(10, 'frog')
        .gate()
        .flat(6).up(4).pit(2).down(4)
        .flat(12).at(3, 8, 'BB?B').en(6, 'wolf').en(8, 'wolf')
        .flat(6).col(2, 2)
        .flat(4).goal();
    } else if (li === 1) {
      b.flat(14).at(6, 8, '?!?').en(11, 'wolf')
        .ledges(10, [[1, 9, 3], [6, 8, 3]]).at(6, 6, 'ooo')
        .flat(8).en(5, 'frog')
        .pit(3).at(0, 8, 'ooo')
        .flat(8).en(5, fl, 7)
        .mplat(9, 9, 1, 5)
        .flat(12).at(3, 8, 'B?B').at(4, 4, '?').en(7, 'wolf').en(9, 'frog').check(1)
        .ledges(12, [[1, 10, 2], [5, 8, 2], [9, 10, 2]])
        .flat(10).col(3, 3, true).en(7, 'fox')
        .gate()
        .flat(8).en(4, fl, 6).at(2, 8, '?*')
        .pit(4).at(1, 8, 'oo')
        .flat(6).en(3, 'frog')
        .mplat(10, 8, 1, 6)
        .flat(6).up(5).pit(3).down(5)
        .flat(8).en(4, 'wolf').en(6, fl, 7)
        .flat(4).goal();
    } else if (li === 2) {
      b.flat(12).at(5, 8, '?!?')
        .flat(14).at(0, 8, 'BBBBBBBBBBBBBB').at(1, 6, 'oooooooooooo').en(6, 'wolf').en(10, 'scorp')
        .flat(12).col(2, 3, true).col(8, 2, true).en(5, 'wolf')
        .pit(3)
        .flat(10).en(3, 'scorp').en(6, 'wolf').at(4, 8, 'B?B')
        .flat(12).at(2, 10, 'X').at(4, 9, 'XX').at(7, 8, 'XXX').at(7, 5, '*').en(10, 'scorp').check(0)
        .pit(3)
        .flat(6)
        .gate()
        .flat(12).en(3, 'wolf').en(5, 'wolf').en(8, 'scorp').at(3, 8, 'B?B?B')
        .ledges(10, [[2, 9, 2], [6, 9, 2]]).at(2, 7, 'oo').at(6, 7, 'oo')
        .flat(10).col(3, 4, true).en(7, 'fox')
        .flat(8).at(2, 8, '?').en(6, 'scorp')
        .flat(4).goal();
    } else {
      b.flat(8).at(4, 8, '?')
        .pit(3).podo(1)
        .flat(8).bar(4, 8)
        .pit(3).podo(1)
        .flat(12).at(3, 8, '?!?').en(7, 'wolf').en(9, 'scorp').check(11)
        .flat(10).bar(5, 7).at(1, 4, '*')
        .pit(4).podo(1).podo(3)
        .flat(6)
        .gate()
        .flat(8).bar(4, 9).en(7, 'scorp')
        .ledges(10, [[2, 10, 2], [6, 9, 2]]).podo(4).podo(8)
        .flat(6).at(2, 8, '?!')
        .boss();
    }
    if (kind === 'cave' || kind === 'castle') for (var x = 0; x < b.g.length; x++) if (x < b.noCeil) { b.set(x, 0, '#'); b.set(x, 1, '#'); }
    for (x = 0; x < b.g.length; x++) b.colm(x);
    return b;
  }

  // ---------- canvas ----------
  var cv = $('canvas'), c = cv.getContext('2d'), dpr = 1, Wd = 0, Ht = 0, S = 32, oy = 0, viewCols = 20;
  var touch = ('ontouchstart' in W) || (W.matchMedia && W.matchMedia('(pointer:coarse)').matches);
  function fit() {
    dpr = Math.min(2, W.devicePixelRatio || 1); Wd = cv.clientWidth; Ht = cv.clientHeight;
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr);
    var ctl = touch && Ht > Wd ? 150 : 0;
    S = Math.max(12, Math.floor(Math.min((Ht - ctl) / ROWS, Wd / (Ht > Wd ? 11 : 13))));
    viewCols = Wd / S; oy = Math.max(0, Math.round((Ht - ctl - ROWS * S) / 2));
  }
  W.addEventListener('resize', fit);

  // ---------- state ----------
  var G = null, p = null, paused = true, keys = {}, last = 0, god = false;
  var SOLID = '#BX?!*UPWb';
  function tile(x, y) { if (x < 0 || x >= G.L.g.length) return 'X'; if (y < 0 || y >= ROWS) return '.'; return G.L.g[x][y]; }
  function solid(ch) { return SOLID.indexOf(ch) >= 0; }

  function newRun(set, li) { G = { set: set, li: li, seenL: [], seenSet: {}, falls: 0, time: 0, gatesOK: 0, gatesN: 0, chk: null, coins: 0, chkCoins: 0, power: 0 }; startLevel(); }
  function startLevel() {
    var L = makeLevel(G.li);
    G.L = L; G.ents = []; G.fx = []; G.floats = []; G.t = 0; G.over = false; G.clear = 0; G.bossDead = false; G.collapse = -1;
    G.coins = G.chk ? G.chkCoins : 0; G.wordQ = 0;
    G.gates = L.gates.map(function (g) { return { x: g.x, done: false, pick: null }; });
    G.gates.forEach(prepGate);
    L.ents.forEach(function (e) { spawn(e); });
    var sx = G.chk ? G.chk.x : 2;
    p = { x: sx, y: GY - 0.92, w: 0.7, h: 0.92, vx: 0, vy: 0, on: true, face: 1, power: G.chk ? G.chkPower : 0, inv: 0, star: 0, dead: 0, win: 0, walk: 0, cool: 0, held: 0, runT: 0 };
    G.camX = Math.max(0, sx - 4);
    hud(); paused = false; last = 0;
  }
  var DEF = {
    wolf: { w: 0.95, h: 0.75, sp: 2.0, stomp: 1 }, fox: { w: 0.95, h: 0.7, sp: 3.6, stomp: 1 }, frog: { w: 0.8, h: 0.6, sp: 0, stomp: 1 },
    scorp: { w: 0.95, h: 0.55, sp: 1.5, stomp: 0 }, eagle: { w: 1, h: 0.6, sp: 2.4, stomp: 1, fly: 1 }, locust: { w: 1, h: 0.6, sp: 2.4, stomp: 1, fly: 1 },
    snake: { w: 0.7, h: 1.3, sp: 0, stomp: 0 }, podo: { w: 0.6, h: 0.6, sp: 0, stomp: 0 }, boss: { w: 1.8, h: 2, sp: 0, stomp: 0 }
  };
  function spawn(e) {
    var d = DEF[e.k], o = { k: e.k, x: e.x, y: e.y, vx: 0, vy: 0, t: 0, act: false, alive: true };
    if (d) { o.w = d.w; o.h = d.h; o.x = e.x - d.w / 2; o.y = e.y - d.h; o.vx = -d.sp; o.stomp = d.stomp; o.fly = d.fly; o.base = o.y; }
    if (e.k === 'snake') { o.x = e.x - 0.35; o.base = e.y; o.o = 0; o.ph = 0; o.t = rnd(0, 2); }
    if (e.k === 'podo') { o.x = e.x - 0.3; o.y = 14.5; o.t = rnd(0.5, 2); }
    if (e.k === 'plat') { o.w = 3; o.h = 0.4; o.dir = 1; o.dx = 0; o.a = e.a; o.b = e.b; }
    if (e.k === 'bar') { o.a = rnd(0, 6.28); }
    if (e.k === 'boss') { o.hp = 6; o.t = 1.5; o.home = o.x; o.face = -1; }
    if (e.k === 'check') { o.on = G.chk && G.chk.x === e.x - 0.5; }
    G.ents.push(o); return o;
  }
  function prepGate(g) {
    var lw = SET[G.set].levels[G.li].words;
    if (!st.words) { for (var j = 3; j <= 10; j++) G.L.g[g.x + j][5] = 'o'; return; }
    g.answer = null; // chosen when the player first sees the gate, from the words met so far
  }
  function gateQuiz(g) {
    var lw = SET[G.set].levels[G.li].words, used = G.gates.map(function (x) { return x.e; });
    var pool = G.seenL.filter(function (e) { return lw.indexOf(e) >= 0 && used.indexOf(e) < 0; });
    if (!pool.length) pool = lw.filter(function (e) { return used.indexOf(e) < 0; });
    g.e = pick(pool); var wrong = pick(lw.filter(function (e) { return e !== g.e; }));
    g.upRight = Math.random() < 0.5; g.up = g.upRight ? g.e : wrong; g.low = g.upRight ? wrong : g.e;
  }

  // ---------- physics ----------
  function moveBody(b, dt) {
    var hitX = false, y0, y1, x0, x1, x, y, ch;
    b.x += b.vx * dt;
    y0 = Math.floor(b.y + 0.02); y1 = Math.floor(b.y + b.h - 0.02);
    if (b.vx > 0) { x = Math.floor(b.x + b.w); for (y = y0; y <= y1; y++) if (solid(tile(x, y))) { b.x = x - b.w; hitX = true; break; } }
    else if (b.vx < 0) { x = Math.floor(b.x); for (y = y0; y <= y1; y++) if (solid(tile(x, y))) { b.x = x + 1; hitX = true; break; } }
    var prevB = b.y + b.h; b.y += b.vy * dt; b.on = false; b.head = null;
    x0 = Math.floor(b.x + 0.02); x1 = Math.floor(b.x + b.w - 0.02);
    if (b.vy >= 0) {
      y = Math.floor(b.y + b.h);
      for (x = x0; x <= x1; x++) { ch = tile(x, y); if (solid(ch) || (ch === '-' && prevB <= y + 0.01)) { b.y = y - b.h; b.vy = 0; b.on = true; break; } }
    } else {
      y = Math.floor(b.y); var best = null, cx = b.x + b.w / 2;
      for (x = x0; x <= x1; x++) if (solid(tile(x, y))) { if (best === null || Math.abs(x + 0.5 - cx) < Math.abs(best + 0.5 - cx)) best = x; }
      if (best !== null) { b.y = y + 1; b.vy = 0; b.head = [best, y]; }
    }
    return hitX;
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function step(dt) {
    G.t += dt; if (!p.win && !p.dead) G.time += dt;
    var L = G.L, i, e;
    // platforms first, so a player standing on one is carried
    G.ents.forEach(function (e) {
      if (e.k !== 'plat') return; var ox = e.x; e.x += e.dir * 2.2 * dt; if (e.x > e.b) { e.x = e.b; e.dir = -1; } if (e.x < e.a) { e.x = e.a; e.dir = 1; } e.dx = e.x - ox;
      if (p.plat === e && !p.dead) p.x += e.dx;
    });
    if (p.dead) { p.dead -= dt; p.vy += 40 * dt; p.y += p.vy * dt; if (p.dead <= 0) { G.falls++; startLevel(); } return; }
    if (p.win) { winStep(dt); } else playerStep(dt);
    // camera
    var target = p.x - viewCols * 0.38, maxX = L.g.length - viewCols;
    G.camX += (target - G.camX) * Math.min(1, dt * 6); G.camX = Math.max(0, Math.min(maxX, G.camX));
    // entities
    for (i = 0; i < G.ents.length; i++) { e = G.ents[i]; if (e.alive !== false) entStep(e, dt); }
    G.ents = G.ents.filter(function (e) { return e.alive !== false; });
    G.fx.forEach(function (f) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g == null ? 30 : f.g) * dt; });
    G.fx = G.fx.filter(function (f) { return f.life > 0; });
    G.floats.forEach(function (f) { f.life -= dt; f.y -= dt * 0.6; }); G.floats = G.floats.filter(function (f) { return f.life > 0; });
    if (G.collapse >= 0) {
      G.cT = (G.cT || 0) + dt;
      while (G.cT > 0.07 && G.collapse >= 0) { G.cT -= 0.07; L.g[L.bridge + G.collapse][GY] = '.'; burst(L.bridge + G.collapse + 0.5, GY + 0.5, '#8a5a2b', 4); G.collapse--; }
    }
    if (G.bossDead) { G.bossDead -= dt; if (G.bossDead <= 0) { G.bossDead = false; levelClear(); } }
  }

  function playerStep(dt) {
    var L = G.L, left = keys.left, right = keys.right, run = keys.run || (touch && p.runT > 0.45);
    if (left || right) p.runT += dt; else p.runT = 0;
    var max = run ? 8.6 : 5.6, acc = p.on ? 22 : 15, dir = (right ? 1 : 0) - (left ? 1 : 0);
    if (p.star > 0) max *= 1.15;
    if (dir) { p.face = dir; if (p.vx * dir < max) p.vx += dir * acc * dt * (p.vx * dir < 0 ? 1.8 : 1); if (p.vx * dir > max) p.vx -= dir * 18 * dt; }
    else if (p.on) { var dec = 24 * dt; if (Math.abs(p.vx) <= dec) p.vx = 0; else p.vx -= Math.sign(p.vx) * dec; }
    // jump: a little coyote time and a jump buffer make it forgiving
    p.coy = p.on ? 0.1 : Math.max(0, (p.coy || 0) - dt);
    p.buf = keys.jumpPressed ? 0.12 : Math.max(0, (p.buf || 0) - dt); keys.jumpPressed = false;
    if (p.buf > 0 && p.coy > 0) { p.vy = -(15 + 1.6 * Math.min(1, Math.abs(p.vx) / 8.6)); p.coy = 0; p.buf = 0; p.on = false; p.plat = null; sfx('jump'); }
    var g = p.vy < 0 && keys.jump ? 28 : 55;
    p.vy = Math.min(18, p.vy + g * dt);
    // throw
    p.cool -= dt;
    if (keys.throwPressed && p.power === 2 && p.cool <= 0 && G.ents.filter(function (e) { return e.k === 'stone'; }).length < 2) {
      p.cool = 0.25; G.ents.push({ k: 'stone', x: p.x + (p.face > 0 ? p.w : -0.35), y: p.y + 0.25, w: 0.35, h: 0.35, vx: p.face * 11 + p.vx * 0.3, vy: 2, t: 0, act: true }); sfx('throw');
    }
    keys.throwPressed = false;
    var wasX = p.x;
    moveBody(p, dt);
    if (p.x < G.camX - 0.2 && false) p.x = G.camX;
    if (p.x < 0) p.x = 0; if (p.x > L.g.length - 1) p.x = L.g.length - 1;
    // platforms
    var prevB = p.y + p.h - p.vy * dt; p.plat = null;
    G.ents.forEach(function (e) {
      if (e.k !== 'plat' || p.vy < 0) return;
      if (p.x + p.w > e.x && p.x < e.x + e.w && prevB <= e.y + 0.08 && p.y + p.h >= e.y) { p.y = e.y - p.h; p.vy = 0; p.on = true; p.plat = e; }
    });
    if (p.head) bump(p.head[0], p.head[1]);
    if (p.on) p.walk += Math.abs(p.x - wasX);
    // tiles touched: coins and lava
    var x0 = Math.floor(p.x), x1 = Math.floor(p.x + p.w), y0 = Math.floor(p.y), y1 = Math.floor(p.y + p.h - 0.05);
    for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) {
      var ch = tile(x, y);
      if (ch === 'o') { L.g[x][y] = '.'; coin(x + 0.5, y + 0.5, false); }
      if (ch === 'L' && p.y + p.h > y + 0.35) return die();
    }
    if (p.y > ROWS + 1) return die();
    if (p.inv > 0) p.inv -= dt; if (p.star > 0) p.star -= dt;
    // gates
    G.gates.forEach(function (g) {
      if (st.words && !g.e && g.x - p.x < viewCols) gateQuiz(g);
      if (g.done || p.x + p.w / 2 < g.x + 0.5) return;
      if (!st.words) { g.done = true; return; }
      var upper = p.y + p.h <= 7.1; g.done = true; g.pick = upper ? 'up' : 'low'; G.gatesN++;
      var right = (upper && g.upRight) || (!upper && !g.upRight);
      g.right = right;
      var oy0 = upper ? 10 : 5; G.L.g[g.x][oy0] = 'W'; G.L.g[g.x][oy0 + 1] = 'W';
      var row = upper ? 5 : 10, eRow = upper ? 6 : 11, w = word(g.e);
      if (right) {
        G.gatesOK++; for (var j = 2; j <= 12; j++) if (G.L.g[g.x + j][row] === '.') G.L.g[g.x + j][row] = 'o';
        coin(p.x, p.y, true, 5); say(w, 'Right!'); sfx('right');
      } else {
        [[5, 'scorp'], [9, 'wolf'], [12, 'scorp']].forEach(function (a) { var o = spawn({ k: a[1], x: g.x + a[0] + 0.5, y: eRow + 1 }); o.act = true; });
        say(w, 'Not that door. The guards come out!'); sfx('wrong');
      }
    });
  }
  function winStep(dt) {
    if (p.win === 1) { p.vx = 0; p.vy = 4; p.x = G.pole.x - p.w + 0.05; moveBody(p, dt); if (p.on) { p.win = 2; p.wt = 0; } }
    else if (p.win === 2) { p.wt += dt; p.vx = 3; p.face = 1; p.vy += 55 * dt; var ox = p.x; moveBody(p, dt); p.walk += Math.abs(p.x - ox); if (p.wt > 2.2 && !G.over) { G.over = true; levelClear(); } }
  }
  function die() { if (god) { (G.rescues = G.rescues || []).push(Math.round(p.x)); p.x += 1.5; p.y = 2; p.vy = 0; return; } if (p.dead || p.win) return; p.dead = 1.4; p.vy = -12; p.power = 0; sfx('die'); }
  function hurt() {
    if (p.inv > 0 || p.star > 0 || p.dead || p.win || god) return;
    if (p.power > 0) { p.power--; p.inv = 1.6; sfx('hurt'); hud(); } else die();
  }
  function bump(x, y) {
    var ch = tile(x, y), L = G.L;
    G.ents.forEach(function (e) { if (DEF[e.k] && e.act && !e.fly && e.k !== 'snake' && e.k !== 'boss' && e.x + e.w > x && e.x < x + 1 && Math.abs(e.y + e.h - y) < 0.15) kill(e, true); });
    if (ch === 'B') {
      if (p.power > 0) { L.g[x][y] = '.'; burst(x + 0.5, y + 0.5, pal().brick, 8); sfx('break'); }
      else { G.fx.push({ bump: 1, x: x, y: y, life: 0.15, vx: 0, vy: 0, g: 0 }); sfx('bump'); }
    } else if (ch === '?' || ch === '!' || ch === '*') {
      L.g[x][y] = 'U'; G.fx.push({ bump: 1, x: x, y: y, life: 0.15, vx: 0, vy: 0, g: 0 });
      if (ch === '?') { coin(x + 0.5, y - 0.3, true); jarWord(x + 0.5, y); }
      else { var type = ch === '*' ? 'sandals' : p.power === 0 ? 'shield' : 'stones'; G.ents.push({ k: 'item', type: type, x: x + 0.1, y: y, w: 0.8, h: 0.8, vx: 0, vy: 0, em: 0.5, act: true }); sfx('item'); }
    } else sfx('bump');
  }
  function jarWord(x, y) {
    if (!st.words) return;
    var lw = SET[G.set].levels[G.li].words, fresh = lw.filter(function (e) { return G.seenL.indexOf(e) < 0; });
    var e = fresh.length ? fresh[0] : pick(lw); if (fresh.length) G.seenL.push(e);
    var w = word(e); G.floats.push({ x: x, y: y - 1, t: w.f, life: 2.2 }); say(w); note(e);
  }
  function note(e) { st.seen[G.set + ':' + e] = 1; save(); try { var nw = word(e); if (W.TRBWords) W.TRBWords.log('hero', G.set === 'ro' ? 'l' : 'g', nw.f, nw.e); } catch (er) { } if (G.seenL.indexOf(e) < 0) G.seenL.push(e); hud(); }
  function coin(x, y, pop, n) {
    G.coins += n || 1; if (st.words && !G.coinSaid && !pop) { G.coinSaid = true; say(word('coin')); note('coin'); if (G.seenL.indexOf('coin') < 0) G.seenL.push('coin'); } if (pop) G.fx.push({ coin: 1, x: x, y: y, vx: 0, vy: -9, life: 0.45 }); sfx('coin'); hud();
  }
  function kill(e, flip) {
    if (!e.alive) return; e.alive = false;
    G.fx.push({ corpse: e.k, x: e.x, y: e.y, w: e.w, h: e.h, vx: flip ? 0 : 0, vy: flip ? -8 : 0, life: flip ? 1.2 : 0.4, squash: !flip, g: flip ? 30 : 0 });
    var en = e.k === 'eagle' || e.k === 'locust' ? e.k : ENW[e.k];
    if (st.words && en && G.t - (G.wordQ || -9) > 2.5) { G.wordQ = G.t; var w = word(en); say(w); G.floats.push({ x: e.x + e.w / 2, y: e.y - 0.3, t: w.f, life: 1.6 }); note(en); if (G.seenL.indexOf(en) < 0) G.seenL.push(en); }
    sfx('stomp');
  }
  function burst(x, y, col, n) { for (var i = 0; i < n; i++) G.fx.push({ x: x, y: y, vx: rnd(-4, 4), vy: rnd(-10, -3), life: 0.8, col: col, size: rnd(0.12, 0.25) }); }

  function entStep(e, dt) {
    if (!e.act) { if (e.x < G.camX + viewCols + 2) e.act = true; else return; }
    e.t += dt;
    var d = DEF[e.k];
    if (e.k === 'stone') {
      e.vy += 40 * dt; var hx = moveBody(e, dt); if (e.on) e.vy = -9; e.t += 0;
      if (hx || e.t > 2.5 || e.x < G.camX - 1 || e.x > G.camX + viewCols + 1 || e.y > ROWS) { e.alive = false; burst(e.x, e.y, '#bbb', 3); return; }
      G.ents.forEach(function (o) {
        if (!e.alive || !o.alive || !DEF[o.k] || !o.act || o.k === 'podo') return;
        var box = o.k === 'snake' ? { x: o.x, y: o.base - o.o, w: o.w, h: o.o } : o;
        if (box.h > 0.1 && overlap(e, box)) { e.alive = false; if (o.k === 'boss') { o.hp--; o.hit = 0.3; sfx('bump'); if (o.hp <= 0) bossDown(o); } else kill(o, true); }
      });
      return;
    }
    if (e.k === 'item') {
      if (e.em > 0) { e.em -= dt; e.y -= dt / 0.5 * 0.85; if (e.em <= 0) e.vx = e.type === 'stones' ? 0 : e.type === 'sandals' ? 3 : 2.5; }
      else { e.vy = Math.min(18, e.vy + 40 * dt); if (moveBody(e, dt)) e.vx = -e.vx; if (e.on && e.type === 'sandals') e.vy = -10; if (e.y > ROWS) e.alive = false; }
      if (overlap(p, e) && !p.dead) {
        e.alive = false; var eng;
        if (e.type === 'shield') { p.power = Math.max(p.power, 1); eng = 'shield'; }
        else if (e.type === 'stones') { p.power = 2; eng = 'stone'; }
        else { p.star = 9; eng = 'sandal'; }
        sfx('power'); hud();
        if (st.words) { var w = word(eng); say(w, e.type === 'shield' ? 'One extra hit, and you can break bricks.' : e.type === 'stones' ? 'Throw stones with X, Shift or the ✊ button.' : 'Winged sandals: nothing can hurt you for a while.'); note(eng); }
        else say(null, e.type === 'shield' ? 'Shield: one extra hit, and you can break bricks.' : e.type === 'stones' ? 'Stones: throw with X, Shift or the ✊ button.' : 'Winged sandals: nothing can hurt you for a while.');
      }
      return;
    }
    if (e.k === 'plat') return;
    if (e.k === 'check') { if (!e.on && Math.abs(p.x + p.w / 2 - (e.x + 0.5)) < 0.6 && !p.dead) { e.on = true; G.chk = { x: e.x }; G.chkCoins = G.coins; G.chkPower = p.power; sfx('item'); say(null, 'Halfway: if you fall, you start again from here.'); } return; }
    if (e.k === 'pole') {
      if (!p.win && !p.dead && p.x + p.w > e.x - 0.1 && p.x < e.x + 0.1) { G.pole = e; p.win = 1; p.vx = 0; sfx('win'); }
      return;
    }
    if (e.k === 'lever') {
      if (G.collapse < 0 && !G.leverOn && p.x + p.w > e.x - 0.4 && !p.dead) { G.leverOn = true; G.collapse = 13; sfx('break'); var bs = G.ents.filter(function (o) { return o.k === 'boss'; })[0]; if (!bs) G.bossDead = 1; }
      return;
    }
    if (e.k === 'bar') {
      e.a += 1.7 * dt;
      for (var r = 0; r <= 3; r += 0.6) { var bx = e.x + Math.cos(e.a) * r, by = e.y + Math.sin(e.a) * r; if (Math.hypot(bx - (p.x + p.w / 2), by - (p.y + p.h / 2)) < 0.55) hurt(); }
      return;
    }
    if (e.k === 'podo') {
      if (e.wait == null) e.wait = e.t;
      if (e.y >= 14.5 && e.vy >= 0) { e.vy = 0; e.y = 14.5; if (e.t > 2.2) { e.t = 0; e.vy = -17; } }
      else { e.vy += 30 * dt; e.y += e.vy * dt; }
      if (overlap(p, e)) hurt(); return;
    }
    if (e.k === 'rock') { e.t += dt; e.vy += 22 * dt; e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > ROWS || e.t > 4) e.alive = false; if (overlap(p, e)) hurt(); return; }
    if (e.k === 'fire') { e.x += e.vx * dt; e.y += Math.sin(e.t * 6) * dt * 0.8; if (e.x < G.camX - 2 || e.t > 5) e.alive = false; if (overlap(p, e)) hurt(); return; }
    if (e.k === 'snake') {
      var near = Math.abs(p.x + p.w / 2 - (e.x + e.w / 2)) < 1.6;
      var cyc = e.t % 5;
      var want = cyc < 2 ? 0 : cyc < 2.5 ? (cyc - 2) * 2 : cyc < 4.3 ? 1 : 1 - (cyc - 4.3) / 0.7;
      if (near && e.o <= 0.01) want = 0;
      e.o = Math.max(0, Math.min(1.3, want * 1.3));
      if (e.o > 0.1 && overlap(p, { x: e.x, y: e.base - e.o, w: e.w, h: e.o })) { if (p.star > 0) kill(e, true); else hurt(); }
      return;
    }
    if (e.k === 'boss') return bossStep(e, dt);
    // walkers, hoppers, flyers
    if (e.fly) { e.x += e.vx * dt; e.y = e.base + Math.sin(e.t * 2.2) * 1.4; if (e.x < G.camX - 4) e.alive = false; }
    else {
      if (e.k === 'frog') {
        if (e.on) { e.vx = 0; if (e.t > 1.1) { e.t = 0; e.vy = -11; e.vx = (p.x < e.x ? -1 : 1) * 2.6; } }
      }
      e.vy = Math.min(18, e.vy + 40 * dt);
      var sv = e.vx; if (moveBody(e, dt)) e.vx = -sv;
      if (e.k === 'frog' && !e.on) e.vx = sv;
      if (e.y > ROWS) { e.alive = false; return; }
    }
    if (p.dead || p.win) return;
    if (overlap(p, e)) {
      if (p.star > 0) return kill(e, true);
      var fromAbove = p.vy > 0 && (p.y + p.h) - e.y < 0.45;
      if (fromAbove && e.stomp) { kill(e, false); p.vy = keys.jump ? -15 : -10; p.y = e.y - p.h; }
      else hurt();
    }
  }
  function bossStep(e, dt) {
    var L = G.L, minX = L.bridge + 2, maxX = L.bridge + 12;
    if (e.hit) e.hit = Math.max(0, e.hit - dt);
    if (!e.awake) { if (p.x > L.bridge - 6) { e.awake = true; e.cd = 1; } else return; }
    e.face = p.x < e.x ? -1 : 1;
    e.vy = Math.min(18, e.vy + 35 * dt);
    if (e.charge > 0) { e.charge -= dt; e.vx = e.face * 7; if (e.charge <= 0) e.vx = 0; }
    else e.vx = (e.home - e.x) * 1.5 + Math.sin(G.t * 1.3) * 1.5;
    if (e.x < minX && e.vx < 0) e.vx = 0; if (e.x > maxX && e.vx > 0) e.vx = 0;
    moveBody(e, dt);
    e.cd -= dt; // its own attack timer (entStep already advances e.t)
    if (e.cd <= 0 && e.on && !G.leverOn) {
      e.cd = rnd(1.4, 2.4); var r = Math.random();
      if (r < 0.35) e.vy = -13;
      else if (G.set === 'od') { G.ents.push({ k: 'rock', x: e.x + (e.face < 0 ? -0.6 : e.w), y: e.y + 0.2, w: 0.6, h: 0.6, vx: e.face * rnd(4, 7.5), vy: -rnd(6, 10), t: 0, act: true }); sfx('throw'); }
      else if (G.set === 'ro') { G.ents.push({ k: 'fire', x: e.x + (e.face < 0 ? -0.6 : e.w), y: e.y + rnd(0.1, 1.3), w: 0.7, h: 0.4, vx: e.face * 6.5, t: 0, act: true }); sfx('fire'); }
      else { e.charge = 0.7; sfx('fire'); }
    }
    if (e.y > ROWS) { e.alive = false; G.bossDead = 1.2; return; }
    if (!p.dead && !p.win && overlap(p, e)) hurt();
  }
  function bossDown(e) { if (G.collapse < 0) { G.leverOn = true; G.collapse = 13; } burst(e.x + 0.9, e.y + 1, '#e2582b', 16); }

  // ---------- drawing ----------
  var PAL = {
    gr: {
      field: { sky: ['#6dbbe6', '#e6f4fb'], far: '#9fb9cf', sea: '#2f7fb5', mid: '#6f8f4a', top: '#8fae4f', soil: '#d8b27a', soilD: '#bf955c', brick: '#f1ebdc', mortar: '#c2b79c', block: '#e9e2d0', blockD: '#b9ae95' },
      cliff: { sky: ['#5fb0e0', '#dff1fb'], far: '#b8c9d6', sea: '#1f6fa8', mid: '#8a9a7a', top: '#a8b46a', soil: '#cfc2a4', soilD: '#a99b7b', brick: '#f1ebdc', mortar: '#c2b79c', block: '#e9e2d0', blockD: '#b9ae95' },
      cave: { sky: ['#141c28', '#26324a'], far: '#2b3850', top: '#7d8aa0', soil: '#56647c', soilD: '#3e4a60', brick: '#8f9bb0', mortar: '#4a556b', block: '#7a879c', blockD: '#4f5a70' },
      castle: { sky: ['#160d10', '#3a1d1a'], far: '#3a2626', top: '#8b8378', soil: '#635b52', soilD: '#463f38', brick: '#9a9184', mortar: '#4e463e', block: '#867d70', blockD: '#5a5248' }
    },
    ro: {
      field: { sky: ['#f0b96a', '#fbefd6'], far: '#c98a5c', sea: '#5f8a5a', mid: '#2e5f3a', top: '#00562f', soil: '#a4532f', soilD: '#7f3d22', brick: '#a54a2a', mortar: '#6e2e18', block: '#d6b98a', blockD: '#9c7f52' },
      cliff: { sky: ['#e8a95f', '#f8e8cc'], far: '#b97a4f', sea: '#4d7a4a', mid: '#004225', top: '#00562f', soil: '#9a5a35', soilD: '#6f3d22', brick: '#a54a2a', mortar: '#6e2e18', block: '#d6b98a', blockD: '#9c7f52' },
      cave: { sky: ['#1d140f', '#3a2a1e'], far: '#3c2b1f', top: '#9a7a58', soil: '#6e5139', soilD: '#4d3826', brick: '#8f5a3a', mortar: '#4a2f1d', block: '#8a6c4c', blockD: '#5c4530' },
      castle: { sky: ['#1a0c08', '#4a1a10'], far: '#4a2418', top: '#8a6a58', soil: '#5e4436', soilD: '#40291e', brick: '#93503a', mortar: '#4a2418', block: '#8a6c58', blockD: '#5a4232' }
    },
    od: {
      field: { sky: ['#4aa6d8', '#f6ecd2'], far: '#7fa58a', sea: '#1c5f99', mid: '#5f8a3a', top: '#8fb04a', soil: '#d9b98a', soilD: '#b8956a', brick: '#f1ebdc', mortar: '#c2b79c', block: '#e9e2d0', blockD: '#b9ae95' },
      sea: { sky: ['#3d8fc8', '#d9eef7'], far: '#6f8f7f', sea: '#164f86', mid: '#4f6f3a', top: '#9aa86a', soil: '#b9ab8c', soilD: '#8f826a', brick: '#e9e2d0', mortar: '#a99b7b', block: '#c9c0aa', blockD: '#8f866f' },
      cave: { sky: ['#17150f', '#2e2a1e'], far: '#2e2a20', top: '#8a8068', soil: '#5c5442', soilD: '#3e382c', brick: '#857a62', mortar: '#3e382c', block: '#7a705a', blockD: '#4e4738' },
      castle: { sky: ['#140f0a', '#3a2614'], far: '#3a2a1a', top: '#8f8068', soil: '#615644', soilD: '#433b2e', brick: '#8f8068', mortar: '#433b2e', block: '#7f735e', blockD: '#554c3c' }
    }
  };
  function pal() { return PAL[G.set][G.L.kind]; }
  function sx(x) { return Math.round((x - G.camX) * S); }
  function sy(y) { return Math.round(oy + y * S); }

  function draw() {
    var P = pal(), k = G.L.kind;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var gr = c.createLinearGradient(0, 0, 0, Ht); gr.addColorStop(0, P.sky[0]); gr.addColorStop(1, P.sky[1]);
    c.fillStyle = gr; c.fillRect(0, 0, Wd, Ht);
    drawBG(P, k);
    if (G.set === 'od' && (k === 'field' || k === 'sea')) { var wy = sy(13.1) + Math.sin(G.t * 2) * S * 0.06; c.fillStyle = P.sea; c.fillRect(0, wy, Wd, Ht - wy); c.fillStyle = 'rgba(255,255,255,.35)'; for (var wi = -1; wi < viewCols + 1; wi++) c.fillRect((wi - (G.camX % 1)) * S + ((G.t * 0.8) % 1) * S * 0.5, wy, S * 0.4, 2); }
    // below the map (tall screens)
    if (oy + ROWS * S < Ht) { c.fillStyle = P.soilD; c.fillRect(0, oy + ROWS * S, Wd, Ht - oy - ROWS * S); }
    var x0 = Math.max(0, Math.floor(G.camX)), x1 = Math.min(G.L.g.length - 1, Math.ceil(G.camX + viewCols));
    for (var x = x0; x <= x1; x++) for (var y = 0; y < ROWS; y++) { var ch = G.L.g[x][y]; if (ch !== '.') drawTile(ch, x, y, P); }
    G.fx.forEach(function (f) { if (f.bump) drawTile(G.L.g[f.x][f.y], f.x, f.y, P, -0.25 * Math.sin(f.life / 0.15 * Math.PI)); });
    drawGoal(P);
    G.gates.forEach(drawGate);
    G.ents.forEach(function (e) { drawEnt(e, P); });
    if (!p.dead || p.dead < 1.35) drawHero();
    G.fx.forEach(function (f) {
      if (f.bump) return;
      if (f.coin) { drawCoin(f.x, f.y, 0.9); return; }
      if (f.corpse) { c.save(); var cx = sx(f.x + f.w / 2), cy = sy(f.y + f.h); c.translate(cx, cy); if (f.squash) c.scale(1, 0.35); else c.scale(1, -1); c.translate(-cx, -cy); drawEnemy({ k: f.corpse, x: f.x, y: f.squash ? f.y : f.y - f.h, w: f.w, h: f.h, t: 0, vx: -1 }); c.restore(); return; }
      c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.fillRect(sx(f.x), sy(f.y), f.size * S, f.size * S); c.globalAlpha = 1;
    });
    G.floats.forEach(function (f) {
      c.globalAlpha = Math.min(1, f.life); c.font = Math.round(S * 0.62) + 'px "Gentium Book Plus",Georgia,serif'; c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(f.t, sx(f.x), sy(f.y)); c.fillStyle = '#fff4c8'; c.fillText(f.t, sx(f.x), sy(f.y)); c.globalAlpha = 1;
    });
  }
  function hills(par, base, amp, col, freq, seed) {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, Ht);
    for (var px = 0; px <= Wd + 8; px += 8) { var wx = px / S + G.camX * par; c.lineTo(px, sy(base) - (Math.sin(wx * freq + seed) * 0.6 + Math.sin(wx * freq * 2.3 + seed * 2) * 0.4 + 1) * amp * S); }
    c.lineTo(Wd, Ht); c.closePath(); c.fill();
  }
  function drawBG(P, k) {
    var t = G.t, i, off, x;
    if (k === 'field' || k === 'cliff' || k === 'sea') {
      // clouds
      c.fillStyle = 'rgba(255,255,255,.75)';
      for (i = 0; i < 6; i++) { x = ((i * 9.3 - G.camX * 0.15 + t * 0.15) % 60 + 60) % 60 * S - 3 * S; var y = sy(1.5 + (i % 3) * 1.2); c.beginPath(); c.ellipse(x, y, S * 1.4, S * 0.45, 0, 0, 7); c.ellipse(x + S * 0.9, y - S * 0.25, S * 0.9, S * 0.45, 0, 0, 7); c.fill(); }
      if (G.set === 'od') {
        // the open sea with distant islands
        c.fillStyle = P.sea; c.fillRect(0, sy(8.6), Wd, Ht);
        for (i = -1; i < 6; i++) { x = ((i * 23 - G.camX * 0.1) % 120 + 120) % 120 * S - 10 * S; c.fillStyle = P.far; c.beginPath(); c.ellipse(x, sy(8.65), S * (3 + (i & 1) * 2), S * (1 + (i % 3) * 0.4), 0, Math.PI, 0); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,.3)'; for (i = 0; i < 10; i++) c.fillRect(((i * 6.7 - G.camX * 0.3 + t * 0.4) % 60 + 60) % 60 * S - 5 * S, sy(9.2 + (i % 5) * 0.9), S * 1.1, 2);
        if (k === 'field') { hills(0.35, 11, 0.7, P.mid, 0.4, 5); for (i = -2; i < viewCols / 5 + 2; i++) { x = (Math.floor(G.camX * 0.5 / 5) + i) * 5; lotus((x - G.camX * 0.5) * S + S, sy(11)); } }
      } else if (G.set === 'gr') {
        hills(0.12, k === 'cliff' ? 8.4 : 9.1, k === 'cliff' ? 0.9 : 1.6, P.far, 0.25, 1);
        c.fillStyle = P.sea; c.fillRect(0, sy(k === 'cliff' ? 8.4 : 9.2), Wd, Ht);
        // a distant temple on a hill
        off = sx(30 - G.camX * 0.88 + G.camX); x = ((30 - G.camX * 0.12) % 70 + 70) % 70 * S;
        drawTemple(x, sy(k === 'cliff' ? 7.6 : 8.4), S * 0.9, 'rgba(255,255,255,.75)');
        if (k === 'field') { hills(0.35, 11, 0.9, P.mid, 0.4, 3); for (i = -2; i < viewCols / 4 + 2; i++) { x = (Math.floor(G.camX * 0.5 / 4) + i) * 4; olive((x - G.camX * 0.5) * S + S, sy(10.9)); } }
        else { c.fillStyle = 'rgba(255,255,255,.25)'; for (i = 0; i < 8; i++) c.fillRect(((i * 7.7 - G.camX * 0.3) % 50 + 50) % 50 * S, sy(10 + (i % 4) * 1.1), S * 1.2, 2); }
      } else {
        hills(0.12, 9, 1.4, P.far, 0.3, 2);
        // aqueduct arches
        c.fillStyle = 'rgba(160,90,55,.55)'; var ay = sy(7.6), ah = S * 1.6;
        c.fillRect(0, ay - S * 0.25, Wd, S * 0.3);
        for (i = -1; i < viewCols / 1.5 + 2; i++) { x = (i - (G.camX * 0.2 % 1.5) / 1.5) * 1.5 * S; c.fillRect(x, ay, S * 0.35, ah + S); }
        c.fillRect(0, ay + ah + S * 0.9, Wd, Ht);
        hills(0.35, 11, k === 'cliff' ? 2.4 : 1, P.mid, 0.35, 4);
        for (i = -2; i < viewCols / 3 + 2; i++) { x = (Math.floor(G.camX * 0.5 / 3) + i) * 3; if ((x / 3) % 2) cypress((x - G.camX * 0.5) * S + S, sy(11.2)); else pine((x - G.camX * 0.5) * S + S, sy(11.2)); }
      }
    } else {
      // underground: faint blocks, a meander band (Greece) or burial niches (Rome)
      c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; off = (G.camX * 0.5 % 2) * S;
      for (var yy = 2; yy < ROWS; yy++) for (i = -1; i < viewCols / 2 + 2; i++) c.strokeRect(i * 2 * S - off + (yy % 2) * S, sy(yy), 2 * S, S);
      if (k === 'cave' && G.set === 'gr') meander(sy(2.6), 0.5);
      if (k === 'cave' && G.set === 'ro') { c.fillStyle = 'rgba(0,0,0,.35)'; for (i = -1; i < viewCols / 3 + 2; i++) for (var r = 0; r < 3; r++) c.fillRect(i * 3 * S - (G.camX * 0.5 % 3) * S + S * 0.5, sy(3.2 + r * 2.2), S * 1.8, S * 0.8); }
      if (k === 'castle') {
        for (i = -1; i < viewCols / 4 + 2; i++) { x = i * 4 * S - (G.camX * 0.5 % 4) * S; c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + S, sy(2), S * 0.8, S * 10); var fl = 0.6 + 0.4 * Math.sin(t * 9 + i), bx = x + S * 3, by = sy(6); var rg = c.createRadialGradient(bx, by - S * 0.3, 0, bx, by - S * 0.3, S * 1.3); rg.addColorStop(0, 'rgba(255,150,50,' + (0.35 * fl) + ')'); rg.addColorStop(1, 'rgba(255,150,50,0)'); c.fillStyle = rg; c.fillRect(bx - S * 1.4, by - S * 1.7, S * 2.8, S * 2.8); c.fillStyle = 'rgba(30,20,15,.8)'; c.fillRect(bx - S * 0.3, by, S * 0.6, S * 0.2); c.fillRect(bx - S * 0.06, by, S * 0.12, S * 1.2); c.fillStyle = 'rgba(255,170,60,' + (0.7 * fl) + ')'; c.beginPath(); c.moveTo(bx - S * 0.25, by); c.quadraticCurveTo(bx, by - S * (0.7 + 0.15 * fl), bx + S * 0.25, by); c.fill(); }
        if (G.set === 'gr') meander(sy(2.4), 0.35);
      }
    }
  }
  function meander(y, a) { c.strokeStyle = 'rgba(214,170,90,' + a + ')'; c.lineWidth = Math.max(1.5, S * 0.08); var u = S * 0.35, off = (G.camX * 0.5 * S) % (u * 4); c.beginPath(); for (var x = -u * 4 - off; x < Wd + u * 4; x += u * 4) { c.moveTo(x, y + u * 2); c.lineTo(x, y); c.lineTo(x + u * 3, y); c.lineTo(x + u * 3, y + u * 2); c.lineTo(x + u, y + u * 2); c.lineTo(x + u, y + u); c.lineTo(x + u * 2, y + u); c.lineTo(x + u * 2, y + u * 2); c.lineTo(x + u * 4, y + u * 2); } c.stroke(); }
  function olive(x, y) { c.fillStyle = '#6b5a3e'; c.fillRect(x - S * 0.08, y - S * 0.9, S * 0.16, S * 0.9); c.fillStyle = '#7f9a62'; c.beginPath(); c.ellipse(x, y - S * 1.1, S * 0.75, S * 0.45, 0, 0, 7); c.ellipse(x - S * 0.4, y - S * 0.9, S * 0.4, S * 0.3, 0, 0, 7); c.fill(); }
  function lotus(x, y) { c.fillStyle = '#4f6f2a'; c.fillRect(x - S * 0.05, y - S * 0.8, S * 0.1, S * 0.8); c.fillStyle = '#e7a7b8'; for (var i = -1; i <= 1; i++) { c.beginPath(); c.ellipse(x + i * S * 0.16, y - S * 0.95, S * 0.12, S * 0.26, i * 0.5, 0, 7); c.fill(); } }
  function ship(X, Y, s) { c.fillStyle = '#2a1e16'; c.beginPath(); c.moveTo(X - s * 2.2, Y - s * 0.9); c.quadraticCurveTo(X, Y + s * 0.1, X + s * 2.2, Y - s * 0.9); c.lineTo(X + s * 2.5, Y - s * 1.4); c.lineTo(X + s * 1.6, Y - s * 0.75); c.lineTo(X - s * 1.6, Y - s * 0.75); c.lineTo(X - s * 2.6, Y - s * 1.2); c.closePath(); c.fill(); c.fillStyle = '#5a4030'; c.fillRect(X - s * 0.06, Y - s * 3.6, s * 0.12, s * 2.9); c.fillStyle = '#f2ead6'; c.fillRect(X - s * 1.1, Y - s * 3.4, s * 2.2, s * 1.6); c.fillStyle = '#c94c3a'; c.beginPath(); c.arc(X - s * 1.9, Y - s * 0.95, s * 0.12, 0, 7); c.fill(); }
  function ram(X, Y) { c.fillStyle = '#ece6d6'; c.beginPath(); c.ellipse(X, Y - S * 0.6, S * 0.6, S * 0.35, 0, 0, 7); c.fill(); c.fillStyle = '#3a3028'; c.fillRect(X + S * 0.45, Y - S * 0.95, S * 0.3, S * 0.3); c.fillRect(X - S * 0.4, Y - S * 0.3, S * 0.09, S * 0.3); c.fillRect(X + S * 0.3, Y - S * 0.3, S * 0.09, S * 0.3); c.strokeStyle = '#8a7a5a'; c.lineWidth = S * 0.08; c.beginPath(); c.arc(X + S * 0.55, Y - S * 0.9, S * 0.13, 0, 5); c.stroke(); }
  function cypress(x, y) { c.fillStyle = '#1f4a2c'; c.beginPath(); c.ellipse(x, y - S * 1.3, S * 0.28, S * 1.3, 0, 0, 7); c.fill(); }
  function pine(x, y) { c.fillStyle = '#5a4030'; c.fillRect(x - S * 0.06, y - S * 1.6, S * 0.12, S * 1.6); c.fillStyle = '#2a5a36'; c.beginPath(); c.ellipse(x, y - S * 1.7, S * 0.9, S * 0.35, 0, 0, 7); c.fill(); }
  function drawTemple(x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x - s * 1.5, y - s * 1.4); c.lineTo(x, y - s * 2); c.lineTo(x + s * 1.5, y - s * 1.4); c.fill();
    c.fillRect(x - s * 1.5, y - s * 1.4, s * 3, s * 0.2); for (var i = 0; i < 6; i++) c.fillRect(x - s * 1.35 + i * s * 0.52, y - s * 1.2, s * 0.22, s * 1.05); c.fillRect(x - s * 1.6, y - s * 0.15, s * 3.2, s * 0.2);
  }
  function drawTile(ch, x, y, P, dy) {
    var X = sx(x), Y = sy(y + (dy || 0)), s = S, t = G.t;
    if (ch === '#') {
      var above = tile(x, y - 1), cave = G.L.kind === 'cave' || G.L.kind === 'castle';
      c.fillStyle = P.soil; c.fillRect(X, Y, s + 1, s + 1);
      if (cave) { c.strokeStyle = P.soilD; c.lineWidth = 1; c.strokeRect(X + 0.5, Y + 0.5, s - 1, s - 1); c.fillStyle = P.top; c.fillRect(X + 1, Y + 1, s - 2, s * 0.12); return; }
      c.fillStyle = P.soilD; c.fillRect(X + s * ((x * 7 + y * 3) % 5) / 6, Y + s * ((x * 3 + y * 5) % 4) / 5 + s * 0.3, s * 0.18, s * 0.12);
      if (above === '.' || above === 'o' || above === '-') { c.fillStyle = P.top; c.fillRect(X, Y, s + 1, s * 0.28); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(X, Y, s + 1, s * 0.07); }
    } else if (ch === 'B') {
      c.fillStyle = P.brick; c.fillRect(X, Y, s, s); c.strokeStyle = P.mortar; c.lineWidth = Math.max(1, s * 0.05);
      c.beginPath(); c.moveTo(X, Y + s / 2); c.lineTo(X + s, Y + s / 2); c.moveTo(X + s / 2, Y); c.lineTo(X + s / 2, Y + s / 2); c.moveTo(X + s / 4, Y + s / 2); c.lineTo(X + s / 4, Y + s); c.moveTo(X + s * 0.75, Y + s / 2); c.lineTo(X + s * 0.75, Y + s); c.stroke(); c.strokeRect(X, Y, s, s);
    } else if (ch === '?' || ch === '!' || ch === '*') {
      c.fillStyle = '#e0a63c'; c.fillRect(X, Y, s, s); c.strokeStyle = '#7a4a12'; c.lineWidth = Math.max(1, s * 0.06); c.strokeRect(X + 1, Y + 1, s - 2, s - 2);
      var gl = 0.75 + 0.25 * Math.sin(t * 4 + x); amphora(X + s / 2, Y + s * 0.52, s * 0.36, 'rgba(110,50,15,' + gl + ')');
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(X + 2, Y + 2, s - 4, s * 0.1);
    } else if (ch === 'U') {
      c.fillStyle = '#8f7a5c'; c.fillRect(X, Y, s, s); c.strokeStyle = '#5a4a34'; c.lineWidth = Math.max(1, s * 0.06); c.strokeRect(X + 1, Y + 1, s - 2, s - 2);
    } else if (ch === 'X' || ch === 'W') {
      c.fillStyle = P.block; c.fillRect(X, Y, s, s); c.fillStyle = P.blockD; c.fillRect(X, Y + s * 0.82, s, s * 0.18); c.fillRect(X + s * 0.82, Y, s * 0.18, s);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(X, Y, s, s * 0.08);
      if (ch === 'W') { c.strokeStyle = P.blockD; c.lineWidth = 1; c.strokeRect(X + 0.5, Y + 0.5, s - 1, s - 1); }
    } else if (ch === 'P') {
      var top = tile(x, y - 1) !== 'P', left = tile(x - 1, y) !== 'P';
      c.fillStyle = G.set !== 'ro' ? '#f4f1e8' : '#efe0c2'; c.fillRect(X, Y, s + 1, s + 1);
      c.fillStyle = 'rgba(0,0,0,.12)'; for (var f = 0; f < 3; f++) c.fillRect(X + s * (left ? 0.15 : 0.05) + f * s * 0.3, Y, s * 0.08, s + 1);
      if (left) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(X, Y, s * 0.1, s + 1); } else { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(X + s * 0.88, Y, s * 0.12, s + 1); }
      if (top) { c.fillStyle = G.set !== 'ro' ? '#e3ddcc' : '#dccaa5'; c.fillRect(X - (left ? s * 0.15 : 0), Y, s * 1.15, s * 0.35); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(X - (left ? s * 0.15 : 0), Y + s * 0.3, s * 1.15, s * 0.06); }
    } else if (ch === '-') {
      c.fillStyle = P.block; c.fillRect(X, Y, s + 1, s * 0.32); c.fillStyle = P.blockD; c.fillRect(X, Y + s * 0.26, s + 1, s * 0.08);
    } else if (ch === 'o') { drawCoin(x + 0.5, y + 0.5, 1);
    } else if (ch === 'L') {
      c.fillStyle = '#c8321b'; c.fillRect(X, Y, s + 1, s + 1); c.fillStyle = '#f39a2b';
      if (tile(x, y - 1) !== 'L') { c.beginPath(); c.moveTo(X, Y + s * 0.35); for (var i = 0; i <= 4; i++) c.lineTo(X + i * s / 4, Y + s * (0.25 + 0.12 * Math.sin(t * 5 + x * 2 + i))); c.lineTo(X + s, Y + s); c.lineTo(X, Y + s); c.fill(); c.fillStyle = '#c8321b'; c.fillRect(X, Y + s * 0.6, s + 1, s * 0.4); }
    } else if (ch === 'b') {
      c.fillStyle = '#7a4a22'; c.fillRect(X, Y, s + 1, s * 0.45); c.fillStyle = '#5a3416'; c.fillRect(X + s * 0.45, Y, s * 0.08, s * 0.45); c.fillStyle = '#c9a25a'; c.fillRect(X, Y - s * 0.12, s + 1, s * 0.06);
    }
  }
  function amphora(cx, cy, r, col) {
    c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, r * 0.62, r * 0.85, 0, 0, 7); c.fill();
    c.fillRect(cx - r * 0.2, cy - r * 1.35, r * 0.4, r * 0.6); c.fillRect(cx - r * 0.35, cy - r * 1.45, r * 0.7, r * 0.15);
    c.beginPath(); c.moveTo(cx - r * 0.1, cy + r * 0.8); c.lineTo(cx, cy + r * 1.2); c.lineTo(cx + r * 0.1, cy + r * 0.8); c.fill();
    c.strokeStyle = col; c.lineWidth = Math.max(1, r * 0.14); c.beginPath(); c.arc(cx - r * 0.45, cy - r * 0.85, r * 0.3, Math.PI * 0.5, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(cx + r * 0.45, cy - r * 0.85, r * 0.3, -Math.PI * 0.6, Math.PI * 0.5); c.stroke();
  }
  function drawCoin(x, y, sc) {
    var w = Math.abs(Math.sin(G.t * 3 + x)) * 0.32 * S * sc + S * 0.06, X = sx(x), Y = sy(y);
    c.fillStyle = '#e8b830'; c.beginPath(); c.ellipse(X, Y, w, S * 0.36 * sc, 0, 0, 7); c.fill();
    c.strokeStyle = '#9a6a10'; c.lineWidth = Math.max(1, S * 0.05); c.stroke();
    if (w > S * 0.2) { c.fillStyle = '#9a6a10'; c.font = 'bold ' + Math.round(S * 0.4 * sc) + 'px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (G.set !== 'ro') { c.beginPath(); c.arc(X - S * 0.08, Y - S * 0.05, S * 0.06, 0, 7); c.arc(X + S * 0.08, Y - S * 0.05, S * 0.06, 0, 7); c.fill(); c.fillRect(X - S * 0.03, Y + S * 0.03, S * 0.06, S * 0.12); } else c.fillText('X', X, Y + 1); c.textBaseline = 'alphabetic'; }
  }
  function drawGate(g) {
    if (!st.words || !g.e) return;
    var X = sx(g.x + 0.5), w = word(g.e);
    if (X < -6 * S || X > Wd + 6 * S) return;
    // plaque on the wall
    c.fillStyle = '#f6efdc'; c.strokeStyle = '#7a4a12'; c.lineWidth = 2;
    c.font = Math.round(S * 0.78) + 'px "Gentium Book Plus",Georgia,serif'; var pw = c.measureText(w.f).width;
    c.font = 'bold ' + Math.round(S * 0.42) + 'px system-ui,sans-serif'; if (g.done) pw = Math.max(pw, c.measureText('✓ ' + w.f + ' = ' + w.e).width);
    c.font = 'italic ' + Math.round(S * 0.4) + 'px Georgia,serif'; pw = Math.max(pw, c.measureText((w.p || '') + ' · which door?').width); pw = Math.max(S * 3.6, pw + S * 0.7); var py = sy(1.25);
    c.fillRect(X - pw / 2, py, pw, S * 2.5); c.strokeRect(X - pw / 2, py, pw, S * 2.5);
    c.fillStyle = '#1d2320'; c.textAlign = 'center'; c.font = Math.round(S * 0.78) + 'px "Gentium Book Plus",Georgia,serif'; c.fillText(w.f, X, py + S * 1.05);
    c.font = 'italic ' + Math.round(S * 0.4) + 'px Georgia,serif'; c.fillStyle = '#5d6862';
    c.fillText(w.p ? w.p + ' · which door?' : 'which door?', X, py + S * 1.6);
    if (g.done) { c.fillStyle = g.right ? '#1a8a4a' : '#c0392b'; c.font = 'bold ' + Math.round(S * 0.42) + 'px system-ui,sans-serif'; c.fillText((g.right ? '✓ ' : '✗ ') + w.f + ' = ' + w.e, X, py + S * 2.2); }
    sign(g.x - 0.1, 4.3, g.up, g, 'up'); sign(g.x - 0.1, 8.15, g.low, g, 'low');
  }
  function sign(x, y, txt, g, which) {
    c.font = 'bold ' + Math.round(S * 0.4) + 'px system-ui,sans-serif'; var tw = c.measureText(txt).width + S * 0.4, X = sx(x) - tw, Y = sy(y);
    var col = '#fff8e6'; if (g.done && g.pick === which) col = g.right ? '#bfe8cf' : '#f5c6c0';
    c.fillStyle = col; c.strokeStyle = '#7a4a12'; c.lineWidth = 1.5; c.fillRect(X, Y, tw, S * 0.62); c.strokeRect(X, Y, tw, S * 0.62);
    c.beginPath(); c.moveTo(X + tw, Y); c.lineTo(X + tw + S * 0.25, Y + S * 0.31); c.lineTo(X + tw, Y + S * 0.62); c.fill(); c.stroke();
    c.fillStyle = '#1d2320'; c.textAlign = 'left'; c.fillText(txt, X + S * 0.2, Y + S * 0.45);
  }
  function drawGoal(P) {
    var gx = G.L.goalX; if (!gx) return;
    if (G.L.kind === 'castle') {
      // the far side of the bridge: Ariadne's thread (Greece) or the stolen cattle (Rome)
      var X = sx(gx + 3), Y = sy(GY);
      if (X > -4 * S && X < Wd + 4 * S) {
        if (G.set === 'gr') { c.strokeStyle = '#d33'; c.lineWidth = 2; c.beginPath(); c.moveTo(X - S * 6, Y - S * 0.1); for (var i = 0; i < 12; i++) c.lineTo(X - S * 6 + i * S * 0.9, Y - S * (0.1 + 0.15 * Math.sin(i * 1.7))); c.stroke(); person(X + S * 2, Y, '#f2e3c5', '#b23a48'); }
        else if (G.set === 'od') { for (var j2 = 0; j2 < 3; j2++) ram(X + j2 * S * 1.6, Y); }
        else { for (var j = 0; j < 3; j++) cow(X + j * S * 1.6, Y); }
      }
      return;
    }
    var X2 = sx(gx + 8), Y2 = sy(GY);
    if (G.set === 'od') ship(X2, Y2 + S * 0.9, S);
    else if (G.set === 'gr') drawTemple(X2, Y2, S * 1.6, '#f4f1e8');
    else { // a triumphal arch
      c.fillStyle = '#e6d3ae'; c.fillRect(X2 - S * 2.4, Y2 - S * 4.4, S * 4.8, S * 4.4); c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(X2 - S, Y2); c.lineTo(X2 - S, Y2 - S * 2.2); c.arc(X2, Y2 - S * 2.2, S, Math.PI, 0); c.lineTo(X2 + S, Y2); c.fill();
      c.fillStyle = '#c9b48a'; c.fillRect(X2 - S * 2.6, Y2 - S * 4.6, S * 5.2, S * 0.4); c.fillStyle = '#00562f'; c.fillRect(X2 - S * 1.6, Y2 - S * 4.1, S * 3.2, S * 0.6);
    }
  }
  function person(X, Y, skin, dress) { c.fillStyle = dress; c.beginPath(); c.moveTo(X - S * 0.35, Y); c.lineTo(X + S * 0.35, Y); c.lineTo(X + S * 0.15, Y - S); c.lineTo(X - S * 0.15, Y - S); c.fill(); c.fillStyle = skin; c.beginPath(); c.arc(X, Y - S * 1.2, S * 0.22, 0, 7); c.fill(); c.fillStyle = '#3a2516'; c.fillRect(X - S * 0.22, Y - S * 1.45, S * 0.44, S * 0.12); }
  function cow(X, Y) { c.fillStyle = '#e8e0d0'; c.fillRect(X - S * 0.6, Y - S * 0.9, S * 1.2, S * 0.55); c.fillStyle = '#6b4a2a'; c.fillRect(X - S * 0.2, Y - S * 0.85, S * 0.35, S * 0.3); c.fillStyle = '#e8e0d0'; c.fillRect(X + S * 0.5, Y - S * 1.15, S * 0.4, S * 0.4); c.fillStyle = '#444'; c.fillRect(X - S * 0.5, Y - S * 0.35, S * 0.1, S * 0.35); c.fillRect(X + S * 0.35, Y - S * 0.35, S * 0.1, S * 0.35); }

  function drawEnt(e, P) {
    if (e.k === 'plat' && G.set === 'od') { var BX = sx(e.x), BY = sy(e.y), bw = e.w * S; c.fillStyle = '#5a3a22'; c.fillRect(BX, BY, bw, S * 0.22); c.fillStyle = '#3a2416'; c.beginPath(); c.moveTo(BX - S * 0.2, BY + S * 0.2); c.lineTo(BX + bw + S * 0.2, BY + S * 0.2); c.lineTo(BX + bw - S * 0.3, BY + S * 0.6); c.lineTo(BX + S * 0.3, BY + S * 0.6); c.fill(); c.strokeStyle = '#d8c9a8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(BX + S * 0.5, BY + S * 0.3); c.lineTo(BX + S * 0.1, BY + S * 0.9); c.moveTo(BX + bw - S * 0.5, BY + S * 0.3); c.lineTo(BX + bw - S * 0.1, BY + S * 0.9); c.stroke(); return; }
    if (e.k === 'plat') { var X = sx(e.x), Y = sy(e.y); c.fillStyle = P.block; c.fillRect(X, Y, e.w * S, S * 0.4); c.fillStyle = P.blockD; c.fillRect(X, Y + S * 0.3, e.w * S, S * 0.1); c.strokeStyle = '#6b5a3e'; c.lineWidth = 1; c.beginPath(); c.moveTo(X + S * 0.3, Y); c.lineTo(X + S * 0.3, Y - S * 0.6); c.moveTo(X + e.w * S - S * 0.3, Y); c.lineTo(X + e.w * S - S * 0.3, Y - S * 0.6); c.stroke(); return; }
    if (e.k === 'check') { var cx = sx(e.x + 0.5), cy = sy(e.y); c.fillStyle = '#6b5a3e'; c.fillRect(cx - 2, cy - S * 2.6, 4, S * 2.6); c.fillStyle = e.on ? (G.set !== 'ro' ? '#1f6fa8' : '#a8201a') : '#bbb'; c.beginPath(); c.moveTo(cx + 2, cy - S * 2.6); c.lineTo(cx + S * 1.1, cy - S * 2.25); c.lineTo(cx + 2, cy - S * 1.9); c.fill(); return; }
    if (e.k === 'pole') {
      var px = sx(e.x), top = sy(2.2), bot = sy(e.y);
      c.fillStyle = '#d9c9a0'; c.fillRect(px - S * 0.07, top, S * 0.14, bot - top);
      if (G.set !== 'ro') { c.strokeStyle = '#4f7a32'; c.lineWidth = S * 0.14; c.beginPath(); c.arc(px, top - S * 0.1, S * 0.38, 0, 7); c.stroke(); }
      else { c.fillStyle = '#c9973a'; c.beginPath(); c.moveTo(px - S * 0.5, top); c.lineTo(px, top - S * 0.5); c.lineTo(px + S * 0.5, top); c.lineTo(px, top - S * 0.15); c.fill(); c.fillStyle = '#a8201a'; c.fillRect(px - S * 0.45, top + S * 0.4, S * 0.9, S * 0.8); }
      return;
    }
    if (e.k === 'lever') { var lx = sx(e.x), ly = sy(e.y); c.fillStyle = '#555'; c.fillRect(lx - S * 0.3, ly - S * 0.3, S * 0.6, S * 0.3); c.strokeStyle = '#c9973a'; c.lineWidth = S * 0.12; c.beginPath(); c.moveTo(lx, ly - S * 0.3); var a = G.leverOn ? 0.6 : -0.6; c.lineTo(lx + Math.sin(a) * S, ly - S * 0.3 - Math.cos(a) * S); c.stroke(); c.fillStyle = '#d33'; c.beginPath(); c.arc(lx + Math.sin(a) * S, ly - S * 0.3 - Math.cos(a) * S, S * 0.16, 0, 7); c.fill(); return; }
    if (e.k === 'bar') { for (var r = 0; r <= 3; r += 0.6) fireball(e.x + Math.cos(e.a) * r, e.y + Math.sin(e.a) * r, 0.28); return; }
    if (e.k === 'podo') { if (e.y < 14.4) fireball(e.x + 0.3, e.y + 0.3, 0.36); return; }
    if (e.k === 'rock') { c.fillStyle = '#7d766a'; c.beginPath(); c.arc(sx(e.x + 0.3), sy(e.y + 0.3), S * 0.32, 0, 7); c.fill(); c.fillStyle = '#a59e90'; c.beginPath(); c.arc(sx(e.x + 0.22), sy(e.y + 0.2), S * 0.11, 0, 7); c.fill(); return; }
    if (e.k === 'fire') { fireball(e.x + 0.35, e.y + 0.2, 0.3); fireball(e.x + 0.6, e.y + 0.2, 0.2); return; }
    if (e.k === 'stone') { c.fillStyle = '#9a948a'; c.beginPath(); c.arc(sx(e.x + 0.17), sy(e.y + 0.17), S * 0.18, 0, 7); c.fill(); c.fillStyle = '#c9c3b8'; c.beginPath(); c.arc(sx(e.x + 0.12), sy(e.y + 0.12), S * 0.07, 0, 7); c.fill(); return; }
    if (e.k === 'item') { drawItem(e); return; }
    if (e.k === 'snake') { if (e.o > 0.05) { c.save(); c.beginPath(); c.rect(sx(e.x - 1), 0, S * 3, sy(e.base)); c.clip(); drawEnemy({ k: 'snake', x: e.x, y: e.base - e.o, w: e.w, h: 1.3, t: e.t }); c.restore(); } return; }
    if (DEF[e.k] && e.act) drawEnemy(e);
  }
  function fireball(x, y, r) { var X = sx(x), Y = sy(y); c.fillStyle = '#f39a2b'; c.beginPath(); c.arc(X, Y, S * r, 0, 7); c.fill(); c.fillStyle = '#ffe28a'; c.beginPath(); c.arc(X, Y, S * r * 0.5, 0, 7); c.fill(); }
  function drawItem(e) {
    var X = sx(e.x + 0.4), Y = sy(e.y + 0.4);
    if (e.type === 'shield') { c.fillStyle = '#c9973a'; c.beginPath(); c.arc(X, Y, S * 0.4, 0, 7); c.fill(); c.strokeStyle = '#7a5a20'; c.lineWidth = S * 0.07; c.stroke(); c.fillStyle = G.set !== 'ro' ? '#1f6fa8' : '#a8201a'; c.beginPath(); c.arc(X, Y, S * 0.18, 0, 7); c.fill(); }
    else if (e.type === 'stones') { [[-0.15, 0.1], [0.15, 0.1], [0, -0.12]].forEach(function (o) { c.fillStyle = '#8f8a80'; c.beginPath(); c.arc(X + o[0] * S, Y + o[1] * S, S * 0.17, 0, 7); c.fill(); }); }
    else { c.fillStyle = '#8a5a2b'; c.fillRect(X - S * 0.3, Y, S * 0.6, S * 0.2); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(X - S * 0.1, Y); c.lineTo(X - S * 0.45, Y - S * 0.35 - Math.sin(G.t * 12) * S * 0.1); c.lineTo(X + S * 0.1, Y - S * 0.1); c.fill(); }
  }
  function drawEnemy(e) {
    var X = sx(e.x), Y = sy(e.y), w = e.w * S, h = e.h * S, f = (e.vx || -1) < 0 ? -1 : 1, t = G.t, leg = Math.sin((t + e.x) * 12) * S * 0.08;
    c.save(); c.translate(X + w / 2, Y); c.scale(f < 0 ? 1 : -1, 1); c.translate(-w / 2, 0);
    if (e.k === 'wolf' || e.k === 'fox') {
      var col = e.k === 'wolf' ? '#7d7f86' : '#d0702a', dk = e.k === 'wolf' ? '#55575d' : '#9a4a18';
      c.fillStyle = col; c.beginPath(); c.ellipse(w * 0.55, h * 0.5, w * 0.38, h * 0.26, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(w * 0.2, h * 0.32, w * 0.2, h * 0.2, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(w * 0.02, h * 0.38); c.lineTo(-w * 0.12, h * 0.42); c.lineTo(w * 0.08, h * 0.48); c.fill();
      c.fillStyle = dk; c.beginPath(); c.moveTo(w * 0.15, h * 0.18); c.lineTo(w * 0.2, -h * 0.05); c.lineTo(w * 0.28, h * 0.18); c.fill();
      c.fillRect(w * 0.3 + leg, h * 0.65, w * 0.08, h * 0.35); c.fillRect(w * 0.72 - leg, h * 0.65, w * 0.08, h * 0.35);
      c.strokeStyle = col; c.lineWidth = S * 0.12; c.beginPath(); c.moveTo(w * 0.9, h * 0.45); c.quadraticCurveTo(w * 1.1, h * 0.2, w * 1.05, h * 0.05); c.stroke();
      if (e.k === 'fox') { c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 1.05, h * 0.07, S * 0.06, 0, 7); c.fill(); }
      c.fillStyle = '#111'; c.fillRect(w * 0.13, h * 0.26, S * 0.06, S * 0.06);
    } else if (e.k === 'frog') {
      c.fillStyle = '#4f9a3a'; c.beginPath(); c.ellipse(w / 2, h * 0.6, w * 0.45, h * 0.4, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.3, h * 0.25, S * 0.11, 0, 7); c.arc(w * 0.7, h * 0.25, S * 0.11, 0, 7); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.arc(w * 0.28, h * 0.25, S * 0.05, 0, 7); c.arc(w * 0.68, h * 0.25, S * 0.05, 0, 7); c.fill();
      c.strokeStyle = '#2a5a20'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * 0.25, h * 0.7); c.lineTo(w * 0.75, h * 0.7); c.stroke();
    } else if (e.k === 'scorp') {
      c.fillStyle = '#5a3a22'; for (var i = 0; i < 3; i++) { c.beginPath(); c.ellipse(w * (0.3 + i * 0.18), h * 0.7, w * 0.13, h * 0.2, 0, 0, 7); c.fill(); }
      c.strokeStyle = '#5a3a22'; c.lineWidth = S * 0.1; c.beginPath(); c.moveTo(w * 0.75, h * 0.65); c.quadraticCurveTo(w * 1.05, h * 0.1, w * 0.7, -h * 0.05 + Math.sin(t * 6) * S * 0.04); c.stroke();
      c.fillStyle = '#d33'; c.beginPath(); c.moveTo(w * 0.7, -h * 0.15); c.lineTo(w * 0.62, h * 0.05); c.lineTo(w * 0.78, h * 0.05); c.fill();
      c.lineWidth = S * 0.06; c.beginPath(); c.moveTo(w * 0.2, h * 0.65); c.lineTo(w * 0.02, h * 0.45); c.lineTo(-w * 0.05, h * 0.6); c.stroke();
      for (i = 0; i < 3; i++) { c.beginPath(); c.moveTo(w * (0.3 + i * 0.15), h * 0.85); c.lineTo(w * (0.25 + i * 0.15) + leg * 0.3, h); c.stroke(); }
    } else if (e.k === 'eagle' || e.k === 'locust') {
      var fl = Math.sin(t * 14) * h * 0.5, eg = e.k === 'eagle';
      c.fillStyle = eg ? '#6b4a2a' : '#7a8a3a'; c.beginPath(); c.ellipse(w * 0.5, h * 0.55, w * 0.4, h * 0.25, 0, 0, 7); c.fill();
      c.fillStyle = eg ? '#8a6a42' : 'rgba(220,230,200,.8)'; c.beginPath(); c.moveTo(w * 0.35, h * 0.5); c.lineTo(w * 0.7, h * 0.15 - fl); c.lineTo(w * 0.8, h * 0.5); c.fill();
      if (eg) { c.fillStyle = '#f2ecdf'; c.beginPath(); c.arc(w * 0.13, h * 0.42, S * 0.15, 0, 7); c.fill(); c.fillStyle = '#e0a63c'; c.beginPath(); c.moveTo(w * 0.02, h * 0.38); c.lineTo(-w * 0.1, h * 0.5); c.lineTo(w * 0.03, h * 0.52); c.fill(); }
      else { c.strokeStyle = '#4a5a20'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * 0.85, h * 0.6); c.lineTo(w * 1.05, h * 0.95); c.moveTo(w * 0.1, h * 0.45); c.lineTo(-w * 0.1, h * 0.1); c.stroke(); }
      c.fillStyle = '#111'; c.fillRect(w * 0.1, h * 0.38, S * 0.05, S * 0.05);
    } else if (e.k === 'snake') {
      c.strokeStyle = '#3f8a3a'; c.lineWidth = S * 0.26; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * 0.5, h * 1.3);
      for (var k = 0; k <= 6; k++) c.lineTo(w * 0.5 + Math.sin(k * 1.2 + t * 4) * S * 0.15, h * (1 - k / 6) + S * 0.15); c.stroke(); c.lineCap = 'butt';
      c.fillStyle = '#3f8a3a'; c.beginPath(); c.ellipse(w * 0.5, S * 0.18, S * 0.24, S * 0.18, 0, 0, 7); c.fill();
      c.fillStyle = '#ffde4a'; c.fillRect(w * 0.35, S * 0.1, S * 0.07, S * 0.07); c.strokeStyle = '#d33'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * 0.3, S * 0.25); c.lineTo(w * 0.12, S * 0.3 + Math.sin(t * 20) * 2); c.stroke();
    } else if (e.k === 'boss') {
      if (e.hit) c.globalAlpha = 0.6;
      if (G.set === 'od') { // Polyphemus, the one-eyed giant
        c.fillStyle = '#6a5a3a'; c.fillRect(w * 0.15, h * 0.32, w * 0.7, h * 0.48); c.fillStyle = '#ece6d6'; c.fillRect(w * 0.15, h * 0.32, w * 0.7, h * 0.1);
        c.fillStyle = '#b98a62'; c.fillRect(w * 0.25 + leg, h * 0.78, w * 0.18, h * 0.22); c.fillRect(w * 0.58 - leg, h * 0.78, w * 0.18, h * 0.22);
        c.fillStyle = '#c89a72'; c.beginPath(); c.arc(w * 0.38, h * 0.18, w * 0.24, 0, 7); c.fill();
        c.fillStyle = '#4a3a2a'; c.beginPath(); c.arc(w * 0.38, h * 0.26, w * 0.2, 0.1, Math.PI - 0.1); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.3, h * 0.13, S * 0.2, 0, 7); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(w * 0.26, h * 0.13, S * 0.09, 0, 7); c.fill();
        c.strokeStyle = '#5a3a1a'; c.lineWidth = S * 0.18; c.beginPath(); c.moveTo(w * 0.8, h * 0.4); c.lineTo(w * 1.05, -h * 0.05); c.stroke();
      } else if (G.set === 'gr') { // the Minotaur
        c.fillStyle = '#7a4a2a'; c.fillRect(w * 0.2, h * 0.35, w * 0.6, h * 0.45); c.fillStyle = '#c9a07a'; c.fillRect(w * 0.25, h * 0.45, w * 0.5, h * 0.1);
        c.fillStyle = '#5a3418'; c.fillRect(w * 0.25 + leg, h * 0.78, w * 0.16, h * 0.22); c.fillRect(w * 0.6 - leg, h * 0.78, w * 0.16, h * 0.22);
        c.fillStyle = '#6b3e20'; c.beginPath(); c.ellipse(w * 0.32, h * 0.22, w * 0.24, h * 0.15, 0, 0, 7); c.fill();
        c.fillStyle = '#eee3c8'; c.beginPath(); c.moveTo(w * 0.2, h * 0.12); c.quadraticCurveTo(w * 0.05, -h * 0.02, w * 0.12, -h * 0.1); c.lineTo(w * 0.24, h * 0.1); c.fill();
        c.beginPath(); c.moveTo(w * 0.45, h * 0.12); c.quadraticCurveTo(w * 0.62, -h * 0.02, w * 0.55, -h * 0.1); c.lineTo(w * 0.4, h * 0.1); c.fill();
        c.fillStyle = '#d33'; c.fillRect(w * 0.18, h * 0.18, S * 0.12, S * 0.1); c.fillStyle = '#e8c0a0'; c.fillRect(w * 0.1, h * 0.27, w * 0.15, h * 0.08);
      } else { // Cacus
        c.fillStyle = '#5a2418'; c.fillRect(w * 0.18, h * 0.3, w * 0.64, h * 0.5); c.fillStyle = '#3a160e'; c.fillRect(w * 0.25 + leg, h * 0.78, w * 0.18, h * 0.22); c.fillRect(w * 0.58 - leg, h * 0.78, w * 0.18, h * 0.22);
        c.fillStyle = '#8a4a30'; c.beginPath(); c.arc(w * 0.35, h * 0.2, w * 0.2, 0, 7); c.fill(); c.fillStyle = '#2a120a'; c.fillRect(w * 0.15, h * 0.03, w * 0.4, h * 0.08);
        c.fillStyle = '#ffde4a'; c.fillRect(w * 0.22, h * 0.15, S * 0.12, S * 0.1); c.fillStyle = '#f39a2b'; c.beginPath(); c.moveTo(w * 0.15, h * 0.25); c.lineTo(-w * 0.05 - Math.sin(t * 15) * S * 0.1, h * 0.28); c.lineTo(w * 0.15, h * 0.32); c.fill();
        c.fillStyle = 'rgba(90,90,90,.35)'; c.beginPath(); c.arc(w * 0.6, -h * 0.1 + Math.sin(t * 2) * 4, S * 0.4, 0, 7); c.fill();
      }
      c.globalAlpha = 1;
      c.restore();
      // health
      var hx = sx(e.x), hy = sy(e.y) - S * 0.4; c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(hx, hy, e.w * S, S * 0.15); c.fillStyle = '#d33'; c.fillRect(hx, hy, e.w * S * Math.max(0, e.hp) / 6, S * 0.15);
      return;
    }
    c.restore();
  }
  function drawHero() {
    var X = sx(p.x + p.w / 2), Y = sy(p.y + p.h), s = S, gr = G.set !== 'ro', od = G.set === 'od', moving = Math.abs(p.vx) > 0.3 && p.on;
    if (p.inv > 0 && Math.floor(p.inv * 12) % 2) return;
    var step = moving ? Math.sin(p.walk * 3) * s * 0.12 : 0;
    c.save(); c.translate(X, Y); c.scale(p.face, 1);
    if (p.star > 0) { c.shadowColor = '#fff2a0'; c.shadowBlur = s * 0.5; }
    var tunic = od ? (p.power === 2 ? '#d98a4a' : '#9a4a1e') : gr ? (p.power === 2 ? '#5aa0e0' : '#1f5fa8') : (p.power === 2 ? '#e0603a' : '#a8201a');
    // legs
    c.fillStyle = '#c99a72'; c.fillRect(-s * 0.18 + step, -s * 0.32, s * 0.13, s * 0.32); c.fillRect(s * 0.06 - step, -s * 0.32, s * 0.13, s * 0.32);
    c.fillStyle = '#6b4a2a'; c.fillRect(-s * 0.2 + step, -s * 0.08, s * 0.17, s * 0.08); c.fillRect(s * 0.04 - step, -s * 0.08, s * 0.17, s * 0.08);
    if (p.star > 0) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-s * 0.2 + step, -s * 0.06); c.lineTo(-s * 0.42 + step, -s * 0.3); c.lineTo(-s * 0.12 + step, -s * 0.12); c.fill(); }
    // body
    c.fillStyle = tunic; c.beginPath(); c.moveTo(-s * 0.26, -s * 0.3); c.lineTo(s * 0.26, -s * 0.3); c.lineTo(s * 0.2, -s * 0.7); c.lineTo(-s * 0.2, -s * 0.7); c.fill();
    if (!gr) { // Hercules' lion skin
      c.fillStyle = '#c8a060'; c.beginPath(); c.moveTo(-s * 0.32, -s * 0.85); c.lineTo(-s * 0.3, -s * 0.35); c.lineTo(-s * 0.1, -s * 0.5); c.lineTo(-s * 0.05, -s * 0.85); c.fill();
    }
    // arm and weapon
    c.fillStyle = '#c99a72'; c.fillRect(s * 0.12, -s * 0.66, s * 0.1, s * 0.26);
    if (gr) { c.fillStyle = '#c9c9c9'; c.fillRect(s * 0.16, -s * 0.5, s * 0.34, s * 0.05); }
    else { c.fillStyle = '#6b4a2a'; c.save(); c.translate(s * 0.18, -s * 0.42); c.rotate(-0.6); c.fillRect(0, -s * 0.05, s * 0.42, s * 0.1); c.fillRect(s * 0.3, -s * 0.08, s * 0.14, s * 0.16); c.restore(); }
    // head
    c.fillStyle = '#d9a982'; c.beginPath(); c.arc(0, -s * 0.84, s * 0.17, 0, 7); c.fill();
    c.fillStyle = '#111'; c.fillRect(s * 0.06, -s * 0.88, s * 0.05, s * 0.05);
    if (od) { // a sailor's felt cap (pilos), as Odysseus wears on Greek vases
      c.fillStyle = '#7a5a34'; c.beginPath(); c.moveTo(-s * 0.2, -s * 0.9); c.lineTo(s * 0.02, -s * 1.28); c.lineTo(s * 0.2, -s * 0.9); c.fill(); c.fillStyle = '#5a3f22'; c.fillRect(-s * 0.21, -s * 0.93, s * 0.42, s * 0.06);
      c.fillStyle = '#5a3f22'; c.beginPath(); c.arc(s * 0.02, -s * 0.72, s * 0.14, 0.2, Math.PI - 0.2); c.fill();
    } else if (gr) { // bronze helmet with a crest
      c.fillStyle = '#c9973a'; c.beginPath(); c.arc(0, -s * 0.88, s * 0.19, Math.PI, 0); c.fill(); c.fillRect(-s * 0.19, -s * 0.9, s * 0.08, s * 0.2);
      c.fillStyle = '#b8322a'; c.beginPath(); c.moveTo(-s * 0.28, -s * 0.98); c.quadraticCurveTo(0, -s * 1.32, s * 0.18, -s * 1.04); c.lineTo(s * 0.1, -s * 1.0); c.quadraticCurveTo(-s * 0.05, -s * 1.15, -s * 0.24, -s * 0.92); c.fill();
    } else { // lion's head as a hood
      c.fillStyle = '#c8a060'; c.beginPath(); c.arc(-s * 0.02, -s * 0.9, s * 0.2, Math.PI * 0.95, Math.PI * 2.05); c.fill();
      c.fillStyle = '#8a5a2a'; c.beginPath(); c.arc(-s * 0.18, -s * 0.85, s * 0.11, 0, 7); c.fill(); c.fillStyle = '#5a3a1a'; c.fillRect(-s * 0.04, -s * 1.08, s * 0.06, s * 0.05); c.fillRect(s * 0.08, -s * 1.06, s * 0.06, s * 0.05);
    }
    if (p.power > 0) { // shield on the left arm
      c.fillStyle = '#c9973a'; c.beginPath(); c.arc(-s * 0.06, -s * 0.5, s * 0.22, 0, 7); c.fill(); c.strokeStyle = '#7a5a20'; c.lineWidth = s * 0.04; c.stroke();
      c.fillStyle = gr ? '#1f5fa8' : '#a8201a'; c.beginPath(); c.arc(-s * 0.06, -s * 0.5, s * 0.09, 0, 7); c.fill();
    }
    if (p.power === 2) { c.fillStyle = '#8f8a80'; c.beginPath(); c.arc(s * 0.2, -s * 0.33, s * 0.07, 0, 7); c.arc(s * 0.29, -s * 0.36, s * 0.06, 0, 7); c.fill(); }
    c.restore();
  }

  // ---------- sound (tiny synth, off until the player turns it on) ----------
  var AC = null;
  function sfx(n) {
    if (!st.sound) return;
    try { AC = AC || new (W.AudioContext || W.webkitAudioContext)(); } catch (e) { return; }
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime, f = { jump: [420, 640, 0.12], coin: [990, 1320, 0.1], stomp: [220, 110, 0.1], bump: [130, 110, 0.06], break: [180, 60, 0.15], item: [520, 780, 0.15], power: [523, 1046, 0.3], hurt: [400, 150, 0.3], die: [400, 80, 0.7], right: [660, 990, 0.3], wrong: [300, 200, 0.35], throw: [600, 300, 0.08], fire: [160, 90, 0.2], win: [523, 1046, 0.6] }[n] || [440, 440, 0.1];
    o.type = n === 'coin' || n === 'right' || n === 'win' ? 'square' : 'triangle'; o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + f[2]);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + f[2] + 0.05); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + f[2] + 0.06);
  }

  // ---------- HUD and messages ----------
  function hud() {
    if (!G) return;
    var lv = SET[G.set].levels[G.li], pw = p ? ['', '🛡️', '🛡️ 🪨'][p.power] : '';
    $('#hr-lv').textContent = (G.li + 1) + '. ' + lv.name;
    $('#hr-coins').textContent = '🪙 ' + G.coins;
    $('#hr-words').textContent = st.words ? '📜 ' + G.seenL.length : '';
    $('#hr-pw').textContent = pw;
  }
  var sayT = null;
  function say(w, extra) {
    var el = $('#hr-word');
    el.innerHTML = (w ? '<b class="' + (G.set !== 'ro' ? 'gk' : 'la') + '">' + esc(w.f) + '</b>' + (w.p ? ' <i>' + esc(w.p) + '</i>' : '') + ' = ' + esc(w.e) : '') + (extra ? '<span class="ex">' + esc(extra) + '</span>' : '');
    el.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(function () { el.classList.remove('on'); }, extra ? 3800 : 2800);
  }

  // ---------- overlays ----------
  function ov(html) { var o = $('#hr-ov'); o.innerHTML = '<div class="hr-box">' + html + '</div>'; o.hidden = false; paused = true; return o; }
  function closeOv() { $('#hr-ov').hidden = true; paused = false; last = 0; }
  function title() {
    var cur = st.set;
    function lvButtons(set) {
      return SET[set].levels.map(function (l, i) { var open = true, done = st.done[set + i]; return '<button class="hr-lvb" data-set="' + set + '" data-lv="' + i + '"' + (open ? '' : ' disabled') + '><b>' + (i + 1) + '</b> ' + esc(l.name) + (done ? ' ✓' : open ? '' : ' 🔒') + '</button>'; }).join('');
    }
    var o = ov('<h1>Hero’s Road</h1><p class="hr-sub">Run, jump and stomp through ancient Greece or Rome, or sail with Odysseus. Bump the amphora blocks for words, and pick the right door at each gate.</p>' +
      '<div class="hr-sets">' + ORDER.map(function (s) { var S2 = SET[s]; return '<div class="hr-set hr-' + s + (s === cur ? ' sel' : '') + '" data-set="' + s + '"><h2>' + S2.name + '</h2><p>' + ({ gr: 'Theseus on the road to Athens, then into the Labyrinth to face the Minotaur. Words in Koine Greek, with pronunciation.', ro: 'Hercules by the Tiber, then into the cave of Cacus, the fire-breathing cattle thief. Words in Latin.', od: 'Odysseus sailing home from Troy, island to island, to the cave of the Cyclops. Words in Koine Greek, with pronunciation.' })[s] + '</p><div class="hr-lvs">' + lvButtons(s) + '</div></div>'; }).join('') + '</div>' +
      '<div class="hr-opts"><label><input type="radio" name="hr-w" value="1"' + (st.words ? ' checked' : '') + '> Words on (study)</label><label><input type="radio" name="hr-w" value="0"' + (st.words ? '' : ' checked') + '> Words off (just play)</label><label><input type="checkbox" id="hr-snd"' + (st.sound ? ' checked' : '') + '> Sound</label></div>' +
      '<details><summary>How to play</summary><ul>' +
      '<li><b>Keyboard:</b> ← → or A D to move, Space, ↑ or W to jump (hold for higher), Shift or X to run and throw stones, P to pause.</li>' +
      '<li><b>Phone:</b> use the buttons. Hold a direction for a moment to start running.</li>' +
      '<li><b>Amphora blocks:</b> jump into them from below. Most give a coin and a new word; some hold a <b>shield</b> (one extra hit, and you can break bricks), <b>stones</b> to throw, or <b>winged sandals</b> (nothing can hurt you for a while).</li>' +
      '<li><b>Gates:</b> the wall shows a word. Go through the door marked with its meaning. The right door fills your path with coins; the wrong one lets the guards out.</li>' +
      '<li><b>Enemies:</b> jump on wolves, foxes, frogs and birds. Scorpions, snakes and fire can’t be stomped: jump over them or throw stones.</li>' +
      '<li>The flag halfway along is a checkpoint. Progress is saved in this browser.</li></ul>' +
      '<p class="hr-small">The Greek words are Koine, in both Greek settings: every one appears in the New Testament. Homer’s own Greek is older and differs in places. The Latin words are in their dictionary forms.</p></details>');
    o.querySelectorAll('.hr-set').forEach(function (el) { el.addEventListener('click', function (ev) { if (ev.target.closest('button')) return; st.set = el.dataset.set; save(); title(); }); });
    o.querySelectorAll('input[name=hr-w]').forEach(function (r) { r.addEventListener('change', function () { st.words = r.value === '1'; save(); }); });
    $('#hr-snd').addEventListener('change', function () { st.sound = this.checked; save(); if (st.sound) sfx('coin'); });
    o.querySelectorAll('.hr-lvb').forEach(function (b) { b.addEventListener('click', function () { st.set = b.dataset.set; save(); intro(+b.dataset.lv); }); });
  }
  function intro(li) {
    var set = st.set, lv = SET[set].levels[li];
    var o = ov('<p class="hr-small">' + SET[set].name + ' · level ' + (li + 1) + ' of 4</p><h2>' + esc(lv.name) + '</h2><p>' + esc(lv.story) + '</p><button class="hr-btn pri" id="hr-go">Start</button> <button class="hr-btn" id="hr-back">Back</button>');
    $('#hr-go').addEventListener('click', function () { closeOv(); newRun(set, li); });
    $('#hr-back').addEventListener('click', title);
  }
  function levelClear() {
    var set = G.set, li = G.li, lv = SET[set].levels[li];
    st.done[set + li] = 1; st.open[set] = Math.max(st.open[set] || 1, Math.min(4, li + 2)); save();
    var words = G.seenL.slice(), list = words.map(function (e) { var w = word(e); return '<tr><td class="' + (set !== 'ro' ? 'gk' : 'la') + '">' + esc(w.f) + (w.p ? '<br><i>' + esc(w.p) + '</i>' : '') + '</td><td>' + esc(w.e) + '</td></tr>'; }).join('');
    var m = Math.floor(G.time / 60), s = Math.floor(G.time % 60);
    var stats = '<p class="hr-stats">🪙 ' + G.coins + ' coins · ⏱ ' + m + ':' + (s < 10 ? '0' : '') + s + (G.gatesN ? ' · gates ' + G.gatesOK + ' of ' + G.gatesN + ' right' : '') + ' · falls ' + G.falls + '</p>';
    var last = li === 3;
    var o = ov('<h2>' + (last ? ({ gr: 'The Minotaur is defeated!', ro: 'Cacus is defeated!', od: 'You escaped the Cyclops!' })[set] : 'Level complete') + '</h2>' + (last ? '<p>' + esc(SET[set].ending) + '</p>' : '') + stats +
      (st.words && words.length ? '<p class="hr-small">Words you met in this level</p><table class="hr-wl">' + list + '</table>' : '') +
      (last ? '<button class="hr-btn pri" id="hr-other">Play ' + SET[ORDER[(ORDER.indexOf(set) + 1) % 3]].name + '</button>' : '<button class="hr-btn pri" id="hr-next">Next level</button>') +
      ' <button class="hr-btn" id="hr-again">Play again</button> <button class="hr-btn" id="hr-menu">Menu</button>');
    if (last) $('#hr-other').addEventListener('click', function () { st.set = ORDER[(ORDER.indexOf(set) + 1) % 3]; save(); intro(0); });
    else $('#hr-next').addEventListener('click', function () { intro(li + 1); });
    $('#hr-again').addEventListener('click', function () { closeOv(); newRun(set, li); });
    $('#hr-menu').addEventListener('click', title);
  }
  function pause() {
    if (!G || $('#hr-ov').hidden === false) return;
    var o = ov('<h2>Paused</h2><p class="hr-small">' + esc(SET[G.set].levels[G.li].name) + '</p><button class="hr-btn pri" id="hr-res">Continue</button> <button class="hr-btn" id="hr-rs">Restart level</button> <button class="hr-btn" id="hr-menu2">Menu</button>');
    $('#hr-res').addEventListener('click', closeOv);
    $('#hr-rs').addEventListener('click', function () { var s = G.set, l = G.li; closeOv(); newRun(s, l); });
    $('#hr-menu2').addEventListener('click', function () { G = null; title(); });
  }

  // ---------- input ----------
  var KM = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump', KeyK: 'jump', ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run', KeyJ: 'run' };
  D.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var k = KM[e.code];
    if (e.code === 'KeyP' || e.code === 'Escape') { if (G && !paused) pause(); else if (G && $('#hr-ov').querySelector('#hr-res')) closeOv(); return; }
    if (!k || !G || paused) return;
    e.preventDefault();
    if (k === 'jump' && !keys.jump) keys.jumpPressed = true;
    if (k === 'run' && !keys.run) keys.throwPressed = true;
    keys[k] = true;
  });
  D.addEventListener('keyup', function (e) { var k = KM[e.code]; if (k) keys[k] = false; });
  W.addEventListener('blur', function () { keys = {}; });
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !paused) pause(); });
  root.querySelectorAll('.hr-pad button').forEach(function (b) {
    var k = b.dataset.k;
    function down(e) { e.preventDefault(); if (k === 'jump' && !keys.jump) keys.jumpPressed = true; if (k === 'run' && !keys.run) keys.throwPressed = true; keys[k] = true; b.classList.add('on'); }
    function up(e) { e.preventDefault(); keys[k] = false; b.classList.remove('on'); }
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  if (touch) root.classList.add('touch');
  $('#hr-pause').addEventListener('click', pause);

  // ---------- loop ----------
  function frame(ts) {
    W.requestAnimationFrame(frame);
    if (!G) { return; }
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (!paused) { var n = Math.ceil(dt / (1 / 120)); for (var i = 0; i < n; i++) step(dt / n); }
    draw();
  }
  fit(); title(); W.requestAnimationFrame(frame);
  // test hook
  W.__hero = { get G() { return G; }, get p() { return p; }, keys: keys, set god(v) { god = v; }, setKeys: function (o) { for (var k in o) keys[k] = o[k]; }, start: function (s, l) { st.set = s; closeOv(); newRun(s, l); }, step: function (dt) { step(dt); }, hold: function (v) { paused = v; }, snap: function () { return JSON.stringify({ G: G, p: p }); }, restore: function (str) { var o = JSON.parse(str); G = o.G; p = o.p; p.plat = null; }, word: word, SET: SET, get paused() { return paused; } };
})(window, document);
