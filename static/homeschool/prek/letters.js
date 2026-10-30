/* Pre-reading games (Teddy Rook Book), ages 3 to 5, played with a grown-up.
   Same kid mode as Phonics Practice (phonics.css): one task at a time, big tap targets, no timers, gentle feedback,
   no failure sounds. The voice (browser speechSynthesis) says whole words, letter NAMES and sentences only, never
   single letter sounds. Progress per child in localStorage "trb-prek-v1". */
(function (W, D) {
  'use strict';
  var root = D.getElementById('pkl');
  if (!root) return;
  var KEY = 'trb-prek-v1', ROUND = 6;
  var NEXT = root.dataset.next || '../../actual-reading/phonics-practice/letters/';

  // ---------------- store ----------------
  var st = { v: 1, kids: [{ id: 'k1', name: 'Player 1' }], cur: 'k1', voice: true, p: {} };
  try {
    var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null');
    if (sv && sv.kids && sv.kids.length) { st.kids = sv.kids; st.cur = sv.cur; st.voice = sv.voice !== false; st.p = sv.p || {}; }
  } catch (e) { }
  if (!st.kids.some(function (k) { return k.id === st.cur; })) st.cur = st.kids[0].id;
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function kid() { for (var i = 0; i < st.kids.length; i++) if (st.kids[i].id === st.cur) return st.kids[i]; return st.kids[0]; }
  function prog() { return st.p[st.cur] || (st.p[st.cur] = {}); }

  // ---------------- helpers ----------------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var PRAISE = ['Yes!', 'You did it!', 'Good listening!', 'Nice work!', 'Well done!', 'Super!', 'That’s it!'];
  function praise() { return pick(PRAISE); }

  // ---------------- word pictures ----------------
  var E = {
    cat: '🐱', hat: '🎩', bat: '🦇', rat: '🐀', frog: '🐸', dog: '🐶', log: '🪵', bee: '🐝', tree: '🌳', key: '🔑', snake: '🐍', cake: '🎂',
    moon: '🌙', spoon: '🥄', bear: '🐻', pear: '🍐', chair: '🪑', car: '🚗', star: '⭐', mouse: '🐭', house: '🏠', boat: '⛵', goat: '🐐', coat: '🧥',
    sock: '🧦', clock: '🕰️', lock: '🔒', fox: '🦊', box: '📦', hen: '🐔', ten: '🔟', pen: '🖊️', shell: '🐚', bell: '🔔', tie: '👔', pie: '🥧',
    shoe: '👟', two: '2️⃣', truck: '🚚', duck: '🦆', rain: '🌧️', train: '🚆', snail: '🐌', whale: '🐋', phone: '📱', bone: '🦴',
    sun: '☀️', fish: '🐟', boot: '👢', bus: '🚌', ball: '⚽', banana: '🍌', bed: '🛏️', book: '📖', milk: '🥛', map: '🗺️', mushroom: '🍄',
    monkey: '🐒', soap: '🧼', sandwich: '🥪', seal: '🦭', door: '🚪', donut: '🍩', deer: '🦌', fire: '🔥', feather: '🪶', pig: '🐷', pizza: '🍕',
    penguin: '🐧', pumpkin: '🎃', popcorn: '🍿', panda: '🐼', turtle: '🐢', tiger: '🐯', tent: '⛺', tooth: '🦷', tomato: '🍅', teddy: '🧸',
    horse: '🐴', heart: '❤️', honey: '🍯', hammer: '🔨', hippo: '🦛', lion: '🦁', leaf: '🍃', lemon: '🍋', ladder: '🪜', rabbit: '🐰',
    rainbow: '🌈', ring: '💍', rocket: '🚀', robot: '🤖', rose: '🌹', watermelon: '🍉', web: '🕸️', wolf: '🐺', watch: '⌚', gift: '🎁',
    guitar: '🎸', gorilla: '🦍', cow: '🐮', kite: '🪁', kangaroo: '🦘', cookie: '🍪', carrot: '🥕', corn: '🌽', apple: '🍎', pencil: '✏️',
    cupcake: '🧁', rocket2: '🚀', zebra: '🦓', tractor: '🚜', butterfly: '🦋', elephant: '🐘', dinosaur: '🦕', octopus: '🐙',
    bicycle: '🚲', ladybug: '🐞', pineapple: '🍍', umbrella: '☂️', broccoli: '🥦', hamburger: '🍔', telephone: '☎️', unicorn: '🦄',
    computer: '💻', helicopter: '🚁', avocado: '🥑', television: '📺', bird: '🐦', flower: '🌸', bread: '🍞', egg: '🥚', cheese: '🧀'
  };
  function picBtn(w, cls, extra) {
    return '<button type="button" class="pk-pic ' + (cls || '') + '" data-v="' + esc(w) + '"' + (extra || '') + '><span class="e" aria-hidden="true">' + E[w] + '</span><small>' + esc(w === 'teddy' ? 'teddy bear' : w) + '</small></button>';
  }
  function say(w) { return w === 'teddy' ? 'teddy bear' : w; }

  // ---------------- voice: whole words, letter names and sentences only ----------------
  var canSpeak = 'speechSynthesis' in W && typeof W.SpeechSynthesisUtterance === 'function', voice = null;
  function pickVoice() {
    try {
      var vs = W.speechSynthesis.getVoices() || [];
      voice = vs.filter(function (v) { return /^en[-_]US/i.test(v.lang) && v.localService; })[0] || vs.filter(function (v) { return /^en[-_]US/i.test(v.lang); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
    } catch (e) { }
  }
  if (canSpeak) { pickVoice(); try { W.speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { } }
  function speak(text) {
    if (!st.voice || !canSpeak || !text) return;
    try {
      W.speechSynthesis.cancel();
      var u = new W.SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US'; if (voice) u.voice = voice; u.rate = 0.8;
      W.speechSynthesis.speak(u);
    } catch (e) { }
  }
  // letter names spelled out, so the voice says the name ("bee"), never a sound
  var NAME = { a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'ell', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee' };
  var ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
  var LOOKALIKE = { i: 'l', l: 'i' }; // capital I and small l look alike in many fonts: never side by side

  // ---------------- game data ----------------
  var RHYMES = [['cat', 'hat', 'bat', 'rat'], ['frog', 'dog', 'log'], ['bee', 'tree', 'key'], ['snake', 'cake'], ['moon', 'spoon'], ['bear', 'pear', 'chair'],
    ['car', 'star'], ['mouse', 'house'], ['boat', 'goat', 'coat'], ['sock', 'clock', 'lock'], ['fox', 'box'], ['hen', 'ten', 'pen'], ['shell', 'bell'],
    ['tie', 'pie'], ['shoe', 'two'], ['truck', 'duck'], ['rain', 'train'], ['snail', 'whale'], ['phone', 'bone']];
  var CLAPS = {
    1: ['cat', 'sun', 'dog', 'fish', 'tree', 'cake', 'frog', 'star', 'duck', 'bee', 'moon', 'house', 'sock', 'hat', 'boat', 'pig', 'bread'],
    2: ['ap·ple', 'mon·key', 'rab·bit', 'pen·cil', 'rain·bow', 'ti·ger', 'pump·kin', 'car·rot', 'tur·tle', 'piz·za', 'ro·bot', 'cook·ie', 'trac·tor', 'ze·bra', 'rock·et', 'pan·da', 'pen·guin', 'lem·on', 'cup·cake'],
    3: ['but·ter·fly', 'ba·na·na', 'el·e·phant', 'di·no·saur', 'kan·ga·roo', 'oc·to·pus', 'to·ma·to', 'bi·cy·cle', 'la·dy·bug', 'pine·ap·ple', 'um·brel·la', 'broc·co·li', 'ham·bur·ger', 'tel·e·phone', 'u·ni·corn', 'go·ril·la', 'com·pu·ter'],
    4: ['wa·ter·mel·on', 'hel·i·cop·ter', 'av·o·ca·do', 'tel·e·vi·sion']
  };
  // grouped by the first sound in the spoken word (cat, key and cookie share one); no blends at the start
  var STARTS = [
    ['bus', 'bee', 'ball', 'banana', 'bear', 'bed', 'bell', 'book', 'boat'],
    ['moon', 'mouse', 'monkey', 'milk', 'map', 'mushroom'],
    ['sun', 'sock', 'soap', 'sandwich', 'seal'],
    ['dog', 'duck', 'door', 'donut', 'deer'],
    ['fish', 'fox', 'fire', 'feather'],
    ['pig', 'pear', 'pizza', 'penguin', 'pumpkin', 'pie', 'popcorn', 'panda'],
    ['turtle', 'tiger', 'tent', 'tooth', 'tomato', 'teddy'],
    ['hat', 'house', 'horse', 'hen', 'heart', 'honey', 'hammer', 'hippo'],
    ['lion', 'leaf', 'lemon', 'ladder', 'lock'],
    ['rabbit', 'rainbow', 'ring', 'rocket', 'robot', 'rose'],
    ['watermelon', 'web', 'wolf', 'watch'],
    ['goat', 'gift', 'guitar', 'gorilla'],
    ['cat', 'cake', 'car', 'cow', 'key', 'kite', 'kangaroo', 'cookie', 'carrot', 'corn']
  ];
  var HEAR = [
    ['duck', 'The little duck can swim.'], ['dog', 'My dog likes to run.'], ['cat', 'The cat is asleep on the bed.'], ['fish', 'A fish swims in the pond.'],
    ['bee', 'A bee sits on a flower.'], ['frog', 'The green frog can jump.'], ['moon', 'We see the moon at night.'], ['sun', 'The sun is warm today.'],
    ['apple', 'I ate a red apple.'], ['cake', 'We made a cake for Grandma.'], ['boat', 'The boat floats on the lake.'], ['bus', 'We ride the bus to the park.'],
    ['tree', 'A bird sits in the tree.'], ['star', 'I see a star in the sky.'], ['house', 'Our house has a red door.'], ['sock', 'I lost my blue sock.'],
    ['hat', 'Grandpa has a big hat.'], ['rabbit', 'The rabbit hops in the grass.'], ['cookie', 'May I have a cookie, please?'], ['turtle', 'The turtle walks very slowly.'],
    ['pig', 'The pig rolls in the mud.'], ['car', 'The car is in the garage.'], ['truck', 'A big truck went by.'], ['ball', 'Please roll the ball to me.'], ['cow', 'The cow says moo.']
  ];
  var HEAR_PICS = ['duck', 'dog', 'cat', 'fish', 'bee', 'frog', 'moon', 'sun', 'apple', 'cake', 'boat', 'bus', 'tree', 'star', 'house', 'sock', 'hat', 'rabbit', 'cookie', 'turtle', 'pig', 'car', 'truck', 'ball', 'cow', 'bird', 'flower', 'egg', 'cheese', 'banana'];
  var COUNT = [
    'I jump.', 'Birds sing.', 'We clap.', 'Dogs bark.', 'Fish swim.',
    'I see you.', 'We can run.', 'The sun shines.', 'I like cake.', 'Ducks say quack.',
    'The dog can jump.', 'I see a bird.', 'We read a book.', 'My hat is red.', 'The frog is green.',
    'We go to the park.', 'I like to sing songs.', 'The bus is very big.', 'Look at the tall tree.', 'The cat sat on me.'
  ];
  function words(s) { return s.replace(/[.,?!]/g, '').split(/\s+/); }

  // ---------------- page wiring ----------------
  var stage = D.getElementById('pp-stage'), actsEl = D.getElementById('pp-acts'), kidEl = D.getElementById('pp-kid');
  var ACTS = {
    match: ['🔠', 'Big and small'], find: ['🔍', 'Find the letter'], rhyme: ['🎶', 'Rhyme time'],
    claps: ['👏', 'Clap the parts'], begin: ['🖼️', 'Same start'], listen: ['👂', 'Listen for words']
  };
  var ORDER = ['match', 'find', 'rhyme', 'claps', 'begin', 'listen'];
  var touched = false;

  var sel = D.getElementById('pp-child');
  function fillKids() { sel.innerHTML = st.kids.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === st.cur ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join(''); }
  fillKids();
  sel.addEventListener('change', function () { st.cur = sel.value; save(); paintActs(); if (cur.act) startAct(cur.act); });
  var addF = D.getElementById('pp-addf'), addB = D.getElementById('pp-add');
  function addKid(name) {
    name = String(name || '').trim().slice(0, 24); if (!name) return false;
    var id = 'k' + Date.now().toString(36);
    if (st.kids.length === 1 && st.kids[0].name === 'Player 1' && !Object.keys(st.p[st.kids[0].id] || {}).length) st.kids = [];
    st.kids.push({ id: id, name: name }); st.cur = id; save(); return true;
  }
  addB.addEventListener('click', function () { addF.hidden = !addF.hidden; if (!addF.hidden) D.getElementById('pp-name').focus(); });
  D.getElementById('pp-addx').addEventListener('click', function () { addF.hidden = true; addB.focus(); });
  addF.addEventListener('submit', function (e) {
    e.preventDefault(); var inp = D.getElementById('pp-name');
    if (addKid(inp.value)) { inp.value = ''; addF.hidden = true; fillKids(); paintActs(); startAct(cur.act || ORDER[0]); }
  });
  var sndB = D.getElementById('pp-sound');
  function paintSound() { sndB.setAttribute('aria-pressed', st.voice ? 'true' : 'false'); sndB.textContent = st.voice ? '🔊 Voice on' : '🔇 Voice off'; }
  if (!canSpeak) { st.voice = false; sndB.disabled = true; sndB.title = 'This browser has no speech voice.'; }
  paintSound();
  sndB.addEventListener('click', function () { st.voice = !st.voice; if (!st.voice && canSpeak) try { W.speechSynthesis.cancel(); } catch (e) { } save(); paintSound(); });
  var fullB = D.getElementById('pp-full');
  function setFull(on) {
    kidEl.classList.toggle('pp-isfull', on); D.documentElement.classList.toggle('pp-noscroll', on);
    fullB.setAttribute('aria-pressed', on ? 'true' : 'false'); fullB.textContent = on ? '✕ Close big screen' : '⛶ Big screen';
  }
  fullB.addEventListener('click', function () { setFull(!kidEl.classList.contains('pp-isfull')); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && kidEl.classList.contains('pp-isfull')) { setFull(false); fullB.focus(); } });

  function paintActs() {
    var p = prog();
    actsEl.innerHTML = ORDER.map(function (a) {
      return '<button type="button" class="pp-act' + (cur.act === a ? ' on' : '') + '" data-act="' + a + '" aria-pressed="' + (cur.act === a) + '">' +
        '<span class="pp-act-ic" aria-hidden="true">' + ACTS[a][0] + '</span><span class="pp-act-t">' + ACTS[a][1] + '</span>' +
        (p[a] ? '<span class="pp-act-ok" aria-label="done">✓</span>' : '') + '</button>';
    }).join('');
  }
  actsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) { touched = true; startAct(b.dataset.act); } });

  var cur = { act: null, items: [], i: 0 };
  function frame(title, body) {
    var dots = '', n = cur.items.length;
    if (n > 1) { for (var k = 0; k < n; k++) dots += '<i class="' + (k < cur.i ? 'd' : k === cur.i ? 'c' : '') + '"></i>'; dots = '<span class="pp-dots" aria-label="' + (cur.i + 1) + ' of ' + n + '">' + dots + '</span>'; }
    stage.innerHTML = '<div class="pp-top"><h2>' + esc(title) + '</h2>' + dots + '</div><div class="pp-task">' + body + '</div>' +
      '<p class="pp-fb" id="pp-fb" aria-live="polite"></p><div class="pp-ctl" id="pp-ctl"></div>';
    if (touched) { var f = stage.querySelector('[data-focus]') || stage.querySelector('.pp-task button'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  }
  function fb(html, cls) { var f = D.getElementById('pp-fb'); if (f) { f.className = 'pp-fb ' + (cls || ''); f.innerHTML = html; } }
  function ctl(html) { var c = D.getElementById('pp-ctl'); c.innerHTML = html; return c; }
  function nextBtn(label, fn) {
    var c = ctl('<button type="button" class="pp-next" id="pp-next">' + (label || 'Next →') + '</button>');
    var b = c.querySelector('button'); b.addEventListener('click', function () { touched = true; fn(); });
    try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
  }
  function advance() { cur.i++; if (cur.i >= cur.items.length) finish(); else RUN[cur.act](); }
  function allDone() { var p = prog(); return ORDER.every(function (a) { return p[a] > 0; }); }
  function finish() {
    var p = prog(); p[cur.act] = (p[cur.act] || 0) + 1; save(); paintActs();
    var all = allDone(), n = Math.min(p[cur.act], 3), stars = '';
    for (var k = 0; k < 3; k++) stars += '<span class="' + (k < n ? 'on' : '') + '">★</span>';
    var nextA = ORDER[(ORDER.indexOf(cur.act) + 1) % ORDER.length];
    frame(ACTS[cur.act][1], '<div class="pp-done"><p class="pp-stars" aria-label="' + n + ' of 3 stars">' + stars + '</p><p class="pp-done-t">Well done, ' + esc(kid().name) + '!</p>' +
      (all ? '<p>You played every game. 🎉 Ready for letters and sounds?</p>' : '<p>You finished “' + esc(ACTS[cur.act][1]) + '.”</p>') + '</div>');
    var c = ctl('<button type="button" class="pp-next ghost" id="pp-again">↻ Again</button>' +
      (all ? '<a class="pp-next" href="' + esc(NEXT) + '">Phonics Practice, Step 1 →</a>' : '<button type="button" class="pp-next" id="pp-on">' + ACTS[nextA][0] + ' ' + esc(ACTS[nextA][1]) + ' →</button>'));
    c.querySelector('#pp-again').addEventListener('click', function () { touched = true; startAct(cur.act); });
    var on = c.querySelector('#pp-on'); if (on) on.addEventListener('click', function () { touched = true; startAct(nextA); });
    var f = c.querySelector('.pp-next:last-child'); if (touched && f) f.focus({ preventScroll: true });
    if (all) speak('Well done! You played every game.');
  }
  function startAct(a) {
    if (!RUN[a]) a = ORDER[0];
    cur = { act: a, items: ITEMS[a](), i: 0 };
    paintActs(); RUN[a]();
  }
  // a right answer → onRight; a wrong one fades, with a gentle word and no penalty
  function wireChoices(selr, right, onRight, tryMsg) {
    stage.querySelectorAll(selr).forEach(function (b) {
      b.addEventListener('click', function () {
        touched = true;
        if (b.dataset.v === right) {
          stage.querySelectorAll(selr).forEach(function (x) { x.disabled = true; });
          b.classList.add('right'); b.disabled = false; b.setAttribute('aria-disabled', 'true');
          onRight(b);
        } else { b.classList.add('wrong'); b.disabled = true; fb(tryMsg ? tryMsg(b.dataset.v) : 'Not quite. Try another one.', 'try'); }
      });
    });
  }
  function sayBtn(label) { return '<button type="button" class="pp-say-b" id="pp-sayk" aria-label="' + esc(label || 'Say it again') + '">🔊</button>'; }

  // ---------------- items ----------------
  function letterOpts(right, n) {
    var o = [right];
    while (o.length < n) { var g = pick(ABC); if (o.indexOf(g) < 0 && !o.some(function (x) { return LOOKALIKE[x] === g; })) o.push(g); }
    return shuffle(o);
  }
  var ITEMS = {
    match: function () { return shuffle(ABC).slice(0, ROUND).map(function (g, i) { return { g: g, up: i % 2 === 0 }; }); },
    find: function () { return shuffle(ABC.filter(function (g) { return g !== 'i' && g !== 'l'; })).slice(0, ROUND).map(function (g, i) { return { g: g, up: i % 2 === 0, n: 2 + Math.floor(Math.random() * 2) }; }); },
    rhyme: function () { return shuffle(RHYMES).slice(0, ROUND); },
    claps: function () {
      var o = [], counts = shuffle([1, 2, 3, 1, 2, 3, 4].slice(0, 6 + (Math.random() < .5 ? 1 : 0))).slice(0, ROUND);
      var used = {};
      counts.forEach(function (n) { var w; do { w = pick(CLAPS[n]); } while (used[w]); used[w] = 1; o.push({ parts: w.split('·'), n: n }); });
      return o;
    },
    begin: function () { return [0, 1, 2, 3, 4, 5].map(function (i) { return { mode: i % 2 ? 'same' : 'pick', same: Math.random() < .5 }; }); },
    listen: function () {
      var h = shuffle(HEAR), c = shuffle(COUNT), o = [];
      for (var i = 0; i < ROUND; i++) o.push(i % 2 ? { mode: 'count', s: c[i] } : { mode: 'hear', w: h[i][0], s: h[i][1] });
      return o;
    }
  };

  // ---------------- games ----------------
  var RUN = {};
  RUN.match = function () {
    var it = cur.items[cur.i], g = it.g, up = it.up, opts = letterOpts(g, 3);
    var show = up ? g.toUpperCase() : g, f = function (x) { return up ? x : x.toUpperCase(); };
    frame(ACTS.match[1], '<p class="pp-q">' + (up ? 'Here is a big letter. Find its small letter.' : 'Here is a small letter. Find its big letter.') + ' ' + sayBtn('Hear the letter name') + '</p>' +
      '<div class="pp-bigg pp-one">' + esc(show) + '</div>' +
      '<div class="pp-opts">' + opts.map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-v="' + o + '">' + esc(f(o)) + '</button>'; }).join('') + '</div>');
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(NAME[g]); });
    wireChoices('.pp-opt', g, function () { fb(praise() + ' ' + esc(g.toUpperCase()) + ' and ' + esc(g) + ' are both the letter ' + esc(g.toUpperCase()) + '.', 'ok'); speak('Yes! The letter ' + NAME[g] + '.'); nextBtn(null, advance); });
  };

  RUN.find = function () {
    var it = cur.items[cur.i], g = it.g, f = function (x) { return it.up ? x.toUpperCase() : x; };
    var cells = [], pool = ABC.filter(function (x) { return x !== g && x !== 'i' && x !== 'l'; });
    for (var k = 0; k < it.n; k++) cells.push(g);
    var others = shuffle(pool).slice(0, 3);
    while (cells.length < 8) cells.push(others[cells.length % 3]);
    cells = shuffle(cells);
    frame(ACTS.find[1], '<p class="pp-q">Find every <b class="pp-hk" style="font-size:1.6em">' + esc(f(g)) + '</b> ' + sayBtn('Hear the letter name') + '</p>' +
      '<div class="pk-grid">' + cells.map(function (c, i) { return '<button type="button" class="pp-opt" data-v="' + c + '" data-i="' + i + '" aria-label="' + esc(f(c)) + '">' + esc(f(c)) + '</button>'; }).join('') + '</div>' +
      '<p class="hs-small pp-count" id="pk-left" aria-live="polite">' + it.n + ' to find</p>');
    D.getElementById('pp-sayk').addEventListener('click', function () { speak('Find every letter ' + NAME[g]); });
    speak('Find every letter ' + NAME[g]);
    var left = it.n;
    stage.querySelectorAll('.pk-grid .pp-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        touched = true;
        if (b.dataset.v === g) {
          if (b.classList.contains('found')) return;
          b.classList.add('found'); b.setAttribute('aria-pressed', 'true'); left--;
          D.getElementById('pk-left').textContent = left ? left + ' more to find' : 'All found!';
          if (!left) { stage.querySelectorAll('.pk-grid .pp-opt').forEach(function (x) { if (!x.classList.contains('found')) x.disabled = true; }); fb(praise() + ' You found every ' + esc(f(g)) + '.', 'ok'); nextBtn(null, advance); }
          else fb('Yes! Keep looking.', 'ok');
        } else { b.classList.add('wrong'); b.disabled = true; fb('That one is ' + esc(f(b.dataset.v)) + '. Keep looking.', 'try'); }
      });
    });
  };

  RUN.rhyme = function () {
    var set = shuffle(cur.items[cur.i]), key = set[0], right = set[1];
    var others = shuffle(RHYMES.filter(function (s) { return s.indexOf(key) < 0; })).slice(0, 2).map(function (s) { return pick(s); });
    var opts = shuffle([right].concat(others));
    frame(ACTS.rhyme[1], '<div class="pk-pics">' + picBtn(key, 'key', ' data-key="1" aria-label="' + esc(key) + ': hear it again"') + '</div>' +
      '<p class="pp-q">Which one rhymes with <b>' + esc(key) + '</b>? ' + sayBtn('Say all the words') + '</p>' +
      '<div class="pk-pics">' + opts.map(function (w) { return picBtn(w, 'opt'); }).join('') + '</div>');
    function all() { speak(key + '. ' + opts.join('. ') + '. Which one rhymes with ' + key + '?'); }
    D.getElementById('pp-sayk').addEventListener('click', all);
    stage.querySelector('[data-key]').addEventListener('click', function () { touched = true; speak(key); });
    all();
    wireChoices('.pk-pic.opt', right, function () { fb(praise() + ' <b>' + esc(key) + '</b> and <b>' + esc(right) + '</b> rhyme.', 'ok'); speak(key + ', ' + right + '. They rhyme!'); nextBtn(null, advance); },
      function (w) { speak(key + ', ' + w + '.'); return 'Say them both: ' + esc(key) + ', ' + esc(w) + '. Try another one.'; });
  };

  RUN.claps = function () {
    var it = cur.items[cur.i], w = it.parts.join('');
    frame(ACTS.claps[1], '<div class="pk-pics">' + picBtn(w, 'key', ' data-key="1" aria-label="' + esc(w) + ': hear it again"') + '</div>' +
      '<p class="pp-q">Say <b>' + esc(w) + '</b> and clap for each part. How many claps? ' + sayBtn('Hear the word') + '</p>' +
      '<div class="pk-claps">' + [1, 2, 3, 4].map(function (n) { return '<button type="button" class="pp-opt" data-v="' + n + '" aria-label="' + n + ' clap' + (n > 1 ? 's' : '') + '">' + n + '<span aria-hidden="true">' + new Array(n + 1).join('👏') + '</span></button>'; }).join('') + '</div>');
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(w); });
    stage.querySelector('[data-key]').addEventListener('click', function () { touched = true; speak(w); });
    speak(w);
    wireChoices('.pk-claps .pp-opt', String(it.n), function () {
      fb(praise() + ' <span class="pk-sent" style="display:inline-flex;font-size:1.2em">' + it.parts.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('') + '</span> ' + (it.n === 1 ? 'is one clap.' : 'has ' + it.n + ' claps.'), 'ok');
      speak(w); nextBtn(null, advance);
    }, function () { speak(w); return 'Say it slowly and clap again.'; });
  };

  RUN.begin = function () {
    var it = cur.items[cur.i], gs = shuffle(STARTS), g = gs[0], tw = shuffle(g);
    var key = tw[0];
    if (it.mode === 'pick') {
      var right = tw[1], others = [pick(gs[1]), pick(gs[2])], opts = shuffle([right].concat(others));
      frame(ACTS.begin[1], '<div class="pk-pics">' + picBtn(key, 'key', ' data-key="1" aria-label="' + esc(say(key)) + ': hear it again"') + '</div>' +
        '<p class="pp-q">Which one starts like <b>' + esc(say(key)) + '</b>? ' + sayBtn('Say all the words') + '</p>' +
        '<div class="pk-pics">' + opts.map(function (w) { return picBtn(w, 'opt'); }).join('') + '</div>');
      var all = function () { speak(say(key) + '. ' + opts.map(say).join('. ') + '. Which one starts like ' + say(key) + '?'); };
      D.getElementById('pp-sayk').addEventListener('click', all);
      stage.querySelector('[data-key]').addEventListener('click', function () { touched = true; speak(say(key)); });
      all();
      wireChoices('.pk-pic.opt', right, function () { fb(praise() + ' <b>' + esc(say(key)) + '</b> and <b>' + esc(say(right)) + '</b> start the same.', 'ok'); speak(say(key) + ', ' + say(right) + '.'); nextBtn(null, advance); },
        function (w) { speak(say(key) + ', ' + say(w) + '.'); return 'Say them both: ' + esc(say(key)) + ', ' + esc(say(w)) + '. Try another one.'; });
    } else {
      var b = it.same ? tw[1] : pick(gs[1]);
      frame(ACTS.begin[1], '<div class="pk-pics">' + picBtn(key, 'key', ' data-w="' + esc(key) + '" aria-label="' + esc(say(key)) + ': hear it"') + '<span class="pk-vs" aria-hidden="true">+</span>' + picBtn(b, 'key', ' data-w="' + esc(b) + '" aria-label="' + esc(say(b)) + ': hear it"') + '</div>' +
        '<p class="pp-q">Do <b>' + esc(say(key)) + '</b> and <b>' + esc(say(b)) + '</b> start the same? ' + sayBtn('Say both words') + '</p>' +
        '<div class="pk-big-btns"><button type="button" class="pp-opt" data-v="same"><span aria-hidden="true">👍</span> Same</button><button type="button" class="pp-opt" data-v="diff"><span aria-hidden="true">✋</span> Different</button></div>');
      var both = function () { speak(say(key) + '. ' + say(b) + '.'); };
      D.getElementById('pp-sayk').addEventListener('click', both);
      stage.querySelectorAll('[data-w]').forEach(function (x) { x.addEventListener('click', function () { touched = true; speak(say(x.dataset.w)); }); });
      both();
      wireChoices('.pk-big-btns .pp-opt', it.same ? 'same' : 'diff', function () {
        fb(praise() + ' <b>' + esc(say(key)) + '</b> and <b>' + esc(say(b)) + '</b> ' + (it.same ? 'start the same.' : 'start differently.'), 'ok'); both(); nextBtn(null, advance);
      }, function () { both(); return 'Listen again: ' + esc(say(key)) + ', ' + esc(say(b)) + '.'; });
    }
  };

  RUN.listen = function () {
    var it = cur.items[cur.i];
    var gbox = '<p class="pk-gu-note"><b>Grown-up, read this:</b> “' + esc(it.s) + '” ' + sayBtn('Hear the sentence') + '</p>';
    if (it.mode === 'hear') {
      var inS = words(it.s.toLowerCase());
      var others = shuffle(HEAR_PICS.filter(function (w) { return w !== it.w && inS.indexOf(w) < 0 && inS.indexOf(w + 's') < 0; })).slice(0, 2);
      var opts = shuffle([it.w].concat(others));
      frame(ACTS.listen[1], gbox + '<p class="pp-q">Listen to the sentence. Which picture did you hear?</p><div class="pk-pics">' + opts.map(function (w) { return picBtn(w, 'opt'); }).join('') + '</div>');
      wireChoices('.pk-pic.opt', it.w, function () { fb(praise() + ' You heard <b>' + esc(it.w) + '</b>.', 'ok'); speak(it.s); nextBtn(null, advance); }, function () { speak(it.s); return 'Listen again.'; });
    } else {
      var n = words(it.s).length;
      frame(ACTS.listen[1], gbox + '<p class="pp-q">Listen. How many words? Tap a block on the table for each word, then choose.</p>' +
        '<div class="pk-claps">' + [2, 3, 4, 5].map(function (k) { return '<button type="button" class="pp-opt" data-v="' + k + '" aria-label="' + k + ' words">' + k + '<span class="pk-blocks" aria-hidden="true">' + new Array(k + 1).join('<i></i>') + '</span></button>'; }).join('') + '</div>');
      wireChoices('.pk-claps .pp-opt', String(n), function () {
        fb(praise() + ' <span class="pk-sent" style="display:inline-flex;font-size:1em">' + words(it.s).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</span> ' + n + ' words.', 'ok'); speak(it.s); nextBtn(null, advance);
      }, function () { speak(it.s); return 'Listen again, and count each word.'; });
    }
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(it.s); });
    speak(it.s);
  };

  // start with the first game not yet played
  var p0 = prog(), start = ORDER[0];
  for (var a = 0; a < ORDER.length; a++) if (!p0[ORDER[a]]) { start = ORDER[a]; break; }
  startAct(start);
})(window, document);
