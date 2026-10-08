/* Saltus Teutoburgiensis: a maze chase set in the Teutoburg Forest, AD 9. Latin with optional English help. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('teut'); if (!root) return;

  // ---------- words (Latin kept to simple, standard forms) ----------
  var X = {
    title: ['Teutoburg', ''],
    start: ['Incipe!', 'Start!'], again: ['Iterum!', 'Again!'], next: ['Perge!', 'Continue!'], pause: ['Siste', 'Pause'],
    score: ['Gloria', 'Score'], lives: ['Vitae', 'Lives'], day: ['Dies', 'Day'], words: ['Verba', 'Words learned'],
    goal1: ['Collige nummos!', 'Collect the coins!'], goal2: ['Cave Germanos!', 'Beware the Germans!'], goal3: ['Cape aquilam!', 'Seize the eagle!'],
    caught: ['Captus es!', 'You were caught!'], fleeing: ['Fugiunt!', 'They flee!'], afraid: ['Timent', 'They are afraid'],
    escaped: ['Evasisti!', 'You escaped!'], lost: ['Legiones perierunt.', 'The legions were lost.'], great: ['Optime!', 'Excellent!'], alas: ['Vae!', 'Alas!'],
    rain: ['Pluit.', 'It is raining.'],
    up: ['Sursum', 'Up'], down: ['Deorsum', 'Down'], left: ['Sinistrorsum', 'Left'], right: ['Dextrorsum', 'Right'],
    help: ['Quid agendum?', 'How to play'], history: ['Historia', 'History']
  };
  // Word cards collected while playing. Each is a noun from the story of the battle.
  var VOCAB = [
    ['silva', 'forest'], ['palus', 'bog, swamp'], ['lutum', 'mud'], ['pluvia', 'rain'], ['ventus', 'wind'], ['arbor', 'tree'],
    ['via', 'road, way'], ['agmen', 'column on the march'], ['legio', 'legion'], ['miles', 'soldier'], ['centurio', 'centurion'],
    ['aquila', 'eagle (a legion’s standard)'], ['castra', 'camp'], ['impedimenta', 'baggage train'], ['insidiae', 'ambush'],
    ['hostis', 'enemy'], ['vallum', 'rampart, wall'], ['scutum', 'shield'], ['galea', 'helmet'], ['pilum', 'javelin'],
    ['gladius', 'sword'], ['nummus', 'coin'], ['fuga', 'flight, escape'], ['virtus', 'courage'], ['nox', 'night']
  ];
  var BONUS = [['panis', 'bread', '🍞'], ['posca', 'sour-wine ration', '🏺'], ['galea', 'helmet', '🪖'], ['pilum', 'javelin', '🗡️']];
  var TRIBES = [
    { name: 'Cherusci', color: '#b83a2e', note: 'Arminius’ own tribe. He led the revolt.' },
    { name: 'Bructeri', color: '#c77a9c', note: 'In AD 15 Roman troops found the eagle of the 19th legion among the Bructeri (Tacitus, Annals 1.60).' },
    { name: 'Marsi', color: '#4a93a8', note: 'In AD 16 a Marsian leader revealed where another eagle was buried (Tacitus, Annals 2.25).' },
    { name: 'Chatti', color: '#d08a2c', note: 'In AD 50 the Chatti freed Roman prisoners who had been slaves for forty years since Varus’ defeat (Tacitus, Annals 12.27).' }
  ];
  var DAYS = [
    { la: ['Varus tres legiones ducit.', 'Pluit et ventus flat.'], en: 'September, AD 9. Publius Quinctilius Varus leads the 17th, 18th and 19th legions, with auxiliaries and a long baggage train, from summer camp toward winter quarters. Arminius, a Cheruscan noble who had served in the Roman army, has persuaded the tribes to rise. Heavy rain and wind turn the forest tracks to mud (Cassius Dio 56.20).' },
    { la: ['Milites castra ponunt.', 'Via angusta est.'], en: 'After the first attacks the Romans build a camp, burn many of their wagons and march on in better order, but the forest keeps them from forming up (Cassius Dio 56.21).' },
    { la: ['Germani undique oppugnant.', 'Silva densa est.'], en: 'The final ambush probably came near modern Kalkriese, where the road squeezed between a hill and a great bog. The tribes attacked from behind a turf wall. Archaeologists there have found weapons, armor and hundreds of Roman coins, some stamped VAR.' }
  ];

  var GLOSS = { 'Varus tres legiones ducit.': 'Varus leads three legions.', 'Pluit et ventus flat.': 'It rains and the wind blows.', 'Milites castra ponunt.': 'The soldiers pitch camp.', 'Via angusta est.': 'The road is narrow.', 'Germani undique oppugnant.': 'The Germans attack from all sides.', 'Silva densa est.': 'The forest is dense.' };
  var showEn = true; try { showEn = W.localStorage.getItem('teut-en') !== '0'; } catch (e) { }
  // ---------- game speed (difficulty) ----------
  var GS = 1; try { var gsv = parseFloat(W.localStorage.getItem('teut-speed')); if (gsv >= 0.5 && gsv <= 1.6) GS = gsv; } catch (e) { }
  var LEVELS = [{ max: 0.85, la: 'Facilis', en: 'Easy', cls: 'lv-easy' }, { max: 1.2, la: 'Mediocris', en: 'Medium', cls: 'lv-med' }, { max: 9, la: 'Difficilis', en: 'Hard', cls: 'lv-hard' }];
  function level(v) { for (var i = 0; i < LEVELS.length; i++) if (v < LEVELS[i].max) return LEVELS[i]; return LEVELS[2]; }
  function speedHTML() {
    var L = level(GS);
    return '<div class="tb-speed"><label><span class="la">Celeritas</span>' + (showEn ? ' <span class="en">Speed</span>' : '') +
      ' <b class="tb-lv ' + L.cls + '"><span class="la">' + L.la + '</span>' + (showEn ? ' <span class="en">' + L.en + '</span>' : '') + '</b></label>' +
      '<input type="range" class="tb-spd" min="0.5" max="1.6" step="0.05" value="' + GS + '" aria-label="Game speed">' +
      '<div class="tb-zones"><span>' + LEVELS[0].la + (showEn ? ' · ' + LEVELS[0].en : '') + '</span><span>' + LEVELS[1].la + (showEn ? ' · ' + LEVELS[1].en : '') + '</span><span>' + LEVELS[2].la + (showEn ? ' · ' + LEVELS[2].en : '') + '</span></div>' +
      '<small class="tb-spdv">' + Math.round(GS * 100) + '%</small></div>';
  }
  function setSpeed(v) {
    var before = level(GS); GS = Math.max(0.5, Math.min(1.6, v));
    try { W.localStorage.setItem('teut-speed', String(GS)); } catch (e) { }
    var L = level(GS);
    Array.prototype.forEach.call(root.querySelectorAll('.tb-speed'), function (box) {
      var inp = box.querySelector('input'); if (+inp.value !== GS) inp.value = GS;
      var b = box.querySelector('.tb-lv'); b.className = 'tb-lv ' + L.cls;
      b.innerHTML = '<span class="la">' + L.la + '</span>' + (showEn ? ' <span class="en">' + L.en + '</span>' : '');
      box.querySelector('.tb-spdv').textContent = Math.round(GS * 100) + '%';
      if (before !== L) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    });
    if (before !== L) flash(L.la, L.en, 'lv ' + L.cls);
  }

  function T(pair, tag) { tag = tag || 'span'; return '<' + tag + ' class="la">' + pair[0] + '</' + tag + '>' + (showEn && pair[1] ? '<' + tag + ' class="en">' + pair[1] + '</' + tag + '>' : ''); }

  // ---------- maze ----------
  var MAP = [
    '###################',
    '#........#........#',
    '#o##.###.#.###.##o#',
    '#.................#',
    '#.##.#.#####.#.##.#',
    '#....#...#...#....#',
    '####.### # ###.####',
    '   #.#       #.#   ',
    '####.# ##-## #.####',
    'T   .  #GGG#  .   T',
    '####.# ##### #.####',
    '   #.#       #.#   ',
    '####.# ##### #.####',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o.#.....P.....#.o#',
    '##.#.#.#####.#.#.##',
    '#....#...#...#....#',
    '#.######.#.######.#',
    '#.................#',
    '###################'
  ];
  var CW = MAP[0].length, CH = MAP.length;
  var HOUSE = { x: 9, y: 9 }, DOOR = { x: 9, y: 8 }, EXIT = { x: 9, y: 7 }, START;
  var grid, coins, totalCoins;
  function loadMaze() {
    grid = []; coins = {}; totalCoins = 0;
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      var c = MAP[y][x]; grid.push(c);
      if (c === '.' || c === 'o') { coins[y * CW + x] = c; totalCoins++; }
      if (c === 'P') START = { x: x, y: y };
    }
  }
  function cell(x, y) { if (x < 0 || x >= CW) return 'T'; if (y < 0 || y >= CH) return '#'; return grid[y * CW + x]; }
  function open(x, y, ghost) { var c = cell(x, y); if (c === '#') return false; if (c === '-') return !!ghost; if (c === 'G') return !!ghost; return true; }
  // cells outside the playing field (the empty corners) count as forest
  function isForest(x, y) { var c = cell(x, y); return c === '#' || (c === ' ' && (x < 3 || x > CW - 4) && (y === 7 || y === 11)); }

  // ---------- state ----------
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  var S = null, player, ghosts, mode, modeT, modeIdx, fright, frightT, bonus, msg, learned, anim = 0, state = 'menu', eatCombo = 0;
  var SCHEDULE = [7, 20, 7, 20, 5, 20, 5, 1e9];
  function newGame() { S = { score: 0, lives: 3, day: 1, loops: 0 }; learned = []; startDay(); }
  function startDay() { loadMaze(); resetActors(); bonus = null; S.eaten = 0; state = 'card'; card(dayCard()); }
  function resetActors() {
    player = { x: START.x, y: START.y, dir: 'left', next: 'left', p: 0, mouth: 0 };
    ghosts = TRIBES.map(function (t, i) {
      var g = { t: t, i: i, x: [9, 8, 9, 10][i], y: [7, 9, 9, 9][i], dir: i ? 'up' : 'left', p: 0, state: i ? 'house' : 'out', release: [0, 2, 6, 11][i] / (1 + (S.day - 1) * 0.15) };
      return g;
    });
    mode = 'scatter'; modeIdx = 0; modeT = SCHEDULE[0]; fright = false; frightT = 0; eatCombo = 0; dayTime = 0;
  }
  var dayTime = 0;
  function speedMul() { return 1 + (S.day - 1) * 0.07 + S.loops * 0.1; }

  // ---------- movement ----------
  function wrap(e) { if (e.x < 0) e.x = CW - 1; if (e.x >= CW) e.x = 0; }
  function canGo(e, d, ghost) { var v = DIRS[d]; return open(e.x + v[0], e.y + v[1], ghost); }
  function stepPlayer(dt) {
    var sp = 6.2 * speedMul() * (fright ? 1.08 : 1);
    if (player.p === 0) {
      if (canGo(player, player.next)) player.dir = player.next;
      if (!canGo(player, player.dir)) return;
    } else if (player.next === OPP[player.dir]) { // reverse any time
      var v = DIRS[player.dir]; player.x += v[0]; player.y += v[1]; wrap(player); player.p = 1 - player.p; player.dir = player.next;
    }
    player.p += sp * dt; player.mouth += dt * 12;
    while (player.p >= 1) {
      var d = DIRS[player.dir]; player.x += d[0]; player.y += d[1]; wrap(player); player.p -= 1;
      eat(player.x, player.y);
      if (canGo(player, player.next)) player.dir = player.next;
      if (!canGo(player, player.dir)) { player.p = 0; break; }
    }
  }
  function eat(x, y) {
    var k = y * CW + x, c = coins[k];
    if (!c) return;
    delete coins[k]; S.eaten++;
    if (c === '.') { S.score += 10; if (S.eaten % 30 === 0) learnWord(); }
    else { S.score += 50; startFright(); }
    if (S.eaten === 60 || S.eaten === 130) spawnBonus();
    if (Object.keys(coins).length === 0) dayWon();
  }
  function startFright() {
    fright = true; frightT = Math.max(2.5, 7 - (S.day - 1) * 1.2 - S.loops); eatCombo = 0;
    ghosts.forEach(function (g) { if (g.state === 'out') { g.dir = OPP[g.dir]; if (g.p) { g.p = 1 - g.p; var v = DIRS[OPP[g.dir]]; g.x += v[0]; g.y += v[1]; wrap(g); } } });
    flash(X.goal3[0] + ' ' + X.fleeing[0], X.fleeing[1], 'gold');
  }
  function target(g) {
    if (g.state === 'eyes') return HOUSE;
    if (g.state === 'leaving') return EXIT;
    var corners = [{ x: CW - 2, y: -2 }, { x: 1, y: -2 }, { x: CW - 1, y: CH + 1 }, { x: 0, y: CH + 1 }];
    if (mode === 'scatter') return corners[g.i];
    var pd = DIRS[player.dir];
    if (g.i === 0) return { x: player.x, y: player.y };
    if (g.i === 1) return { x: player.x + pd[0] * 4, y: player.y + pd[1] * 4 };
    if (g.i === 2) { var a = ghosts[0], px = player.x + pd[0] * 2, py = player.y + pd[1] * 2; return { x: px * 2 - a.x, y: py * 2 - a.y }; }
    var dist = Math.hypot(g.x - player.x, g.y - player.y); return dist > 7 ? { x: player.x, y: player.y } : corners[3];
  }
  function chooseDir(g) {
    var opts = ['up', 'left', 'down', 'right'].filter(function (d) {
      if (d === OPP[g.dir] && g.state !== 'leaving') return false;
      var v = DIRS[d], nx = g.x + v[0], ny = g.y + v[1], c = cell(nx, ny);
      if (c === '#') return false;
      if ((c === '-' || c === 'G') && !(g.state === 'eyes' || g.state === 'leaving')) return false;
      if (d === 'up' && g.state === 'out' && !fright && (ny === 6 || ny === 12) && (nx === 8 || nx === 10)) return true;
      return true;
    });
    if (!opts.length) return OPP[g.dir];
    if (fright && g.state === 'out') return opts[Math.floor(Math.random() * opts.length)];
    var t = target(g), best = opts[0], bd = 1e9;
    opts.forEach(function (d) { var v = DIRS[d], dd = Math.pow(g.x + v[0] - t.x, 2) + Math.pow(g.y + v[1] - t.y, 2); if (dd < bd) { bd = dd; best = d; } });
    return best;
  }
  function stepGhost(g, dt) {
    if (g.state === 'house') {
      g.release -= dt; g.bob = (g.bob || 0) + dt * 6;
      if (g.release <= 0) { g.state = 'leaving'; g.x = 9; g.y = 9; g.p = 0; g.dir = 'up'; }
      return;
    }
    if (g.state === 'wait') { g.timer -= dt; if (g.timer <= 0) { g.state = 'leaving'; g.dir = 'up'; } return; }
    var base = 5.7 * speedMul(), sp = g.state === 'eyes' ? 13 : fright && g.state === 'out' ? 3.4 : base;
    if (cell(g.x, g.y) === 'T' || (g.y === 9 && (g.x < 4 || g.x > CW - 5))) sp *= 0.55;
    if (g.p === 0) g.dir = chooseDir(g);
    g.p += sp * dt;
    while (g.p >= 1) {
      var v = DIRS[g.dir]; g.x += v[0]; g.y += v[1]; wrap(g); g.p -= 1;
      if (g.state === 'eyes' && g.x === HOUSE.x && g.y === HOUSE.y) { g.state = 'wait'; g.timer = 1; g.p = 0; return; }
      if (g.state === 'leaving' && g.x === EXIT.x && g.y === EXIT.y) { g.state = 'out'; g.dir = 'left'; }
      g.dir = chooseDir(g);
    }
  }
  function pos(e) { var v = DIRS[e.dir]; return { x: e.x + v[0] * e.p, y: e.y + v[1] * e.p }; }
  function collide() {
    var pp = pos(player);
    ghosts.forEach(function (g) {
      if (g.state !== 'out') return;
      var gp = pos(g), dx = Math.abs(gp.x - pp.x), dy = Math.abs(gp.y - pp.y);
      if (dx > CW / 2) dx = CW - dx;
      if (dx + dy < 0.7) {
        if (fright) {
          g.state = 'eyes'; eatCombo++; var pts = 200 * Math.pow(2, eatCombo - 1); S.score += pts;
          flash(g.t.name + ': ' + X.fleeing[0] + ' +' + pts, g.t.name + ' flee!', 'gold');
        } else die();
      }
    });
  }
  function die() {
    state = 'dying'; dyingT = 1.6; S.lives--;
    flash(X.caught[0], X.caught[1], 'red');
  }
  var dyingT = 0;
  function spawnBonus() { var b = BONUS[(S.day - 1 + S.loops) % BONUS.length]; bonus = { x: 9, y: 13, t: 9, b: b }; }
  function learnWord() {
    var left = VOCAB.filter(function (w) { return learned.indexOf(w) < 0; });
    var w = left.length ? left[Math.floor(Math.random() * left.length)] : VOCAB[Math.floor(Math.random() * VOCAB.length)];
    if (learned.indexOf(w) < 0) learned.push(w);
    if (window.TRBWords) window.TRBWords.log('teutoburg', 'l', w[0], w[1]);
    flash(w[0], w[1], 'word');
    renderHud();
  }
  function dayWon() {
    state = 'card';
    if (S.day < 3) { S.day++; S.eaten = 0; bonus = null; loadMaze(); resetActors(); var dc = dayCard(); card(function () { return winCard(false) + dc(); }); }
    else { card(winCard(true)); }
  }

  // ---------- update ----------
  var last = 0, rainDrops = [];
  function update(dt) {
    anim += dt;
    if (state === 'dying') {
      dyingT -= dt;
      if (dyingT <= 0) { if (S.lives <= 0) { state = 'card'; card(lossCard()); } else { resetActors(); state = 'ready'; readyT = 1.5; } }
      return;
    }
    if (state === 'ready') { readyT -= dt; if (readyT <= 0) state = 'play'; return; }
    if (state !== 'play') return;
    dayTime += dt;
    if (fright) { frightT -= dt; if (frightT <= 0) fright = false; }
    else { modeT -= dt; if (modeT <= 0) { modeIdx++; mode = modeIdx % 2 ? 'chase' : 'scatter'; modeT = SCHEDULE[Math.min(modeIdx, SCHEDULE.length - 1)]; ghosts.forEach(function (g) { if (g.state === 'out' && g.p) { g.dir = OPP[g.dir]; var v = DIRS[OPP[g.dir]]; g.x += v[0]; g.y += v[1]; wrap(g); g.p = 1 - g.p; } }); } }
    stepPlayer(dt); ghosts.forEach(function (g) { stepGhost(g, dt); }); collide();
    if (bonus) {
      bonus.t -= dt;
      if (player.x === bonus.x && player.y === bonus.y) { var pts = [100, 300, 500, 700][BONUS.indexOf(bonus.b)] || 100; S.score += pts; flash(bonus.b[0] + ' +' + pts, bonus.b[1], 'word'); if (!learned.some(function (w) { return w[0] === bonus.b[0]; })) learned.push([bonus.b[0], bonus.b[1]]); bonus = null; }
      else if (bonus.t <= 0) bonus = null;
    }
    renderHudLight();
  }
  var readyT = 0;

  // ---------- drawing ----------
  var cv, ctx, TS = 24, dpr = 1;
  function resize() {
    var wrapEl = root.querySelector('.tb-stage'), w = wrapEl.clientWidth, h = wrapEl.clientHeight;
    TS = Math.floor(Math.min(w / CW, h / CH)); TS = Math.max(12, TS);
    dpr = Math.min(2, W.devicePixelRatio || 1);
    cv.style.width = TS * CW + 'px'; cv.style.height = TS * CH + 'px';
    cv.width = TS * CW * dpr; cv.height = TS * CH * dpr; bg = null;
  }
  var bg = null;
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function drawBackground() {
    bg = D.createElement('canvas'); bg.width = cv.width; bg.height = cv.height;
    var c = bg.getContext('2d'); c.scale(dpr, dpr);
    var r = rnd(42);
    // muddy track
    c.fillStyle = '#5b4a33'; c.fillRect(0, 0, CW * TS, CH * TS);
    for (var i = 0; i < 700; i++) { c.fillStyle = r() < 0.5 ? 'rgba(40,30,18,.25)' : 'rgba(120,100,70,.18)'; c.beginPath(); c.ellipse(r() * CW * TS, r() * CH * TS, 2 + r() * 5, 1 + r() * 2.5, r() * 3, 0, Math.PI * 2); c.fill(); }
    // puddles (bog)
    for (i = 0; i < 18; i++) { var px = r() * CW * TS, py = r() * CH * TS; c.fillStyle = 'rgba(70,90,95,.35)'; c.beginPath(); c.ellipse(px, py, 6 + r() * 10, 3 + r() * 5, 0, 0, Math.PI * 2); c.fill(); }
    // forest walls: dense round tree crowns
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      if (!isForest(x, y) && cell(x, y) !== ' ' ) continue;
      if (cell(x, y) === ' ' && !isForest(x, y)) continue;
      var cx = x * TS + TS / 2, cy = y * TS + TS / 2;
      c.fillStyle = '#1f3a22'; c.fillRect(x * TS - 1, y * TS - 1, TS + 2, TS + 2);
      for (var k = 0; k < 3; k++) {
        var rr = TS * (0.32 + r() * 0.22), ox = (r() - 0.5) * TS * 0.6, oy = (r() - 0.5) * TS * 0.6;
        var g = c.createRadialGradient(cx + ox - rr * 0.3, cy + oy - rr * 0.3, rr * 0.1, cx + ox, cy + oy, rr);
        var dark = r() < 0.5; g.addColorStop(0, dark ? '#3f6b3a' : '#4d7a3f'); g.addColorStop(1, dark ? '#1c3620' : '#244426');
        c.fillStyle = g; c.beginPath(); c.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2); c.fill();
      }
    }
    // ghost house: a Germanic turf rampart (as found at Kalkriese)
    c.fillStyle = '#6b5a36'; c.fillRect(7 * TS + 3, 8 * TS + 3, 5 * TS - 6, 3 * TS - 6);
    c.fillStyle = '#3c2f1d'; c.fillRect(8 * TS, 9 * TS, 3 * TS, TS);
    c.fillStyle = '#8a7a52'; c.fillRect(9 * TS + 2, 8 * TS + TS * 0.4, TS - 4, TS * 0.2);
  }
  function drawCoin(x, y, big) {
    var cx = x * TS + TS / 2, cy = y * TS + TS / 2;
    if (big) { drawEagle(cx, cy, TS * 0.42 * (1 + Math.sin(anim * 5) * 0.08)); return; }
    var r = Math.max(2.2, TS * 0.12);
    ctx.fillStyle = '#b8863a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e3b964'; ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.55, 0, Math.PI * 2); ctx.fill();
  }
  function drawEagle(cx, cy, s) { // legionary eagle standard (aquila)
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = '#7a5a2a'; ctx.fillRect(-s * 0.06, -s * 0.1, s * 0.12, s * 1.1);
    ctx.fillStyle = '#e8c35a'; ctx.strokeStyle = '#8a6420'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.2); ctx.quadraticCurveTo(-s * 0.9, -s * 0.9, -s * 0.95, -s * 0.1); ctx.quadraticCurveTo(-s * 0.4, -s * 0.35, 0, 0);
    ctx.quadraticCurveTo(s * 0.4, -s * 0.35, s * 0.95, -s * 0.1); ctx.quadraticCurveTo(s * 0.9, -s * 0.9, 0, -s * 0.2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -s * 0.35, s * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawLegionary(p, dir, dying) {
    var cx = (p.x + 0.5) * TS, cy = (p.y + 0.5) * TS, r = TS * 0.44;
    var ang = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir];
    ctx.save(); ctx.translate(cx, cy);
    if (dying) { ctx.rotate(anim * 12); ctx.globalAlpha = Math.max(0, dyingT / 1.6); }
    ctx.rotate(ang);
    var chomp = (Math.sin(player.mouth) + 1) / 2 * 0.55 + 0.08;
    // red tunic body with open "mouth" (the gap between shield and body)
    ctx.fillStyle = '#a3222a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, chomp, Math.PI * 2 - chomp); ctx.closePath(); ctx.fill();
    // mail shirt ring
    ctx.strokeStyle = 'rgba(200,200,200,.55)'; ctx.lineWidth = Math.max(1, r * 0.12); ctx.beginPath(); ctx.arc(0, 0, r * 0.7, chomp + 0.2, Math.PI * 2 - chomp - 0.2); ctx.stroke();
    // iron helmet seen from above, with neck guard at the back
    ctx.fillStyle = '#9aa3a8'; ctx.beginPath(); ctx.arc(-r * 0.08, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6c7479'; ctx.fillRect(-r * 0.62, -r * 0.3, r * 0.22, r * 0.6);
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(-r * 0.08 - r * 0.05, -r * 0.4, r * 0.1, r * 0.8);
    ctx.restore();
  }
  function drawTribesman(g) {
    var p = pos(g), cx = (p.x + 0.5) * TS, cy = (p.y + 0.5) * TS + (g.state === 'house' ? Math.sin(g.bob) * TS * 0.12 : 0), r = TS * 0.44;
    if (g.state === 'eyes' || g.state === 'wait') { // only the shield rolling home
      ctx.fillStyle = '#6b4a2c'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9c9c9'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2); ctx.fill(); return;
    }
    var col = fright ? (frightT < 2 && Math.floor(anim * 6) % 2 ? '#e8e4d8' : '#3a4f8a') : g.t.color;
    // cloak (sagum) shape like a hooded figure
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
    var wv = Math.sin(anim * 10) * r * 0.12;
    ctx.lineTo(cx + r, cy + r * 0.85); ctx.lineTo(cx + r * 0.5, cy + r * 0.65 + wv); ctx.lineTo(cx, cy + r * 0.85); ctx.lineTo(cx - r * 0.5, cy + r * 0.65 - wv); ctx.lineTo(cx - r, cy + r * 0.85); ctx.closePath(); ctx.fill();
    // round wooden shield with iron boss
    ctx.fillStyle = fright ? '#dfe6f2' : '#7a5230'; ctx.beginPath(); ctx.arc(cx - r * 0.45, cy + r * 0.25, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b8bfc4'; ctx.beginPath(); ctx.arc(cx - r * 0.45, cy + r * 0.25, r * 0.13, 0, Math.PI * 2); ctx.fill();
    // spear (framea)
    ctx.strokeStyle = '#4a3420'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.beginPath(); ctx.moveTo(cx + r * 0.6, cy + r * 0.8); ctx.lineTo(cx + r * 0.8, cy - r * 1.05); ctx.stroke();
    ctx.fillStyle = '#c9ced2'; ctx.beginPath(); ctx.moveTo(cx + r * 0.8, cy - r * 1.35); ctx.lineTo(cx + r * 0.7, cy - r * 1.02); ctx.lineTo(cx + r * 0.9, cy - r * 1.02); ctx.fill();
    // eyes look where they go
    var v = DIRS[g.dir], ex = v[0] * r * 0.15, ey = v[1] * r * 0.15;
    [-0.3, 0.2].forEach(function (o) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + o * r, cy - r * 0.2, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = fright ? '#c33' : '#1d2320'; ctx.beginPath(); ctx.arc(cx + o * r + ex, cy - r * 0.2 + ey, r * 0.1, 0, Math.PI * 2); ctx.fill(); });
  }
  function draw() {
    if (!bg) drawBackground();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Object.keys(coins).forEach(function (k) { k = +k; drawCoin(k % CW, (k / CW) | 0, coins[k] === 'o'); });
    if (bonus) { ctx.font = Math.round(TS * 0.8) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(bonus.b[2], (bonus.x + 0.5) * TS, (bonus.y + 0.5) * TS); }
    ghosts.forEach(drawTribesman);
    if (state !== 'card' || S) drawLegionary(pos(player), player.dir, state === 'dying');
    // rain
    ctx.strokeStyle = 'rgba(190,210,225,.35)'; ctx.lineWidth = 1;
    while (rainDrops.length < 90) rainDrops.push({ x: Math.random() * CW * TS, y: Math.random() * CH * TS, v: 300 + Math.random() * 200 });
    ctx.beginPath(); rainDrops.forEach(function (d) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3, d.y + 10); d.y += d.v / 60; d.x -= 1; if (d.y > CH * TS) { d.y = -10; d.x = Math.random() * CW * TS; } }); ctx.stroke();
    if (state === 'ready') { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 8.6 * TS, CW * TS, 1.8 * TS); ctx.fillStyle = '#f3dfa3'; ctx.font = 'bold ' + Math.round(TS * 0.9) + 'px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(X.day[0] + ' ' + roman(S.day) + ' · ' + X.goal1[0], CW * TS / 2, 9.5 * TS); }
  }
  function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }

  // ---------- UI ----------
  function shell() {
    root.innerHTML =
      '<div class="tb-top"><div class="tb-title">' + T(X.title) + '</div>' +
      '<div class="tb-hud"><span class="hs" id="h-score"></span><span class="hs" id="h-lives"></span><span class="hs" id="h-day"></span><span class="hs" id="h-words"></span></div>' +
      '<div class="tb-btns"><label class="tb-en"><input type="checkbox" id="tb-en"' + (showEn ? ' checked' : '') + '> English</label>' +
      '<button type="button" class="tb-btn" id="tb-pause" title="Pause (P)">❚❚</button><button type="button" class="tb-btn" id="tb-help" title="How to play and history">?</button></div></div>' +
      '<div class="tb-main"><div class="tb-stage"><canvas id="tb-cv"></canvas><div class="tb-flash" id="tb-flash"></div><div class="tb-card" id="tb-card" hidden></div></div>' +
      '<aside class="tb-side"><div id="tb-side-speed">' + speedHTML() + '</div><h3>' + T(X.words) + '</h3><ul id="tb-learned" class="tb-learned"></ul><h3>Germani</h3><ul class="tb-tribes">' +
      TRIBES.map(function (t) { return '<li><i style="background:' + t.color + '"></i><b>' + t.name + '</b><small>' + t.note + '</small></li>'; }).join('') + '</ul></aside></div>' +
      '<div class="tb-pad" aria-label="Direction buttons">' + ['up', 'left', 'right', 'down'].map(function (d) { return '<button type="button" data-d="' + d + '" class="pad-' + d + '"><span>' + { up: '▲', down: '▼', left: '◀', right: '▶' }[d] + '</span><small>' + X[d][0] + '</small></button>'; }).join('') + '</div>';
    cv = root.querySelector('#tb-cv'); ctx = cv.getContext('2d');
    W.addEventListener('resize', function () { resize(); });
    root.querySelector('#tb-en').onchange = function (e) { showEn = e.target.checked; try { W.localStorage.setItem('teut-en', showEn ? '1' : '0'); } catch (x) { } renderHud(); root.querySelector('#tb-side-speed').innerHTML = speedHTML(); if (state === 'card' || state === 'menu' || cardHTML) refreshCard(); };
    root.querySelector('#tb-pause').onclick = togglePause;
    root.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('tb-spd')) setSpeed(+e.target.value); });
    root.querySelector('#tb-help').onclick = function () { if (state === 'play') togglePause(); card(helpCard, true); };
    Array.prototype.forEach.call(root.querySelectorAll('[data-d]'), function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); steer(b.dataset.d); });
    });
    // keyboard
    D.addEventListener('keydown', function (e) {
      var k = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' }[e.key];
      if (k && (state === 'play' || state === 'ready')) { e.preventDefault(); steer(k); }
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && S) togglePause();
      if ((e.key === 'Enter' || e.key === ' ') && state === 'card') { e.preventDefault(); var b = root.querySelector('#tb-card .go'); if (b) b.click(); }
    });
    // swipe
    var sx = 0, sy = 0;
    cv.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 24) { steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
      e.preventDefault();
    }, { passive: false });
    resize();
  }
  function steer(d) { if (player) player.next = d; }
  var paused = false, prevState = null;
  function togglePause() {
    if (state === 'play' || state === 'ready') { prevState = state; state = 'paused'; flash(X.pause[0], X.pause[1], ''); }
    else if (state === 'paused') { state = prevState || 'play'; }
  }
  var hudCache = '';
  function renderHud() {
    if (!S) return;
    root.querySelector('#h-score').innerHTML = '<span class="la">' + X.score[0] + '</span> <b>' + S.score + '</b>';
    root.querySelector('#h-lives').innerHTML = '<span class="la">' + X.lives[0] + '</span> ' + Array(Math.max(0, S.lives) + 1).join('🪖');
    root.querySelector('#h-day').innerHTML = '<span class="la">' + X.day[0] + '</span> <b>' + roman(S.day) + '</b>';
    root.querySelector('#h-words').innerHTML = '<span class="la">' + X.words[0] + '</span> <b>' + learned.length + '</b>';
    root.querySelector('#tb-learned').innerHTML = learned.slice().reverse().map(function (w) { return '<li><b class="la">' + w[0] + '</b>' + (showEn ? ' <span class="en">' + w[1] + '</span>' : '') + '</li>'; }).join('') || '<li class="muted">' + T(X.goal1) + '</li>';
    Array.prototype.forEach.call(root.querySelectorAll('.tb-hud .la'), function () { });
    hudCache = S.score + '|' + S.lives + '|' + S.day + '|' + learned.length;
  }
  function renderHudLight() { if (S && hudCache !== S.score + '|' + S.lives + '|' + S.day + '|' + learned.length) renderHud(); }
  var flashT = null;
  function flash(la, en, cls) {
    var f = root.querySelector('#tb-flash'); f.className = 'tb-flash on ' + (cls || '');
    f.innerHTML = '<span class="la">' + la + '</span>' + (showEn && en ? '<span class="en">' + en + '</span>' : '');
    clearTimeout(flashT); flashT = setTimeout(function () { f.className = 'tb-flash'; }, 1700);
  }
  // cards (menus between days)
  var cardHTML = '', cardIsHelp = false;
  function card(html, isHelp) { cardHTML = html; cardIsHelp = !!isHelp; refreshCard(); }
  function refreshCard() {
    var el = root.querySelector('#tb-card'); if (!cardHTML) { el.hidden = true; return; }
    var html = typeof cardHTML === 'function' ? cardHTML() : cardHTML;
    el.innerHTML = '<div class="tb-cardin">' + html + '</div>'; el.hidden = false; el.scrollTop = 0;
    var go = el.querySelector('.go');
    if (go) go.onclick = function () {
      var act = go.dataset.act; cardHTML = ''; el.hidden = true;
      if (act === 'new') newGame();
      if (act === 'play') { state = 'ready'; readyT = 1.4; renderHud(); }
      if (act === 'close') { if (!S) { card(menuCard); } else if (state === 'paused') { state = prevState || 'play'; } }
    };
    var h = el.querySelector('.helpbtn'); if (h) h.onclick = function () { card(helpCard, true); };
  }
  function goals() { return '<ul class="tb-goals"><li>🪙 ' + T(X.goal1) + '</li><li>🦅 ' + T(X.goal3) + '</li><li>⚠️ ' + T(X.goal2) + '</li></ul>'; }
  function menuCard() {
    return '<h2>' + T(X.title) + '</h2><p class="lead">' + (showEn ? 'September, AD 9. You are a legionary in Varus’ army, marching through the rain-soaked forest of Germania. Collect coins, grab the eagle standards, and escape the Germanic tribes.' : '') + '</p>' +
      goals() + speedHTML() + '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="new">' + T(X.start) + '</button><button type="button" class="tb-btn helpbtn">' + T(X.help) + '</button></div>' +
      '<p class="small">Arrow keys or WASD · swipe or use the buttons on a phone · P pauses. Nothing is saved: each game starts fresh.</p>';
  }
  function dayCard() {
    return function () {
      var d = DAYS[(S.day - 1) % 3];
      return '<h2>' + T([X.day[0] + ' ' + roman(S.day), X.day[1] + ' ' + S.day]) + '</h2>' +
        '<div class="latin-lines">' + d.la.map(function (l) { return '<p class="la big">' + l + '</p>'; }).join('') + '</div>' +
        (showEn ? '<p class="gloss">' + GLOSS[d.la[0]] + ' ' + GLOSS[d.la[1]] + '</p><p>' + d.en + '</p>' : '') +
        '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="play">' + T(X.start) + '</button></div>';
    };
  }
  function winCard(final) {
    if (!final) return '<p class="win">' + T(X.escaped) + ' ' + T(X.great) + '</p>';
    return '<h2>' + T(X.escaped) + '</h2><p class="score">' + X.score[0] + ': <b>' + S.score + '</b> · ' + X.words[0] + ': <b>' + learned.length + '</b></p>' +
      (showEn ? '<p>You survived all three days, which few did. A small group of survivors reached the Roman fort at Aliso and later broke out to the Rhine (Velleius Paterculus 2.120; Cassius Dio 56.22).</p>' : '') +
      wordList() + '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="new">' + T(X.again) + '</button></div>';
  }
  function lossCard() {
    return '<h2>' + T(X.lost) + '</h2><p class="la big">Quintili Vare, legiones redde!</p>' + (showEn ? '<p class="gloss">“Quinctilius Varus, give me back my legions!”, which Augustus is said to have cried out for months afterward (Suetonius, <i>Augustus</i> 23).</p>' +
      '<p>Varus and several senior officers took their own lives (Velleius Paterculus 2.119). The three legions and their eagles were lost. Rome recovered two eagles under Germanicus in AD 15 and 16 (Tacitus, <i>Annals</i> 1.60, 2.25) and the third in AD 41 (Cassius Dio 60.8). The 17th, 18th and 19th legions were never raised again.</p>' : '') +
      '<p class="score">' + X.score[0] + ': <b>' + S.score + '</b> · ' + X.day[0] + ' ' + roman(S.day) + ' · ' + X.words[0] + ': <b>' + learned.length + '</b></p>' + wordList() +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="new">' + T(X.again) + '</button></div>';
  }
  function wordList() {
    if (!learned.length) return '';
    return '<h3>' + T(X.words) + '</h3><ul class="wordlist">' + learned.map(function (w) { return '<li><b class="la">' + w[0] + '</b> <span class="en">' + w[1] + '</span></li>'; }).join('') + '</ul>';
  }
  function helpCard() {
    return '<h2>' + T(X.help) + '</h2>' + goals() +
      '<h3>Controls</h3><ul><li><b>Keyboard:</b> arrow keys or W A S D. <b>P</b> or <b>Esc</b> pauses.</li><li><b>Phone or tablet:</b> swipe on the forest, or use the four buttons: <i>Sursum</i> (up), <i>Deorsum</i> (down), <i>Sinistrorsum</i> (left), <i>Dextrorsum</i> (right).</li>' +
      '<li>You can reverse direction at any time. Turns are remembered, so press the next turn early.</li>' +
      '<li><b>Speed</b> (<i>celeritas</i>): slide it left for <i>Facilis</i> (easy), to the middle for <i>Mediocris</i> (medium) or right for <i>Difficilis</i> (hard). It speeds up or slows down the whole forest, you and the tribes alike, and can be changed at any time from the start screen, this help screen or the panel beside the map.</li></ul>' + speedHTML() +
      '<h3>How it plays</h3><ul><li>🪙 Coins (<i>nummi</i>) are 10 points. Clear every coin to escape that day. There are three days (<i>Dies I–III</i>).</li>' +
      '<li>🦅 An eagle standard (<i>aquila</i>) in each corner is worth 50 and rallies you. For a few seconds the tribesmen turn blue and <i>timent</i> (are afraid). Catch them for 200, 400, 800 and 1600. They retreat to the turf rampart in the middle and return.</li>' +
      '<li>🍞 Bonus supplies appear below the rampart twice per day: <i>panis</i> (bread), <i>posca</i> (the sour-wine drink of Roman soldiers), <i>galea</i> (helmet), <i>pilum</i> (javelin).</li>' +
      '<li>📜 Every 30 coins you pick up a new Latin word about the battle. Your words are listed beside the map and at the end.</li>' +
      '<li>🪖 You have three lives (<i>vitae</i>). The tribes hunt differently: the Cherusci chase you directly, the Bructeri cut ahead of you, the Marsi work with the Cherusci, and the Chatti close in and then fall back.</li></ul>' +
      '<h3>' + T(X.history) + '</h3>' +
      '<p>In September AD 9, Publius Quinctilius Varus, governor of Germania, led the 17th, 18th and 19th legions with auxiliary troops and a long baggage train through wooded, hilly country. Arminius, a prince of the Cherusci who had served as a commander of Roman auxiliaries and held Roman citizenship, had secretly united several tribes. Over three or four days of rain and ambushes the army was destroyed. Estimates of the dead run from about 15,000 to 20,000.</p>' +
      '<p>The site is widely identified with Kalkriese, near Osnabrück in Germany, where a narrow passage runs between the Kalkriese hill and a large bog. Excavations there since 1987 have found a Germanic turf wall, Roman weapons and armor, a famous iron face mask, and many coins, including copper coins countermarked VAR. Some scholars still debate whether Kalkriese was the main battlefield.</p>' +
      '<p><b>The four tribes in the game</b> are ones ancient writers link to the battle or its aftermath:</p><ul>' + TRIBES.map(function (t) { return '<li><b>' + t.name + '</b>: ' + t.note + '</li>'; }).join('') + '</ul>' +
      '<p class="small">Their colors are for play only. Ancient sources: Velleius Paterculus 2.117–120; Cassius Dio 56.18–24; Tacitus, <i>Annals</i> 1.55–71; Suetonius, <i>Augustus</i> 23. The name <i>saltus Teutoburgiensis</i> comes from Tacitus, <i>Annals</i> 1.60.</p>' +
      '<h3>Latin in this game</h3><table class="gl">' + Object.keys(X).map(function (k) { return '<tr><td class="la">' + X[k][0] + '</td><td>' + X[k][1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="close">' + T(['Redi', 'Back']) + '</button></div>';
  }

  // ---------- loop ----------
  function frame(ts) {
    var t = ts / 1000, dt = Math.min(0.05, t - (last || t)); last = t;
    if (S && state !== 'paused' && state !== 'card') update(dt * GS);
    if (S) draw(); else drawIdle(t);
    W.requestAnimationFrame(frame);
  }
  function drawIdle(t) { anim = t; if (!bg) drawBackground(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0); }

  loadMaze(); shell(); card(menuCard); W.requestAnimationFrame(frame);
  W.__teut = { get S() { return S; }, get state() { return state; }, get coins() { return coins; }, get player() { return player; }, get ghosts() { return ghosts; }, update: update, newGame: newGame, steer: steer, setState: function (s) { state = s; } };
})(window, document);
