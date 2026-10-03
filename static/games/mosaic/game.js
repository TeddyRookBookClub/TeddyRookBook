/* Mosaic Match: a match-three puzzle. Every tile is a thing with a Latin and a Koine Greek name.
   Words: Latin in its dictionary form; Greek words are all found in the New Testament (Koine). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('mm'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // [emoji, Latin, Greek, English]: 180 words, six new ones on every level. Every Greek word is found in the New Testament.
  var TILES = [
    ['🍇', 'uva', 'σταφυλή', 'grapes'], ['🍞', 'panis', 'ἄρτος', 'bread'], ['🐟', 'piscis', 'ἰχθύς', 'fish'],
    ['👑', 'corona', 'στέφανος', 'crown'], ['🗡️', 'gladius', 'μάχαιρα', 'sword'], ['🪔', 'lucerna', 'λύχνος', 'lamp'],
    ['⛵', 'navis', 'πλοῖον', 'ship'], ['🐑', 'ovis', 'πρόβατον', 'sheep'], ['🕊️', 'columba', 'περιστερά', 'dove'],
    ['⭐', 'stella', 'ἀστήρ', 'star'], ['🗝️', 'clavis', 'κλείς', 'key'], ['📖', 'liber', 'βιβλίον', 'book'],
    ['☀️', 'sol', 'ἥλιος', 'sun'], ['🔥', 'ignis', 'πῦρ', 'fire'], ['🌳', 'arbor', 'δένδρον', 'tree'],
    ['🍷', 'vinum', 'οἶνος', 'wine'], ['🐎', 'equus', 'ἵππος', 'horse'], ['💧', 'aqua', 'ὕδωρ', 'water'],
    ['🪨', 'lapis', 'λίθος', 'stone'], ['🏠', 'domus', 'οἶκος', 'house'], ['🌙', 'luna', 'σελήνη', 'moon'],
    ['🐍', 'serpens', 'ὄφις', 'snake'], ['🦁', 'leo', 'λέων', 'lion'], ['🐺', 'lupus', 'λύκος', 'wolf'],
    ['🦊', 'vulpes', 'ἀλώπηξ', 'fox'], ['🐕', 'canis', 'κύων', 'dog'], ['🐖', 'porcus', 'χοῖρος', 'pig'],
    ['🐓', 'gallus', 'ἀλέκτωρ', 'rooster'], ['🐔', 'gallina', 'ὄρνις', 'hen'], ['🦅', 'aquila', 'ἀετός', 'eagle'],
    ['🐪', 'camelus', 'κάμηλος', 'camel'], ['🐂', 'bos', 'βοῦς', 'ox'], ['🐐', 'haedus', 'ἔριφος', 'young goat'],
    ['🦂', 'scorpio', 'σκορπίος', 'scorpion'], ['🐛', 'vermis', 'σκώληξ', 'worm'], ['🦗', 'locusta', 'ἀκρίς', 'locust'],
    ['🍯', 'mel', 'μέλι', 'honey'], ['🥚', 'ovum', 'ᾠόν', 'egg'], ['🧂', 'sal', 'ἅλας', 'salt'],
    ['🫒', 'oliva', 'ἐλαία', 'olive'], ['🌾', 'triticum', 'σῖτος', 'wheat'], ['🌿', 'herba', 'χόρτος', 'grass'],
    ['🌱', 'semen', 'σπέρμα', 'seed'], ['🍃', 'folium', 'φύλλον', 'leaf'], ['🌸', 'flos', 'ἄνθος', 'flower'],
    ['🌷', 'lilium', 'κρίνον', 'lily'], ['🌵', 'spina', 'ἄκανθα', 'thorn'], ['🌴', 'palma', 'φοῖνιξ', 'palm'],
    ['🪵', 'lignum', 'ξύλον', 'wood'], ['⛰️', 'mons', 'ὄρος', 'mountain'], ['🌊', 'mare', 'θάλασσα', 'sea'],
    ['🏞️', 'flumen', 'ποταμός', 'river'], ['☁️', 'nubes', 'νεφέλη', 'cloud'], ['🌧️', 'pluvia', 'βροχή', 'rain'],
    ['💨', 'ventus', 'ἄνεμος', 'wind'], ['❄️', 'nix', 'χιών', 'snow'], ['🌍', 'terra', 'γῆ', 'earth'],
    ['🌌', 'caelum', 'οὐρανός', 'sky'], ['💡', 'lux', 'φῶς', 'light'], ['🚪', 'ostium', 'θύρα', 'door'],
    ['🪟', 'fenestra', 'θυρίς', 'window'], ['🛏️', 'lectus', 'κλίνη', 'bed'], ['🪑', 'cathedra', 'καθέδρα', 'seat'],
    ['🍽️', 'mensa', 'τράπεζα', 'table'], ['🏺', 'hydria', 'ὑδρία', 'water jar'], ['🥛', 'lac', 'γάλα', 'milk'],
    ['🏆', 'calix', 'ποτήριον', 'cup'], ['🧺', 'cophinus', 'κόφινος', 'basket'], ['🪡', 'acus', 'ῥαφίς', 'needle'],
    ['👕', 'tunica', 'χιτών', 'tunic'], ['🧥', 'vestimentum', 'ἱμάτιον', 'cloak'], ['👡', 'calceamentum', 'ὑπόδημα', 'sandal'],
    ['💍', 'anulus', 'δακτύλιος', 'ring'], ['💰', 'pecunia', 'ἀργύριον', 'money'], ['🪙', 'denarius', 'δηνάριον', 'denarius'],
    ['👛', 'sacculus', 'βαλλάντιον', 'purse'], ['💎', 'margarita', 'μαργαρίτης', 'pearl'], ['⚓', 'ancora', 'ἄγκυρα', 'anchor'],
    ['🕸️', 'rete', 'δίκτυον', 'net'], ['🛶', 'navicula', 'πλοιάριον', 'small boat'], ['🛡️', 'scutum', 'θυρεός', 'shield'],
    ['⛑️', 'galea', 'περικεφαλαία', 'helmet'], ['🏹', 'arcus', 'τόξον', 'bow'], ['⛓️', 'catena', 'ἅλυσις', 'chain'],
    ['🪓', 'securis', 'ἀξίνη', 'axe'], ['📜', 'epistula', 'ἐπιστολή', 'letter'], ['✒️', 'calamus', 'κάλαμος', 'reed pen'],
    ['🎺', 'tuba', 'σάλπιγξ', 'trumpet'], ['🎵', 'canticum', 'ᾠδή', 'song'], ['🏙️', 'civitas', 'πόλις', 'city'],
    ['🏘️', 'vicus', 'κώμη', 'village'], ['🗼', 'turris', 'πύργος', 'tower'], ['🧱', 'murus', 'τεῖχος', 'wall'],
    ['🛣️', 'via', 'ὁδός', 'road'], ['⛲', 'fons', 'πηγή', 'spring'], ['🕳️', 'puteus', 'φρέαρ', 'well'],
    ['🪦', 'monumentum', 'μνημεῖον', 'tomb'], ['🏟️', 'theatrum', 'θέατρον', 'theater'], ['🏕️', 'tabernaculum', 'σκηνή', 'tent'],
    ['👁️', 'oculus', 'ὀφθαλμός', 'eye'], ['👂', 'auris', 'οὖς', 'ear'], ['👄', 'os', 'στόμα', 'mouth'],
    ['🦷', 'dens', 'ὀδούς', 'tooth'], ['👅', 'lingua', 'γλῶσσα', 'tongue'], ['✋', 'manus', 'χείρ', 'hand'],
    ['🦶', 'pes', 'πούς', 'foot'], ['❤️', 'cor', 'καρδία', 'heart'], ['🩸', 'sanguis', 'αἷμα', 'blood'],
    ['💪', 'brachium', 'βραχίων', 'arm'], ['👆', 'digitus', 'δάκτυλος', 'finger'], ['🦵', 'genu', 'γόνυ', 'knee'],
    ['💇', 'capillus', 'θρίξ', 'hair'], ['👤', 'caput', 'κεφαλή', 'head'], ['👶', 'infans', 'βρέφος', 'baby'],
    ['👦', 'puer', 'παιδίον', 'child'], ['👧', 'puella', 'κοράσιον', 'girl'], ['👨', 'vir', 'ἀνήρ', 'man'],
    ['👩', 'mulier', 'γυνή', 'woman'], ['👴', 'senex', 'πρεσβύτης', 'old man'], ['🤴', 'rex', 'βασιλεύς', 'king'],
    ['👸', 'regina', 'βασίλισσα', 'queen'], ['💂', 'miles', 'στρατιώτης', 'soldier'], ['🧑‍🌾', 'agricola', 'γεωργός', 'farmer'],
    ['🎣', 'piscator', 'ἁλιεύς', 'fisherman'], ['🧑‍⚕️', 'medicus', 'ἰατρός', 'doctor'], ['🧑‍🏫', 'magister', 'διδάσκαλος', 'teacher'],
    ['🧑‍⚖️', 'iudex', 'κριτής', 'judge'], ['🥷', 'fur', 'κλέπτης', 'thief'], ['👼', 'angelus', 'ἄγγελος', 'angel'],
    ['👿', 'daemonium', 'δαιμόνιον', 'demon'], ['👬', 'frater', 'ἀδελφός', 'brother'], ['👭', 'soror', 'ἀδελφή', 'sister'],
    ['🍎', 'fructus', 'καρπός', 'fruit'], ['🥩', 'caro', 'κρέας', 'meat'], ['🕛', 'hora', 'ὥρα', 'hour'],
    ['🌃', 'nox', 'νύξ', 'night'], ['💤', 'somnus', 'ὕπνος', 'sleep'], ['🎁', 'donum', 'δῶρον', 'gift'],
    ['✝️', 'crux', 'σταυρός', 'cross'], ['🪞', 'speculum', 'ἔσοπτρον', 'mirror'], ['🧽', 'spongia', 'σπόγγος', 'sponge'],
    ['🎒', 'pera', 'πήρα', 'bag'], ['🦯', 'virga', 'ῥάβδος', 'staff'], ['🛞', 'rota', 'τροχός', 'wheel'],
    ['🏝️', 'insula', 'νῆσος', 'island'], ['🏖️', 'litus', 'αἰγιαλός', 'shore'], ['🏜️', 'desertum', 'ἔρημος', 'desert'],
    ['🌼', 'sinapi', 'σίναπι', 'mustard'], ['🐄', 'vitulus', 'μόσχος', 'calf'], ['🐻', 'ursus', 'ἄρκος', 'bear'],
    ['🐆', 'pardus', 'πάρδαλις', 'leopard'], ['🐉', 'draco', 'δράκων', 'dragon'], ['🐸', 'rana', 'βάτραχος', 'frog'],
    ['🦟', 'culex', 'κώνωψ', 'gnat'], ['🐦', 'passer', 'στρουθίον', 'sparrow'], ['🐋', 'cetus', 'κῆτος', 'sea monster'],
    ['🛒', 'currus', 'ἅρμα', 'chariot'], ['🍶', 'oleum', 'ἔλαιον', 'oil'], ['🧪', 'unguentum', 'μύρον', 'ointment'],
    ['🪣', 'situla', 'ἄντλημα', 'bucket'], ['🥖', 'fermentum', 'ζύμη', 'yeast'], ['🌰', 'granum', 'κόκκος', 'grain'],
    ['⚱️', 'vas', 'σκεῦος', 'vessel'], ['🧣', 'linteum', 'λέντιον', 'towel'], ['🪢', 'funiculus', 'σχοινίον', 'rope'],
    ['🧶', 'lana', 'ἔριον', 'wool'], ['🗺️', 'regio', 'χώρα', 'country'], ['🏰', 'praetorium', 'πραιτώριον', 'governor\'s hall'],
    ['⚔️', 'bellum', 'πόλεμος', 'war'], ['🚩', 'signum', 'σημεῖον', 'sign'], ['🔗', 'vinculum', 'δεσμός', 'bond'],
    ['🥣', 'catinus', 'τρύβλιον', 'dish'], ['🌫️', 'nebula', 'ἀχλύς', 'mist'], ['🌈', 'iris', 'ἶρις', 'rainbow'],
    ['🌩️', 'tonitruum', 'βροντή', 'thunder'], ['🌪️', 'procella', 'λαῖλαψ', 'storm'], ['🕯️', 'candelabrum', 'λυχνία', 'lampstand'],
    ['👣', 'vestigium', 'ἴχνος', 'footprint'], ['🧠', 'mens', 'νοῦς', 'mind'], ['🗣️', 'vox', 'φωνή', 'voice']
  ];
  var N = 7, KEY = 'trb-mosaic-v1', st = { lang: 'la', best: 1, hi: 0, labels: true };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY)); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function word(t) { return TILES[t][st.lang === 'la' ? 1 : 2]; }
  function cls() { return st.lang === 'la' ? 'la' : 'gr'; }
  var LEVELS = 30;
  function levelDef(n) { // n from 1; six tile kinds per level, all new on every level
    var kinds = []; for (var i = 0; i < 6; i++) kinds.push(((n - 1) * 6 + i) % TILES.length);
    var goals = [], g = 1 + (n > 4 ? 1 : 0) + (n > 14 ? 1 : 0);
    for (var j = 0; j < g; j++) goals.push({ t: kinds[(n + j * 2) % 6], need: 8 + Math.min(14, Math.floor(n / 2)) + j * 2, got: 0 });
    return { kinds: kinds, goals: goals, moves: 16 + Math.min(10, Math.floor(n / 3)) + g * 3 };
  }
  var G = null, busy = false, sel = null, uid = 0, hint = null;
  // six clearly different colours, given to the six kinds in play (not tied to the word)
  var SPI = { l: '⚡', b: '💥', s: '🌟' };
  var PAL = ['#d32f2f', '#f0b400', '#2e9442', '#1e6fd6', '#8a3fc7', '#30363b'];

  // ---------- screens ----------
  function menu() {
    G = null;
    root.innerHTML = '<div class="mm-menu"><h1>Mosaic Match</h1><p>Swap two neighbouring tiles to line up three or more of a kind (or make a square of four). Every tile is a thing with a Latin or Greek name, and every match shows you the word.</p>' +
      '<div class="mm-opt"><span>Language</span><div class="mm-seg"><button data-l="la"' + (st.lang === 'la' ? ' class="on"' : '') + '>Latin</button><button data-l="gr"' + (st.lang === 'gr' ? ' class="on"' : '') + '>Koine Greek</button></div></div>' +
      '<div class="mm-opt"><span>Words on the tiles</span><div class="mm-seg"><button data-w="1"' + (st.labels ? ' class="on"' : '') + '>Show</button><button data-w="0"' + (!st.labels ? ' class="on"' : '') + '>Hide (harder)</button></div></div>' +
      '<div class="mm-btns"><button class="mm-btn pri" data-go="' + Math.min(st.best, LEVELS) + '">' + (st.best > 1 ? 'Continue: level ' + Math.min(st.best, LEVELS) : 'Start: level 1') + '</button><button class="mm-btn" data-go="0">Endless practice</button></div>' +
      '<div class="mm-levels">' + Array.apply(null, Array(LEVELS)).map(function (_, i) { var n = i + 1, open = n <= st.best; return '<button class="mm-lv' + (open ? '' : ' lock') + (n < st.best ? ' done' : '') + '" ' + (open ? 'data-go="' + n + '"' : 'disabled') + '>' + n + '</button>'; }).join('') + '</div>' +
      '<p class="mm-small">' + (st.hi ? 'Best endless score: ' + st.hi + '. ' : '') + 'Levels unlock one at a time, and every level has six new words (180 in all). Endless practice has no move limit and uses every word. Progress is saved only in this browser.</p>' +
      '<details class="mm-help"><summary>How to play</summary><ul><li>Tap a tile, then tap a neighbour to swap them (or swipe a tile). The swap must make a line of three or more, or a two-by-two square.</li><li>Stuck? Tap 💡 Hint and the two tiles to swap will glow.</li><li>Each level asks you to collect certain things, named in ' + (st.lang === 'la' ? 'Latin' : 'Greek') + ', before your moves run out.</li><li>Bigger matches leave a special tile of the same kind. Match it later to set it off:<br>⚡ four in a row clears its whole row and column;<br>💥 an L, T or cross shape clears the tiles around it;<br>🌟 five or more in a row clears every tile of that kind on the board.</li><li>Special tiles caught in a blast go off too.</li><li>After each level a quick question asks what one of the words means. A right answer gives bonus points.</li><li>The Greek words are all Koine: each one is found in the New Testament.</li></ul></details></div>';
    root.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { st.lang = b.dataset.l; save(); menu(); }; });
    root.querySelectorAll('[data-w]').forEach(function (b) { b.onclick = function () { st.labels = b.dataset.w === '1'; save(); menu(); }; });
    root.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { start(+b.dataset.go); }; });
  }
  function start(level) {
    var def = level ? levelDef(level) : { kinds: null, goals: [], moves: Infinity };
    G = { level: level, kinds: def.kinds || pickKinds(), goals: def.goals, moves: def.moves, score: 0, grid: [], seen: {}, matches: 0 };
    root.innerHTML = '<div class="mm-game"><div class="mm-top"><button class="mm-btn sm" id="mm-back">☰ Menu</button><div class="mm-info"><b>' + (level ? 'Level ' + level : 'Endless') + '</b><span id="mm-moves"></span><span id="mm-score"></span></div><button class="mm-btn sm" id="mm-hint">💡 Hint</button></div>' +
      '<div class="mm-goals" id="mm-goals"></div><div class="mm-word" id="mm-word">&nbsp;</div><div class="mm-boardwrap"><div class="mm-board" id="mm-board"></div></div><div class="mm-modal" id="mm-modal" hidden></div></div>';
    $('#mm-back').onclick = menu;
    $('#mm-hint').onclick = function () { if (busy || !G) return; var mv = findMove(); if (!mv) return; hint = mv; sel = null; draw(); $('#mm-word').textContent = 'Swap the two glowing tiles.'; };
    var bd = $('#mm-board');
    bd.addEventListener('click', function (e) { var el = e.target.closest('.mm-tile'); if (el) tap(+el.dataset.r, +el.dataset.c); });
    var t0 = null;
    bd.addEventListener('touchstart', function (e) { var el = e.target.closest('.mm-tile'); if (el) t0 = { r: +el.dataset.r, c: +el.dataset.c, x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    bd.addEventListener('touchmove', function (e) {
      if (!t0) return; var dx = e.touches[0].clientX - t0.x, dy = e.touches[0].clientY - t0.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return; e.preventDefault();
      var r = t0.r + (Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 1 : -1) : 0), c = t0.c + (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0), a = t0; t0 = null; sel = null;
      if (r >= 0 && r < N && c >= 0 && c < N) trySwap(a.r, a.c, r, c);
    }, { passive: false });
    fill(true); hud(); draw(true);
  }
  function pickKinds() { var a = TILES.map(function (_, i) { return i; }); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a.slice(0, 6); }
  function mk(type) { return { id: ++uid, t: type, sp: false, from: null }; }
  function fill(fresh) {
    do {
      G.grid = [];
      for (var r = 0; r < N; r++) { G.grid.push([]); for (var c = 0; c < N; c++) { var t; do { t = G.kinds[rnd(6)]; } while ((c > 1 && G.grid[r][c - 1].t === t && G.grid[r][c - 2].t === t) || (r > 1 && G.grid[r - 1][c].t === t && G.grid[r - 2][c].t === t) || (r > 0 && c > 0 && G.grid[r - 1][c].t === t && G.grid[r][c - 1].t === t && G.grid[r - 1][c - 1].t === t)); G.grid[r].push(mk(t)); } }
    } while (!hasMove());
  }
  // ---------- drawing ----------
  function draw(first) {
    var bd = $('#mm-board'), have = {};
    Array.prototype.forEach.call(bd.children, function (el) { have[el.dataset.id] = el; });
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var t = G.grid[r][c]; if (!t) continue;
      var el = have[t.id];
      if (!el) {
        el = D.createElement('button'); el.type = 'button'; el.className = 'mm-tile'; el.dataset.id = t.id;
        el.style.transform = 'translate(' + (c * 100) + '%,' + ((t.from != null ? t.from : r) * 100) + '%)'; bd.appendChild(el); void el.offsetWidth;
      }
      delete have[t.id];
      var T = TILES[t.t];
      el.innerHTML = '<span class="mm-in" style="--c:' + PAL[Math.max(0, G.kinds.indexOf(t.t))] + '"><i>' + (t.sp ? SPI[t.sp] : T[0]) + '</i>' + (st.labels ? '<small class="' + cls() + (word(t.t).length > 11 ? ' xs' : word(t.t).length > 8 ? ' sm' : '') + '">' + esc(word(t.t)) + '</small>' : '') + '</span>';
      el.setAttribute('aria-label', T[3] + (t.sp ? ' (special tile)' : ''));
      el.dataset.r = r; el.dataset.c = c; el.classList.toggle('sel', !!sel && sel.r === r && sel.c === c); el.classList.toggle('sp', !!t.sp); el.classList.toggle('hint', !!hint && ((hint[0] === r && hint[1] === c) || (hint[2] === r && hint[3] === c)));
      el.style.transform = 'translate(' + (c * 100) + '%,' + (r * 100) + '%)';
    }
    Object.keys(have).forEach(function (id) { var el = have[id]; el.classList.add('pop'); setTimeout(function () { el.remove(); }, 220); });
  }
  function hud() {
    $('#mm-moves').textContent = G.level ? G.moves + ' moves left' : G.matches + ' matches';
    $('#mm-score').textContent = G.score + ' points';
    $('#mm-goals').innerHTML = G.level ? G.goals.map(function (g) { var d = g.got >= g.need; return '<span class="mm-goal' + (d ? ' done' : '') + '"><i>' + TILES[g.t][0] + '</i><b class="' + cls() + '">' + esc(word(g.t)) + '</b> ' + (d ? '✓' : Math.min(g.got, g.need) + ' / ' + g.need) + '</span>'; }).join('') :
      '<span class="mm-goal">Practice: match anything. Words learned: ' + Object.keys(G.seen).length + '</span>';
  }
  function showWord(t, n) { var T = TILES[t]; $('#mm-word').innerHTML = T[0] + ' <b class="' + cls() + '">' + esc(word(t)) + '</b> = ' + esc(T[3]) + (n > 3 ? ' <em>×' + n + '!</em>' : ''); }
  // ---------- rules ----------
  function findMatches() {
    var hit = {}, runs = [], lines = {}; // lines: how many straight runs each cell belongs to (2 = corner of an L, T or cross)
    function scan(get, key) {
      for (var a = 0; a < N; a++) { var run = 1; for (var b = 1; b <= N; b++) {
        if (b < N && get(a, b) && get(a, b - 1) && get(a, b).t === get(a, b - 1).t) run++;
        else { if (run >= 3) { var cells = []; for (var x = b - run; x < b; x++) { cells.push(key(a, x)); hit[key(a, x).join()] = 1; lines[key(a, x).join()] = (lines[key(a, x).join()] || 0) + 1; } runs.push({ t: get(a, b - 1).t, cells: cells }); } run = 1; }
      } }
    }
    scan(function (r, c) { return G.grid[r][c]; }, function (r, c) { return [r, c]; });
    scan(function (c, r) { return G.grid[r][c]; }, function (c, r) { return [r, c]; });
    // a two-by-two square of the same kind also counts
    for (var r = 0; r < N - 1; r++) for (var c = 0; c < N - 1; c++) {
      var q = [G.grid[r][c], G.grid[r][c + 1], G.grid[r + 1][c], G.grid[r + 1][c + 1]];
      if (q[0] && q[1] && q[2] && q[3] && q[0].t === q[1].t && q[0].t === q[2].t && q[0].t === q[3].t) {
        var cs = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
        if (cs.every(function (x) { return hit[x.join()]; })) continue;
        cs.forEach(function (x) { hit[x.join()] = 1; }); runs.push({ t: q[0].t, cells: cs, sq: true });
      }
    }
    return { hit: hit, runs: runs, lines: lines };
  }
  function findMove() { // the swap that clears the most tiles, or null
    var best = null, bn = 0;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) for (var d = 0; d < 2; d++) {
      var r2 = r + d, c2 = c + 1 - d; if (r2 >= N || c2 >= N) continue;
      swap(r, c, r2, c2); var n = Object.keys(findMatches().hit).length; swap(r, c, r2, c2);
      if (n > bn) { bn = n; best = [r, c, r2, c2]; }
    }
    return best;
  }
  function hasMove() { return !!findMove(); }
  function swap(r, c, r2, c2) { var t = G.grid[r][c]; G.grid[r][c] = G.grid[r2][c2]; G.grid[r2][c2] = t; }
  function tap(r, c) {
    if (busy) return; hint = null;
    if (!sel) { sel = { r: r, c: c }; return draw(); }
    var a = sel; sel = null;
    if (Math.abs(a.r - r) + Math.abs(a.c - c) !== 1) { sel = (a.r === r && a.c === c) ? null : { r: r, c: c }; return draw(); }
    trySwap(a.r, a.c, r, c);
  }
  async function trySwap(r, c, r2, c2) {
    if (busy || !G) return; busy = true; hint = null; var game = G;
    swap(r, c, r2, c2); draw(); await sleep(180);
    if (!findMatches().runs.length) { swap(r, c, r2, c2); draw(); await sleep(180); busy = false; return; }
    if (G.level) G.moves--;
    var chain = 0, at = [r2, c2];
    while (G === game) {
      var m = findMatches(); if (!m.runs.length) break; chain++;
      // what each match leaves behind: 5+ in a line a star, an L, T or cross a blast, 4 in a line a lightning tile
      var made = [], usedCell = {};
      function leave(kind, t, cell) { var k = cell.join(); if (usedCell[k]) return; usedCell[k] = 1; made.push({ sp: kind, t: t, cell: cell }); }
      m.runs.forEach(function (run) {
        G.matches++; G.seen[run.t] = 1; showWord(run.t, run.cells.length);
        if (run.sq) return;
        var here = run.cells.filter(function (x) { return x[0] === at[0] && x[1] === at[1]; })[0];
        var corner = run.cells.filter(function (x) { return m.lines[x.join()] > 1; })[0];
        if (run.cells.length >= 5) leave('s', run.t, here || run.cells[Math.floor(run.cells.length / 2)]);
        else if (corner) leave('b', run.t, corner);
        else if (run.cells.length === 4) leave('l', run.t, here || run.cells[1]);
      });
      // special tiles caught in a match go off, and can set each other off
      var fired = {}, again = true;
      while (again) {
        again = false;
        Object.keys(m.hit).forEach(function (k) {
          var p = k.split(','), r = +p[0], c = +p[1], t = G.grid[r][c]; if (!t || !t.sp || fired[k]) return; fired[k] = 1; again = true;
          if (t.sp === 'l') for (var i = 0; i < N; i++) { m.hit[r + ',' + i] = 1; m.hit[i + ',' + c] = 1; }
          else if (t.sp === 'b') { for (var a = r - 1; a <= r + 1; a++) for (var b = c - 1; b <= c + 1; b++) if (a >= 0 && b >= 0 && a < N && b < N) m.hit[a + ',' + b] = 1; }
          else if (t.sp === 's') { for (var a2 = 0; a2 < N; a2++) for (var b2 = 0; b2 < N; b2++) if (G.grid[a2][b2] && G.grid[a2][b2].t === t.t) m.hit[a2 + ',' + b2] = 1; }
        });
      }
      Object.keys(m.hit).forEach(function (k) {
        var p = k.split(','), t = G.grid[+p[0]][+p[1]]; if (!t) return;
        G.score += 10 * chain; G.goals.forEach(function (g) { if (g.t === t.t) g.got++; }); G.grid[+p[0]][+p[1]] = null;
      });
      made.forEach(function (x) { var s = mk(x.t); s.sp = x.sp; G.grid[x.cell[0]][x.cell[1]] = s; });
      draw(); hud(); await sleep(240); if (G !== game) return;
      for (var c0 = 0; c0 < N; c0++) { // gravity and refill
        var col = []; for (var r0 = N - 1; r0 >= 0; r0--) if (G.grid[r0][c0]) col.push(G.grid[r0][c0]);
        var miss = N - col.length;
        for (var i = 0; i < miss; i++) { var nt = mk(G.kinds[rnd(6)]); nt.from = -1 - i; col.push(nt); }
        for (var r1 = N - 1, j = 0; r1 >= 0; r1--, j++) G.grid[r1][c0] = col[j];
      }
      draw(); await sleep(300); at = [-1, -1];
    }
    if (G !== game) return;
    if (!hasMove()) { $('#mm-word').textContent = 'No moves left: shuffling the tiles.'; await sleep(500); $('#mm-board').innerHTML = ''; fill(); draw(); }
    hud(); busy = false;
    if (G.level) {
      if (G.goals.every(function (g) { return g.got >= g.need; })) return win();
      if (G.moves <= 0) return over(false);
    } else { if (G.score > st.hi) { st.hi = G.score; save(); } if (G.matches && G.matches % 12 === 0) quiz(function () { }); }
  }
  // ---------- end of level, quiz ----------
  function modal(html) { var m = $('#mm-modal'); m.innerHTML = '<div class="mm-box">' + html + '</div>'; m.hidden = false; return m; }
  function quiz(then) {
    var seen = Object.keys(G.seen).map(Number); if (!seen.length) return then();
    var t = seen[rnd(seen.length)], opts = [t];
    while (opts.length < 4) { var o = rnd(TILES.length); if (opts.indexOf(o) < 0) opts.push(o); }
    opts.sort(function () { return Math.random() - .5; });
    var m = modal('<p class="mm-q">What does this word mean?</p><h2 class="' + cls() + '">' + esc(word(t)) + '</h2><div class="mm-qo">' + opts.map(function (o) { return '<button class="mm-btn" data-o="' + o + '">' + TILES[o][0] + ' ' + TILES[o][3] + '</button>'; }).join('') + '</div><p id="mm-qr"></p><button class="mm-btn" id="mm-qs">Skip</button>');
    var done = false;
    m.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () {
      if (done) return; done = true; var ok = +b.dataset.o === t; b.classList.add(ok ? 'right' : 'wrong');
      m.querySelectorAll('[data-o]').forEach(function (x) { if (+x.dataset.o === t) x.classList.add('right'); });
      if (ok) G.score += 100;
      $('#mm-qr').innerHTML = (ok ? '<b>Right! +100 points.</b> ' : '<b>Not quite.</b> ') + '<span class="' + cls() + '">' + esc(word(t)) + '</span> means “' + TILES[t][3] + '”.'; $('#mm-qs').textContent = 'Continue'; $('#mm-qs').classList.add('pri'); if (G) hud();
    }; });
    $('#mm-qs').onclick = function () { m.hidden = true; then(); };
  }
  function win() {
    G.score += G.moves * 20;
    if (G.level >= st.best) { st.best = G.level + 1; save(); }
    quiz(function () { over(true); });
  }
  function over(won) {
    var lv = G.level, last = lv >= LEVELS;
    var words = G.kinds.map(function (t) { return '<span>' + TILES[t][0] + ' <b class="' + cls() + '">' + esc(word(t)) + '</b> ' + TILES[t][3] + '</span>'; }).join('');
    var m = modal('<h2>' + (won ? (last ? 'You finished every level!' : 'Level ' + lv + ' complete') : 'Out of moves') + '</h2><p>' + G.score + ' points</p><div class="mm-words">' + words + '</div><div class="mm-btns">' +
      (won && !last ? '<button class="mm-btn pri" data-n="' + (lv + 1) + '">Next level</button>' : '') + (!won ? '<button class="mm-btn pri" data-n="' + lv + '">Try again</button>' : '') + (won && last ? '<button class="mm-btn pri" data-n="0">Endless practice</button>' : '') + '<button class="mm-btn" data-n="-1">Menu</button></div>');
    m.querySelectorAll('[data-n]').forEach(function (b) { b.onclick = function () { busy = false; +b.dataset.n < 0 ? menu() : start(+b.dataset.n); }; });
  }
  W.__mm = { state: function () { return G; }, st: st };
  menu();
})(window, document);
