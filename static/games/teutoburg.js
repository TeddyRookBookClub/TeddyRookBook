/* Venatio aquilae (Eagle Hunt): maze, fair start positions, the chase, board rotation and scoring.
   Pure logic with no DOM, so the Node tests can load this file directly. */
(function (G) {
  'use strict';
  var DIRS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  var CLOCK = ['up', 'right', 'down', 'left']; // board north, east, south, west, in clockwise order
  var OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  var SPIN = 0.38, WARN = 0.75, CATCH = 0.72;

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // Difficulty for round r (1, 2, 3 ...). Speeds are in tiles per second.
  function params(round) {
    var k = Math.max(0, round - 1), vP = 5;
    return {
      round: round,
      n: Math.min(10, 5 + Math.ceil(round / 2)),          // maze cells per side: 6 6 7 7 8 8 9 9 10 ...
      braid: Math.max(0.3, 0.7 - 0.05 * k),               // share of dead ends opened into loops
      vP: vP,
      v0: vP * Math.min(0.88, 0.6 + 0.035 * k),           // the warrior's speed when the round starts
      a: vP * Math.min(0.11, 0.035 + 0.008 * k),          // ... and how fast it grows each second
      vMax: vP * Math.min(1.3, 1.02 + 0.035 * k),         // ... up to this
      delay: Math.max(0.35, 1.1 - 0.1 * k),               // he waits this long before moving
      margin: Math.max(1.5, 3.8 - 0.26 * k),              // seconds to spare on the best route
      window: 1.6,
      rotEvery: Math.max(2.9, 7.5 - 0.6 * k),             // seconds between turns of the board
      allow180: round >= 3,
      startTurned: round >= 3,
      minGap: 8
    };
  }

  // A perfect maze (depth-first) on n x n cells, drawn as a (2n+1) x (2n+1) grid of tiles (1 = forest, 0 = path),
  // then "braided": some dead ends are opened so there are loops to run around.
  function genMaze(n, r, braid) {
    var S = 2 * n + 1, t = [], i;
    for (i = 0; i < S * S; i++) t.push(1);
    var seen = [], sx = Math.floor(r() * n), sy = Math.floor(r() * n), stack = [[sx, sy]];
    seen[sy * n + sx] = 1; t[(2 * sy + 1) * S + 2 * sx + 1] = 0;
    while (stack.length) {
      var c = stack[stack.length - 1], nb = [];
      for (i = 0; i < 4; i++) {
        var v = DIRS[CLOCK[i]], nx = c[0] + v[0], ny = c[1] + v[1];
        if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]) nb.push([nx, ny, v]);
      }
      if (!nb.length) { stack.pop(); continue; }
      var k = nb[Math.floor(r() * nb.length)];
      t[(2 * c[1] + 1 + k[2][1]) * S + 2 * c[0] + 1 + k[2][0]] = 0;
      t[(2 * k[1] + 1) * S + 2 * k[0] + 1] = 0; seen[k[1] * n + k[0]] = 1; stack.push([k[0], k[1]]);
    }
    var cells = []; for (var cy = 0; cy < n; cy++) for (var cx = 0; cx < n; cx++) cells.push([cx, cy]);
    shuffle(cells, r).forEach(function (c) {
      var walls = [], open = 0;
      CLOCK.forEach(function (d) {
        var v = DIRS[d], wx = 2 * c[0] + 1 + v[0], wy = 2 * c[1] + 1 + v[1];
        if (t[wy * S + wx] === 0) open++;
        else if (c[0] + v[0] >= 0 && c[1] + v[1] >= 0 && c[0] + v[0] < n && c[1] + v[1] < n) walls.push([wx, wy]);
      });
      if (open === 1 && walls.length && r() < braid) { var w = walls[Math.floor(r() * walls.length)]; t[w[1] * S + w[0]] = 0; }
    });
    return { n: n, S: S, t: t };
  }
  function isOpen(m, x, y) { return x >= 0 && y >= 0 && x < m.S && y < m.S && m.t[y * m.S + x] === 0; }
  function bfs(m, x, y) {
    var S = m.S, d = [], q = [y * S + x], i;
    for (i = 0; i < S * S; i++) d.push(-1);
    d[y * S + x] = 0;
    for (var h = 0; h < q.length; h++) {
      var k = q[h], kx = k % S, ky = (k / S) | 0;
      for (i = 0; i < 4; i++) {
        var v = DIRS[CLOCK[i]], nx = kx + v[0], ny = ky + v[1];
        if (isOpen(m, nx, ny) && d[ny * S + nx] < 0) { d[ny * S + nx] = d[k] + 1; q.push(ny * S + nx); }
      }
    }
    return d;
  }
  // shortest route from a to b as a list of tiles (a first)
  function path(m, a, b) {
    var d = bfs(m, b.x, b.y), out = [{ x: a.x, y: a.y }], x = a.x, y = a.y;
    if (d[y * m.S + x] < 0) return null;
    while (x !== b.x || y !== b.y) {
      for (var i = 0; i < 4; i++) {
        var v = DIRS[CLOCK[i]], nx = x + v[0], ny = y + v[1];
        if (isOpen(m, nx, ny) && d[ny * m.S + nx] === d[y * m.S + x] - 1) { x = nx; y = ny; break; }
      }
      out.push({ x: x, y: y });
    }
    return out;
  }
  // how far the warrior has run t seconds after the round starts, and the inverse
  function foeSpeed(t, P) { t = Math.max(0, t - P.delay); return t <= 0 ? 0 : Math.min(P.vMax, P.v0 + P.a * t); }
  function foeDist(t, P) {
    t = Math.max(0, t - P.delay); var tc = (P.vMax - P.v0) / P.a;
    if (t <= tc) return P.v0 * t + 0.5 * P.a * t * t;
    return P.v0 * tc + 0.5 * P.a * tc * tc + P.vMax * (t - tc);
  }
  function foeTime(d, P) {
    if (d <= 0) return P.delay;
    var tc = (P.vMax - P.v0) / P.a, dc = P.v0 * tc + 0.5 * P.a * tc * tc;
    if (d <= dc) return P.delay + (-P.v0 + Math.sqrt(P.v0 * P.v0 + 2 * P.a * d)) / P.a;
    return P.delay + tc + (d - dc) / P.vMax;
  }
  // Seconds to spare: over every tile of the hero's best route, how much later the warrior could first get there
  // (within catching distance) than the hero does. Positive everywhere means a hero who runs the best route always wins.
  function slack(m, route, foe, P) {
    var d = bfs(m, foe.x, foe.y), s = 1e9;
    for (var i = 0; i < route.length; i++) {
      var dw = d[route[i].y * m.S + route[i].x];
      var gap = foeTime(Math.max(0, dw - CATCH), P) - i / P.vP;
      if (gap < s) s = gap;
    }
    return s;
  }
  function cellsOf(m) { var out = []; for (var y = 1; y < m.S; y += 2) for (var x = 1; x < m.S; x += 2) out.push({ x: x, y: y }); return out; }
  // Hero in a corner region, eagle far away, warrior placed so the best route has between margin and margin+window seconds to spare.
  function layout(m, P, r, relax) {
    var n = m.n, third = Math.max(2, Math.ceil(n / 3)), corner = Math.floor(r() * 4);
    var cx = Math.floor(r() * third), cy = Math.floor(r() * third);
    if (corner & 1) cx = n - 1 - cx; if (corner & 2) cy = n - 1 - cy;
    var hero = { x: 2 * cx + 1, y: 2 * cy + 1 }, dh = bfs(m, hero.x, hero.y), cells = cellsOf(m), max = 0;
    cells.forEach(function (c) { max = Math.max(max, dh[c.y * m.S + c.x]); });
    var far = cells.filter(function (c) { return dh[c.y * m.S + c.x] >= 0.78 * max; });
    var eagle = far[Math.floor(r() * far.length)], route = path(m, hero, eagle);
    var best = null, inWin = [], most = null;
    cells.forEach(function (c) {
      if (dh[c.y * m.S + c.x] < P.minGap) return;
      var s = slack(m, route, c, P);
      if (!most || s > most.s) most = { c: c, s: s };
      if (s < P.margin) return;
      if (s <= P.margin + P.window) inWin.push({ c: c, s: s });
      if (!best || s < best.s) best = { c: c, s: s };
    });
    var pick = inWin.length ? inWin[Math.floor(r() * inWin.length)] : best;
    if (!pick && relax) pick = most; // never reached in practice: the safest spot this forest has
    if (!pick) return null;
    return { hero: hero, eagle: eagle, foe: pick.c, route: route, slack: pick.s };
  }

  function newRound(round, seed, opt) {
    opt = opt || {};
    var P = params(round), r = rng(seed), m, L, tries = 0;
    do { m = genMaze(P.n, r, P.braid); L = layout(m, P, r, tries >= 40); tries++; } while (!L);
    var q = 0;
    if (P.startTurned) q = 1 + Math.floor(r() * 3);
    if (opt.q != null) q = opt.q;
    return {
      round: round, P: P, m: m, r: r, seed: seed,
      hero: { x: L.hero.x, y: L.hero.y, dir: null, face: 'up', next: null, p: 0, mouth: 0, moved: false },
      foe: { x: L.foe.x, y: L.foe.y, dir: 'up', p: 0, moving: false },
      eagle: L.eagle, route: L.route, slack: L.slack, par: (L.route.length - 1) / P.vP,
      q: q, ang: q * Math.PI / 2, spinFrom: 0, spinTo: 0, spinT: 0, freeze: 0,
      rotT: P.rotEvery * (0.45 + 0.2 * r()), warned: false, nextDq: 0, turns: 0,
      t: 0, elapsed: 0, anim: 0, glow: 0, over: null
    };
  }

  function can(m, e, d) { if (!d) return false; var v = DIRS[d]; return isOpen(m, e.x + v[0], e.y + v[1]); }
  function moveHero(H, dt) {
    var h = H.hero, m = H.m;
    if (h.p === 0) {
      if (can(m, h, h.next)) h.dir = h.next;
      if (!can(m, h, h.dir)) return false;
    } else if (h.next === OPP[h.dir]) {
      var b = DIRS[h.dir]; h.x += b[0]; h.y += b[1]; h.p = 1 - h.p; h.dir = h.next;
    }
    h.moved = true; h.face = h.dir; h.p += H.P.vP * dt; h.mouth += dt * 12;
    while (h.p >= 1) {
      var v = DIRS[h.dir]; h.x += v[0]; h.y += v[1]; h.p -= 1;
      if (h.x === H.eagle.x && h.y === H.eagle.y) { h.p = 0; return true; }
      if (can(m, h, h.next)) h.dir = h.next;
      if (!can(m, h, h.dir)) { h.p = 0; break; }
    }
    h.face = h.dir;
    return false;
  }
  function chase(H) { // the warrior's next step on a shortest route to the hero
    var f = H.foe, m = H.m, d = bfs(m, H.hero.x, H.hero.y), best = null, bd = 1e9;
    for (var i = 0; i < 4; i++) {
      var dir = CLOCK[i], v = DIRS[dir], nx = f.x + v[0], ny = f.y + v[1];
      if (!isOpen(m, nx, ny)) continue;
      var dd = d[ny * m.S + nx]; if (dd >= 0 && dd < bd) { bd = dd; best = dir; }
    }
    return best;
  }
  function moveFoe(H, dt) {
    var f = H.foe, sp = foeSpeed(H.t, H.P);
    if (sp <= 0) return;
    if (f.p === 0) { var d = chase(H); if (!d) return; f.dir = d; }
    f.moving = true; f.p += sp * dt;
    while (f.p >= 1) {
      var v = DIRS[f.dir]; f.x += v[0]; f.y += v[1]; f.p -= 1;
      var nd = chase(H); if (!nd) { f.p = 0; break; } f.dir = nd;
    }
  }
  function pos(e) { var v = DIRS[e.dir] || [0, 0]; return { x: e.x + v[0] * e.p, y: e.y + v[1] * e.p }; }
  function caught(H) { var a = pos(H.hero), b = pos(H.foe); return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < CATCH; }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function pickTurn(H) { var opts = H.P.allow180 ? [1, -1, 1, -1, 2] : [1, -1]; return opts[Math.floor(H.r() * opts.length)]; }
  function turn(H, instant) {
    var dq = H.nextDq || pickTurn(H); H.nextDq = 0;
    H.q = (H.q + dq + 4) % 4; H.turns++;
    H.spinFrom = H.ang; H.spinTo = H.ang + dq * Math.PI / 2;
    if (instant) { H.ang = H.spinTo; H.spinT = 0; } else H.spinT = SPIN;
    H.freeze = SPIN + 0.08; H.glow = 1;
    H.rotT = H.P.rotEvery * (0.8 + 0.4 * H.r()); H.warned = false;
    return dq;
  }
  // Advance the round by dt seconds. Returns a list of events: 'warn', 'turn', 'win', 'caught'.
  function step(H, dt, opt) {
    var ev = [];
    if (H.over) return ev;
    H.anim += dt; H.glow = Math.max(0, H.glow - dt * 0.8);
    if (H.spinT > 0) { H.spinT = Math.max(0, H.spinT - dt); H.ang = H.spinFrom + (H.spinTo - H.spinFrom) * ease(1 - H.spinT / SPIN); }
    if (H.freeze > 0) { H.freeze = Math.max(0, H.freeze - dt); return ev; }
    H.t += dt; H.elapsed += dt; H.rotT -= dt;
    if (!H.warned && H.rotT <= WARN) { H.warned = true; H.nextDq = pickTurn(H); ev.push('warn'); }
    if (H.rotT <= 0) { turn(H, opt && opt.instant); ev.push('turn'); return ev; }
    if (moveHero(H, dt)) { H.over = 'win'; ev.push('win'); return ev; }
    moveFoe(H, dt);
    if (caught(H)) { H.over = 'caught'; ev.push('caught'); }
    return ev;
  }

  // Controls are tied to the board: Up (W, the N button, a swipe up) always means board north, whatever the turn.
  function inputToBoard(key, q) { return key; }
  // where a board direction points on the screen after q clockwise quarter turns
  function boardToScreen(d, q) { return CLOCK[(CLOCK.indexOf(d) + ((q % 4) + 4)) % 4]; }
  function screenToBoard(d, q) { return CLOCK[(CLOCK.indexOf(d) - (q % 4) + 8) % 4]; }
  // the same turn as a canvas rotation (y points down, so a positive angle turns clockwise)
  function rotVec(x, y, ang) { var c = Math.cos(ang), s = Math.sin(ang); return [x * c - y * s, x * s + y * c]; }
  function quarter(ang) { return ((Math.round(ang / (Math.PI / 2)) % 4) + 4) % 4; }

  // points for a recovered eagle: a base that grows each round plus a bonus for a quick run
  function points(round, elapsed, par) {
    var bonus = Math.max(0, Math.round(par * 2 + 4 - elapsed)) * 10;
    return 100 + 50 * (round - 1) + Math.min(bonus, 300);
  }
  // a win moves you on; a catch costs a helmet and you replay the same round in a fresh forest
  function nextRound(round, won) { return won ? round + 1 : round; }

  var API = {
    DIRS: DIRS, CLOCK: CLOCK, OPP: OPP, SPIN: SPIN, WARN: WARN, CATCH: CATCH,
    rng: rng, params: params, genMaze: genMaze, isOpen: isOpen, bfs: bfs, path: path,
    foeSpeed: foeSpeed, foeDist: foeDist, foeTime: foeTime, slack: slack, layout: layout,
    newRound: newRound, step: step, turn: turn, pos: pos, caught: caught, chase: chase,
    inputToBoard: inputToBoard, boardToScreen: boardToScreen, screenToBoard: screenToBoard, rotVec: rotVec, quarter: quarter,
    points: points, nextRound: nextRound
  };
  if (typeof module === 'object' && module.exports) module.exports = API;
  if (G) G.TeutHunt = API;
})(typeof window !== 'undefined' ? window : null);
/* Saltus Teutoburgiensis: a maze chase set in the Teutoburg Forest, AD 9. Latin with optional English help.
   Three modes: Tres dies (Classic, the original game), Venatio aquilae (Eagle Hunt, on a turning board) and Expeditio (Campaign). */
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
    if (gameMode === 'camp') { campaignAfterDay(); return; }
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
    if (H) { huntResize(); return; }
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
  function roman(n) { if (!(n > 0 && n < 4000)) return String(n); var v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], l = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'], o = ''; for (var i = 0; i < v.length; i++) while (n >= v[i]) { o += l[i]; n -= v[i]; } return o; }

  // ---------- UI ----------
  function shell() {
    root.innerHTML =
      '<div class="tb-top"><div class="tb-title">' + T(X.title) + '</div>' +
      '<div class="tb-hud"><span class="hs" id="h-score"></span><span class="hs" id="h-lives"></span><span class="hs" id="h-day"></span><span class="hs" id="h-words"></span></div>' +
      '<div class="tb-btns"><label class="tb-en"><input type="checkbox" id="tb-en"' + (showEn ? ' checked' : '') + '> English</label>' +
      '<button type="button" class="tb-btn" id="tb-pause" title="Pause (P)">❚❚</button><button type="button" class="tb-btn" id="tb-help" title="How to play and history">?</button></div></div>' +
      '<div class="tb-main"><div class="tb-stage"><canvas id="tb-cv"></canvas><div class="tb-flash" id="tb-flash" role="status" aria-live="polite"></div><div class="tb-card" id="tb-card" hidden></div></div>' +
      '<aside class="tb-side"><div id="tb-side-speed">' + speedHTML() + '</div><div id="tb-side-c"><h3>' + T(X.words) + '</h3><ul id="tb-learned" class="tb-learned"></ul><h3>Germani</h3><ul class="tb-tribes">' +
      TRIBES.map(function (t) { return '<li><i style="background:' + t.color + '"></i><b>' + t.name + '</b><small>' + t.note + '</small></li>'; }).join('') + '</ul></div><div id="tb-side-h" class="tb-hside" hidden></div></aside></div>' +
      '<div class="tb-pad" aria-label="Direction buttons">' + ['up', 'left', 'right', 'down'].map(function (d) { return '<button type="button" data-d="' + d + '" class="pad-' + d + '"><span>' + { up: '▲', down: '▼', left: '◀', right: '▶' }[d] + '</span><small>' + X[d][0] + '</small></button>'; }).join('') + '</div>';
    cv = root.querySelector('#tb-cv'); ctx = cv.getContext('2d');
    W.addEventListener('resize', function () { resize(); });
    root.querySelector('#tb-en').onchange = function (e) { showEn = e.target.checked; try { W.localStorage.setItem('teut-en', showEn ? '1' : '0'); } catch (x) { } renderHud(); root.querySelector('#tb-side-speed').innerHTML = speedHTML(); if (H) side('hunt'); if (state === 'card' || state === 'menu' || cardHTML) refreshCard(); };
    root.querySelector('#tb-pause').onclick = togglePause;
    root.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('tb-spd')) setSpeed(+e.target.value); });
    root.querySelector('#tb-help').onclick = function () { if (state === 'play') togglePause(); if (cardHTML && !cardIsHelp) prevCard = cardHTML; card(helpCard, true); };
    Array.prototype.forEach.call(root.querySelectorAll('[data-d]'), function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); steer(b.dataset.d); });
    });
    // keyboard
    D.addEventListener('keydown', function (e) {
      var k = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' }[e.key];
      if (k && (state === 'play' || state === 'ready')) { e.preventDefault(); steer(k); }
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && S) togglePause();
      if ((e.key === 'Enter' || e.key === ' ') && state === 'card') { var fa = D.activeElement; if (fa && fa.tagName === 'BUTTON' && root.contains(fa)) return; e.preventDefault(); var b = root.querySelector('#tb-card .go'); if (b) b.click(); }
    });
    // swipe
    var sx = 0, sy = 0;
    cv.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 24) { steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
      e.preventDefault();
    }, { passive: false });
    var st = root.querySelector('.tb-stage'), tx0 = 0, ty0 = 0;
    st.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
    st.addEventListener('touchmove', function (e) {
      if (!H || e.target === cv || (state !== 'play' && state !== 'ready')) return;
      var dx = e.touches[0].clientX - tx0, dy = e.touches[0].clientY - ty0;
      if (Math.abs(dx) + Math.abs(dy) > 24) { steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }
      e.preventDefault();
    }, { passive: false });
    D.addEventListener('visibilitychange', function () { if (D.hidden && H && (state === 'play' || state === 'ready')) togglePause(); });
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
    if (H) { renderHuntHud(); return; }
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
    Array.prototype.forEach.call(el.querySelectorAll('.go'), function (go) {
      go.onclick = function () {
        var act = go.dataset.act; cardHTML = ''; el.hidden = true;
        if (act === 'new') startClassic();
        if (act === 'play') { state = 'ready'; readyT = 1.4; renderHud(); }
        if (act === 'close') { var pc = prevCard; prevCard = null; if (!S) { card(menuCard); } else if (state === 'paused') { state = prevState || 'play'; } else if (pc) { card(pc); } }
        if (act === 'hunt') startHunt();
        if (act === 'camp') startCampaign();
        if (act === 'hplay') { state = 'ready'; hReadyT = 2.2; renderHud(); }
        if (act === 'menu') { prevCard = null; toMenu(); }
      };
    });
    var h = el.querySelector('.helpbtn'); if (h) h.onclick = function () { if (cardHTML && !cardIsHelp) prevCard = cardHTML; card(helpCard, true); };
  }
  function goals() { return '<ul class="tb-goals"><li>🪙 ' + T(X.goal1) + '</li><li>🦅 ' + T(X.goal3) + '</li><li>⚠️ ' + T(X.goal2) + '</li></ul>'; }
  function menuCard() {
    return '<h2>' + T(X.title) + '</h2><p class="lead">' + (showEn ? 'You are a Roman legionary in the forests of Germania. Choose how to play:' : '') + '</p>' +
      '<div class="tb-modes">' +
      modeBtn('new', '🪙', XH.mClassic, 'September, AD 9. Collect coins over three days, grab the eagle standards and escape four Germanic tribes.') +
      modeBtn('hunt', '🦅', XH.mHunt, 'AD 15–16. Race one warrior to a lost eagle while the forest board turns. Up always runs north.', '<span class="tb-mrec">' + recLine('hunt').replace(/<\/?p[^>]*>/g, '') + '</span>') +
      modeBtn('camp', '⚔️', XH.mCamp, 'Classic days and eagle hunts in turn, a little harder each time, for one score.', '<span class="tb-mrec">' + recLine('camp').replace(/<\/?p[^>]*>/g, '') + '</span>') +
      '</div>' + speedHTML() + '<div class="tb-row"><button type="button" class="tb-btn helpbtn">' + T(X.help) + '</button></div>' +
      '<p class="small">Arrow keys or WASD · swipe or use the buttons on a phone · P pauses. Classic saves nothing; Eagle Hunt and Campaign keep your best scores on this device.</p>';
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
    if (gameMode === 'camp') return campOverCard(noteRecords());
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
      '<h3>' + T(XH.mHunt) + '</h3>' + huntRules() +
      '<ul><li>Each round is a new forest with a fair route: if you run the best way, you reach the eagle first. Rounds bring a bigger forest, a faster warrior and more frequent turns; from round III the board can also turn halfway around (180°).</li>' +
      '<li>Just before a turn, the board’s edge glows and an arrow shows which way it will turn. The red <b>N</b> plaque and the compass rose turn with the board.</li>' +
      '<li>An eagle scores 100, plus 50 for each round after the first, plus a bonus for a quick run. If you are caught you lose a helmet and replay the round in a new forest. Your best score, round and streak (<i>victoriae</i>, eagles in a row without being caught) are kept on this device.</li></ul>' +
      '<h3>' + T(XH.mCamp) + '</h3><p>Classic days and eagle hunts take turns, each faster than the one before, for one score. Three helmets last the whole campaign, and every eagle you recover wins back one you lost.</p>' +
      '<h3>' + T(X.history) + '</h3>' +
      '<p>In September AD 9, Publius Quinctilius Varus, governor of Germania, led the 17th, 18th and 19th legions with auxiliary troops and a long baggage train through wooded, hilly country. Arminius, a prince of the Cherusci who had served as a commander of Roman auxiliaries and held Roman citizenship, had secretly united several tribes. Over three or four days of rain and ambushes the army was destroyed. Estimates of the dead run from about 15,000 to 20,000.</p>' +
      '<p>The site is widely identified with Kalkriese, near Osnabrück in Germany, where a narrow passage runs between the Kalkriese hill and a large bog. Excavations there since 1987 have found a Germanic turf wall, Roman weapons and armor, a famous iron face mask, and many coins, including copper coins countermarked VAR. Some scholars still debate whether Kalkriese was the main battlefield.</p>' +
      '<p><b>The four tribes in the game</b> are ones ancient writers link to the battle or its aftermath:</p><ul>' + TRIBES.map(function (t) { return '<li><b>' + t.name + '</b>: ' + t.note + '</li>'; }).join('') + '</ul>' +
      '<p class="small">Their colors are for play only. Ancient sources: Velleius Paterculus 2.117–120; Cassius Dio 56.18–24; Tacitus, <i>Annals</i> 1.55–71; Suetonius, <i>Augustus</i> 23. The name <i>saltus Teutoburgiensis</i> comes from Tacitus, <i>Annals</i> 1.60.</p>' +
      '<h3>Latin in this game</h3><table class="gl">' + Object.keys(X).concat(Object.keys(XH).map(function (k) { return 'h:' + k; })).map(function (k) { var w = k.indexOf('h:') === 0 ? XH[k.slice(2)] : X[k]; return '<tr><td class="la">' + w[0] + '</td><td>' + w[1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="close">' + T(['Redi', 'Back']) + '</button>' + (S ? '<button type="button" class="tb-btn go" data-act="menu">' + T(XH.modes) + '</button>' : '') + '</div>';
  }

  // ======================================================================
  // Venatio aquilae (Eagle Hunt) and Expeditio (Campaign). The rules live in TeutHunt above;
  // this part draws the turning board and runs the rounds. Classic play above is unchanged.
  // ======================================================================
  var HUNT = W.TeutHunt, H = null, gameMode = null, HT = 20, hbg = null, hReadyT = 0, hEndT = 0, hrain = [], prevCard = null;
  var RM = false; try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var XH = {
    mClassic: ['Tres dies', 'Classic'], mHunt: ['Venatio aquilae', 'Eagle Hunt'], mCamp: ['Expeditio', 'Campaign'],
    round: ['Certamen', 'Round'], streak: ['Victoriae', 'Win streak'], stage: ['Gradus', 'Stage'], eagles: ['Aquilae', 'Eagles'],
    won: ['Aquilam recepisti!', 'You recovered the eagle!'], foe: ['Cave Germanum!', 'Beware the German!'],
    turns: ['Silva vertitur!', 'The forest turns!'], seek: ['Germanicus aquilas quaerit.', 'Germanicus is looking for the eagles.'],
    north: ['Septentrio', 'North'], east: ['Oriens', 'East'], south: ['Meridies', 'South'], west: ['Occidens', 'West'],
    over: ['Finis', 'The end'], modes: ['Modi', 'Modes'], run: ['Curre!', 'Run!']
  };
  var WHERE = ['at the top', 'on the right', 'at the bottom', 'on the left'];
  var PADC = { up: ['N', XH.north], right: ['E', XH.east], down: ['S', XH.south], left: ['W', XH.west] };
  var ARROW = { up: '▲', down: '▼', left: '◀', right: '▶' };

  // ---------- records (this device only) ----------
  var REC_KEY = 'trb-teutoburg-v1';
  function loadRec() { try { var o = JSON.parse(W.localStorage.getItem(REC_KEY) || '{}'); if (o && typeof o === 'object') { o.hunt = o.hunt || {}; o.camp = o.camp || {}; return o; } } catch (e) { } return { hunt: {}, camp: {} }; }
  function saveRec(o) { try { W.localStorage.setItem(REC_KEY, JSON.stringify(o)); } catch (e) { } }
  function noteRecords() { // returns which records this run just beat
    var R = loadRec(), news = {};
    if (gameMode === 'hunt') {
      var h = R.hunt;
      if (S.score > (h.score || 0)) { h.score = S.score; news.score = 1; }
      if (S.cleared > (h.round || 0)) { h.round = S.cleared; news.round = 1; }
      if (S.bestStreak > (h.streak || 0)) { h.streak = S.bestStreak; news.streak = 1; }
    } else if (gameMode === 'camp') {
      var c = R.camp;
      if (S.score > (c.score || 0)) { c.score = S.score; news.score = 1; }
      if (S.stage > (c.stage || 0)) { c.stage = S.stage; news.stage = 1; }
    }
    saveRec(R); return news;
  }
  function recLine(which, news) {
    var R = loadRec(), r = R[which], nb = function (k) { return news && news[k] ? ' <span class="tb-new">' + (showEn ? 'new best' : '★') + '</span>' : ''; };
    var lab = function (w) { return '<span class="la">' + w[0] + '</span>' + (showEn ? ' <span class="en">(' + w[1].toLowerCase() + ')</span>' : ''); };
    if (which === 'hunt') {
      if (!r.score && !r.round) return '<p class="tb-rec">' + (showEn ? 'No records yet on this device.' : '—') + '</p>';
      return '<p class="tb-rec">🏆 ' + lab(X.score) + ' <b>' + (r.score || 0) + '</b>' + nb('score') + ' · ' + lab(XH.round) + ' <b>' + (r.round ? roman(r.round) : '—') + '</b>' + nb('round') + ' · ' + lab(XH.streak) + ' <b>' + (r.streak || 0) + '</b>' + nb('streak') + '</p>';
    }
    if (!r.score) return '<p class="tb-rec">' + (showEn ? 'No records yet on this device.' : '—') + '</p>';
    return '<p class="tb-rec">🏆 ' + lab(X.score) + ' <b>' + r.score + '</b>' + nb('score') + ' · ' + lab(XH.stage) + ' <b>' + roman(r.stage || 1) + '</b>' + nb('stage') + '</p>';
  }

  // ---------- modes ----------
  function setPad(compass) {
    var pad = root.querySelector('.tb-pad'); pad.classList.toggle('compass', !!compass);
    Array.prototype.forEach.call(pad.querySelectorAll('[data-d]'), function (b) {
      var d = b.dataset.d;
      b.innerHTML = compass ? '<span>' + PADC[d][0] + '</span><small>' + PADC[d][1][0] + '</small>' : '<span>' + ARROW[d] + '</span><small>' + X[d][0] + '</small>';
      b.setAttribute('aria-label', compass ? PADC[d][1][1] : X[d][1]);
    });
  }
  function side(which) {
    root.querySelector('#tb-side-c').hidden = which !== 'classic';
    var h = root.querySelector('#tb-side-h'); h.hidden = which !== 'hunt'; if (which === 'hunt') h.innerHTML = huntSide();
  }
  function useClassicBoard() { H = null; cv.classList.remove('hunt'); setPad(false); side('classic'); resize(); placeFlash(); }
  function startClassic() { gameMode = 'classic'; useClassicBoard(); newGame(); }
  function toMenu() { S = null; H = null; gameMode = null; state = 'menu'; useClassicBoard(); hudClear(); card(menuCard); }
  function hudClear() { ['#h-score', '#h-lives', '#h-day', '#h-words'].forEach(function (s) { root.querySelector(s).innerHTML = ''; }); }
  function startHunt() {
    gameMode = 'hunt'; learned = [];
    S = { score: 0, lives: 3, day: 1, loops: 0, round: 1, streak: 0, bestStreak: 0, cleared: 0, eagles: 0 };
    beginHuntRound(); state = 'card'; card(huntIntro);
  }
  function startCampaign() {
    gameMode = 'camp'; useClassicBoard();
    S = { score: 0, lives: 3, day: 1, loops: 0, round: 1, streak: 0, bestStreak: 0, cleared: 0, eagles: 0, stage: 1 }; learned = [];
    loadMaze(); resetActors(); bonus = null; S.eaten = 0; state = 'card';
    var dc = dayCard(); card(function () { return campIntro() + dc(); });
  }
  function beginHuntRound() {
    H = HUNT.newRound(S.round, (Math.random() * 2147483646 | 0) + 1);
    player = H.hero; hbg = null; cv.classList.add('hunt'); setPad(true); side('hunt'); huntResize(); renderHud();
    state = 'ready'; hReadyT = 2.2;
  }
  // Campaign: a Classic day is done, so an eagle hunt comes next
  function campaignAfterDay() {
    S.stage++; noteRecords(); beginHuntRound(); state = 'card';
    card(function () { return winCard(false) + huntNextHTML(); });
  }
  function campaignAfterHunt(pts, helm) {
    S.stage++; S.day++; noteRecords(); useClassicBoard(); loadMaze(); resetActors(); bonus = null; S.eaten = 0; state = 'card';
    var dc = dayCard();
    card(function () { return '<p class="win">' + T(XH.won) + ' <b>+' + pts + '</b>' + (helm ? ' · +1 🪖' : '') + '</p>' + dc(); });
  }

  // ---------- one round ----------
  function huntUpdate(dt) {
    anim += dt;
    if (state === 'ready') { hReadyT -= dt; H.anim += dt; if (hReadyT <= 0) { state = 'play'; flash(XH.run[0], XH.run[1], 'gold'); } return; }
    if (state === 'dying' || state === 'hwon') {
      hEndT -= dt; H.anim += dt; H.glow = Math.max(0, H.glow - dt);
      if (hEndT <= 0) { if (state === 'dying') afterCaught(); else afterWin(); }
      return;
    }
    if (state !== 'play') return;
    var ev = HUNT.step(H, dt, { instant: RM });
    ev.forEach(function (e) {
      if (e === 'turn') {
        placeFlash(); flash(XH.turns[0], 'North is now ' + WHERE[H.q] + '.', 'turn');
        if (RM) { var st = root.querySelector('.tb-stage'); st.classList.remove('tflash'); void st.offsetWidth; st.classList.add('tflash'); }
      } else if (e === 'win') {
        var pts = HUNT.points(S.round, H.elapsed, H.par); S.score += pts; S.streak++; S.eagles++; S.cleared = Math.max(S.cleared, S.round);
        S.bestStreak = Math.max(S.bestStreak, S.streak); S.lastPts = pts;
        state = 'hwon'; hEndT = 1.3; H.glow = 1;
        flash(XH.won[0] + ' +' + pts, XH.won[1], 'gold');
        if (gameMode === 'hunt') noteRecords();
      } else if (e === 'caught') {
        S.lives--; S.streak = 0; state = 'dying'; hEndT = 1.5;
        flash(X.caught[0], X.caught[1], 'red');
      }
    });
    var hk = S.score + '|' + S.lives + '|' + S.round + '|' + S.streak;
    if (hk !== hudCache) { renderHud(); hudCache = hk; }
  }
  function afterWin() {
    if (gameMode === 'camp') {
      var helm = S.lives < 3; if (helm) S.lives++;
      S.round = HUNT.nextRound(S.round, true); campaignAfterHunt(S.lastPts, helm); return;
    }
    S.round = HUNT.nextRound(S.round, true); beginHuntRound();
  }
  function afterCaught() {
    if (S.lives <= 0) { var news = noteRecords(); state = 'card'; card(gameMode === 'camp' ? campOverCard(news) : huntOverCard(news)); renderHud(); return; }
    S.round = HUNT.nextRound(S.round, false); beginHuntRound();
  }

  // ---------- drawing the turning board ----------
  function huntResize() {
    if (!H) return;
    var st = root.querySelector('.tb-stage'), w = st.clientWidth, h = st.clientHeight, U = H.m.S + 2;
    HT = Math.max(9, Math.floor((Math.min(w, h) - 8) / U));
    dpr = Math.min(2, W.devicePixelRatio || 1);
    var px = HT * U; cv.style.width = px + 'px'; cv.style.height = px + 'px';
    cv.width = Math.round(px * dpr); cv.height = Math.round(px * dpr); hbg = null; placeFlash();
  }
  // during the hunt, messages go beside or above the board so they never hide the N
  function placeFlash() {
    var f = root.querySelector('#tb-flash'), s = f.style; s.top = s.left = s.bottom = s.maxWidth = '';
    if (!H) return;
    var st = root.querySelector('.tb-stage'), side = cv.offsetWidth, gv = (st.clientHeight - side) / 2, gh = (st.clientWidth - side) / 2;
    if (gv >= 70) s.top = Math.max(4, gv / 2 - 32) + 'px';
    else if (gh >= 150) { s.top = '42%'; s.left = (gh / 2) + 'px'; s.maxWidth = (gh - 16) + 'px'; }
    else if (H.q === 0) { s.top = 'auto'; s.bottom = '1rem'; }
  }
  function huntBackground() {
    var m = H.m, U = m.S + 2, px = HT * U, B = m.S * HT;
    hbg = D.createElement('canvas'); hbg.width = Math.round(px * dpr); hbg.height = hbg.width;
    var c = hbg.getContext('2d'); c.scale(dpr, dpr);
    var r = rnd(H.seed % 2147483646 + 1), i, x, y;
    // oak frame
    var fg = c.createLinearGradient(0, 0, px, px); fg.addColorStop(0, '#5a3f24'); fg.addColorStop(1, '#2e2012');
    c.fillStyle = fg; c.fillRect(0, 0, px, px);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1;
    for (i = 0; i < 26; i++) { var o = r() * px; c.beginPath(); c.moveTo(o, 0); c.lineTo(o + (r() - 0.5) * 30, HT); c.moveTo(o, px); c.lineTo(o + (r() - 0.5) * 30, px - HT); c.moveTo(0, o); c.lineTo(HT, o + (r() - 0.5) * 30); c.moveTo(px, o); c.lineTo(px - HT, o + (r() - 0.5) * 30); c.stroke(); }
    c.save(); c.translate(HT, HT); c.beginPath(); c.rect(0, 0, B, B); c.clip();
    c.fillStyle = '#5b4a33'; c.fillRect(0, 0, B, B);
    for (i = 0; i < B * B / 260; i++) { c.fillStyle = r() < 0.5 ? 'rgba(40,30,18,.25)' : 'rgba(120,100,70,.18)'; c.beginPath(); c.ellipse(r() * B, r() * B, 2 + r() * 5, 1 + r() * 2.5, r() * 3, 0, Math.PI * 2); c.fill(); }
    for (i = 0; i < m.S; i++) { c.fillStyle = 'rgba(70,90,95,.35)'; c.beginPath(); c.ellipse(r() * B, r() * B, 5 + r() * 9, 3 + r() * 4, 0, 0, Math.PI * 2); c.fill(); }
    for (y = 0; y < m.S; y++) for (x = 0; x < m.S; x++) {
      if (m.t[y * m.S + x] !== 1) continue;
      var cx = x * HT + HT / 2, cy = y * HT + HT / 2;
      c.fillStyle = '#1f3a22'; c.fillRect(x * HT - 1, y * HT - 1, HT + 2, HT + 2);
      for (var k = 0; k < 3; k++) {
        var rr = HT * (0.32 + r() * 0.22), ox = (r() - 0.5) * HT * 0.6, oy = (r() - 0.5) * HT * 0.6;
        var g = c.createRadialGradient(cx + ox - rr * 0.3, cy + oy - rr * 0.3, rr * 0.1, cx + ox, cy + oy, rr);
        var dark = r() < 0.5; g.addColorStop(0, dark ? '#3f6b3a' : '#4d7a3f'); g.addColorStop(1, dark ? '#1c3620' : '#244426');
        c.fillStyle = g; c.beginPath(); c.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2); c.fill();
      }
    }
    c.restore();
    c.strokeStyle = 'rgba(243,223,163,.6)'; c.lineWidth = Math.max(1.5, HT * 0.09); c.strokeRect(HT - 1, HT - 1, B + 2, B + 2);
  }
  function hx(v) { return (v + 1.5) * HT; }
  function upright(x, y, a, fn) { ctx.save(); ctx.translate(x, y); ctx.rotate(-a); fn(); ctx.restore(); }
  function drawRose(x, y, R, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
    ctx.strokeStyle = '#f3dfa3'; ctx.lineWidth = Math.max(1, R * 0.04);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2); ctx.stroke();
    for (var i = 7; i >= 0; i--) {
      var long = i % 2 === 0, len = long ? R : R * 0.5, w = R * (long ? 0.16 : 0.11);
      ctx.save(); ctx.rotate(i * Math.PI / 4);
      ctx.fillStyle = i === 0 ? '#c0392b' : '#f3dfa3'; ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(w, 0); ctx.lineTo(0, 0); ctx.fill();
      ctx.fillStyle = i === 0 ? '#7d1d14' : '#a8874a'; ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(-w, 0); ctx.lineTo(0, 0); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#2e2012'; ctx.beginPath(); ctx.arc(0, 0, R * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawHero(cx, cy, r, dir, mouth, k) { // the legionary, seen from above, facing where he runs on the board
    var ang = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir || 'up'];
    ctx.save(); ctx.translate(cx, cy);
    if (k != null) { ctx.rotate(anim * 12); ctx.globalAlpha = Math.max(0, k); }
    ctx.rotate(ang);
    var chomp = (Math.sin(mouth) + 1) / 2 * 0.55 + 0.08;
    ctx.fillStyle = '#a3222a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, chomp, Math.PI * 2 - chomp); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f3dfa3'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,200,200,.55)'; ctx.lineWidth = Math.max(1, r * 0.12); ctx.beginPath(); ctx.arc(0, 0, r * 0.7, chomp + 0.2, Math.PI * 2 - chomp - 0.2); ctx.stroke();
    ctx.fillStyle = '#9aa3a8'; ctx.beginPath(); ctx.arc(-r * 0.08, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6c7479'; ctx.fillRect(-r * 0.62, -r * 0.3, r * 0.22, r * 0.6);
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(-r * 0.13, -r * 0.4, r * 0.1, r * 0.8);
    ctx.restore();
  }
  function drawWarrior(r, col, look, run) { // drawn upright on screen at the origin
    var wv = Math.sin(run * 10) * r * 0.12;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0, r * 0.9, r * 0.9, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -r * 0.1, r, Math.PI, 0);
    ctx.lineTo(r, r * 0.85); ctx.lineTo(r * 0.5, r * 0.65 + wv); ctx.lineTo(0, r * 0.85); ctx.lineTo(-r * 0.5, r * 0.65 - wv); ctx.lineTo(-r, r * 0.85); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,5,.7)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke();
    ctx.fillStyle = '#7a5230'; ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.25, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b8bfc4'; ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.25, r * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a3420'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.beginPath(); ctx.moveTo(r * 0.6, r * 0.8); ctx.lineTo(r * 0.8, -r * 1.05); ctx.stroke();
    ctx.fillStyle = '#c9ced2'; ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 1.35); ctx.lineTo(r * 0.7, -r * 1.02); ctx.lineTo(r * 0.9, -r * 1.02); ctx.fill();
    var ex = look[0] * r * 0.15, ey = look[1] * r * 0.15;
    [-0.3, 0.2].forEach(function (o) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o * r, -r * 0.2, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1d2320'; ctx.beginPath(); ctx.arc(o * r + ex, -r * 0.2 + ey, r * 0.1, 0, Math.PI * 2); ctx.fill(); });
  }
  function drawTurnArrow(x, y, R, dq, k) { // warns which way the board is about to turn
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(20,15,10,.55)'; ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f3dfa3'; ctx.fillStyle = '#f3dfa3'; ctx.lineWidth = Math.max(2, R * 0.16); ctx.lineCap = 'round';
    var span = dq === 2 ? Math.PI * 1.5 : Math.PI * 1.1, s = -Math.PI / 2 - span / 2, e = s + span, cw = dq !== -1;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.8, s, e); ctx.stroke();
    var tip = cw ? e : s, tx = Math.cos(tip) * R * 0.8, ty = Math.sin(tip) * R * 0.8, dirA = tip + (cw ? Math.PI / 2 : -Math.PI / 2), hs = R * 0.42;
    ctx.beginPath(); ctx.moveTo(tx + Math.cos(dirA) * hs, ty + Math.sin(dirA) * hs);
    ctx.lineTo(tx + Math.cos(dirA + 2.3) * hs, ty + Math.sin(dirA + 2.3) * hs); ctx.lineTo(tx + Math.cos(dirA - 2.3) * hs, ty + Math.sin(dirA - 2.3) * hs); ctx.closePath(); ctx.fill();
    if (dq === 2) { ctx.font = 'bold ' + Math.round(R * 0.55) + 'px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('180°', 0, R * 0.05); }
    ctx.restore();
  }
  function drawHunt() {
    if (!H) return;
    if (!hbg) huntBackground();
    var U = H.m.S + 2, px = HT * U, c0 = px / 2, a = H.ang, sc = 1 / (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)));
    var warnK = H.warned && state === 'play' ? Math.min(1, (HUNT.WARN - H.rotT) / 0.25) : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, px, px);
    ctx.save(); ctx.translate(c0, c0); ctx.rotate(a); ctx.scale(sc, sc); ctx.translate(-c0, -c0);
    ctx.drawImage(hbg, 0, 0, px, px);
    if (warnK) { ctx.strokeStyle = 'rgba(243,223,163,' + (0.5 + 0.5 * Math.sin(H.anim * 18)) * warnK + ')'; ctx.lineWidth = HT * 0.35; ctx.strokeRect(HT * 0.2, HT * 0.2, px - HT * 0.4, px - HT * 0.4); }
    drawRose(c0, c0, px * 0.17, Math.min(0.85, 0.2 + 0.6 * H.glow + (state === 'ready' ? 0.3 : 0)));
    // N plaque on the north edge of the board
    var pw = HT * 1.9, ph = HT * 0.86, pulse = state === 'ready' ? 0.5 + 0.5 * Math.sin(H.anim * 6) : 0;
    ctx.fillStyle = '#8c1d2c'; ctx.strokeStyle = pulse ? 'rgba(255,240,190,' + (0.6 + 0.4 * pulse) + ')' : '#f3dfa3'; ctx.lineWidth = Math.max(1.5, HT * 0.1);
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(c0 - pw / 2, HT * 0.07, pw, ph, HT * 0.2); else ctx.rect(c0 - pw / 2, HT * 0.07, pw, ph); ctx.fill(); ctx.stroke();
    // eagle standard, with a soft glow so it is easy to find
    var ex = hx(H.eagle.x), ey = hx(H.eagle.y), gl = 1 + Math.sin(H.anim * 4) * 0.12;
    var gg = ctx.createRadialGradient(ex, ey, 1, ex, ey, HT * 1.3 * gl); gg.addColorStop(0, 'rgba(255,225,130,.75)'); gg.addColorStop(1, 'rgba(255,225,130,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(ex, ey, HT * 1.3 * gl, 0, Math.PI * 2); ctx.fill();
    upright(ex, ey, a, function () { var lift = state === 'hwon' ? -HT * 0.6 * (1 - hEndT / 1.3) : 0; drawEagle(0, lift, HT * 0.52 * (state === 'hwon' ? 1.3 : 1)); });
    // the warrior stays upright on screen; his eyes look where he runs on screen
    var fp = HUNT.pos(H.foe), fv = HUNT.DIRS[H.foe.dir] || [0, 0], sv = HUNT.rotVec(fv[0], fv[1], a), tribe = TRIBES[S.round % TRIBES.length];
    upright(hx(fp.x), hx(fp.y), a, function () { drawWarrior(HT * 0.46, tribe.color, sv, H.foe.moving ? H.anim : 0); });
    var hp = HUNT.pos(H.hero);
    drawHero(hx(hp.x), hx(hp.y), HT * 0.45, H.hero.face, H.hero.mouth, state === 'dying' ? hEndT / 1.5 : null);
    ctx.restore();
    // compass letters, always upright: a big N on its plaque, small E S W
    function at(bx, by) { var v = HUNT.rotVec(bx - c0, by - c0, a); return [c0 + v[0] * sc, c0 + v[1] * sc]; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var n = at(c0, HT * 0.5); ctx.font = 'bold ' + Math.round(HT * 0.78) + 'px Georgia, serif'; ctx.fillStyle = '#ffe9a8'; ctx.fillText('N', n[0], n[1] + HT * 0.04);
    ctx.font = 'bold ' + Math.round(HT * 0.55) + 'px Georgia, serif'; ctx.fillStyle = 'rgba(243,223,163,.75)';
    [['E', px - HT * 0.5, c0], ['S', c0, px - HT * 0.5], ['W', HT * 0.5, c0]].forEach(function (l) { var p = at(l[1], l[2]); ctx.fillText(l[0], p[0], p[1]); });
    // rain, in screen space
    if (!RM) {
      ctx.strokeStyle = 'rgba(190,210,225,.3)'; ctx.lineWidth = 1;
      while (hrain.length < 50) hrain.push({ x: Math.random() * px, y: Math.random() * px, v: 300 + Math.random() * 200 });
      ctx.beginPath(); hrain.forEach(function (d) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3, d.y + 10); if (state !== 'paused') { d.y += d.v / 60; d.x -= 1; } if (d.y > px) { d.y = -10; d.x = Math.random() * px; } }); ctx.stroke();
    }
    if (warnK && H.nextDq) drawTurnArrow(c0, c0, HT * 1.5, H.nextDq, warnK);
    var bannerK = state === 'ready' ? Math.max(0, Math.min(1, (hReadyT - 0.9) / 0.4)) : 0; // fades out so the forest is clear before you run
    if (bannerK > 0) {
      ctx.save(); ctx.globalAlpha = bannerK;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, c0 - HT * 1.6, px, HT * 3.2);
      ctx.fillStyle = '#f3dfa3'; ctx.font = 'bold ' + Math.round(HT * 1.05) + 'px Georgia, serif';
      ctx.fillText(XH.round[0] + ' ' + roman(S.round) + (showEn ? '  ·  Round ' + S.round : ''), c0, c0 - HT * 0.6);
      ctx.font = Math.round(HT * 0.62) + 'px Georgia, serif'; ctx.fillStyle = '#fff';
      ctx.fillText(X.goal3[0] + '  ·  ▲ = N' + (showEn ? ' (north is ' + WHERE[H.q] + ')' : ''), c0, c0 + HT * 0.7);
      ctx.restore();
    }
  }

  // ---------- cards and panels ----------
  function modeBtn(act, icon, name, en, extra) {
    return '<button type="button" class="tb-mode go" data-act="' + act + '"><i aria-hidden="true">' + icon + '</i><span class="tb-mname"><b class="la">' + name[0] + '</b>' + (showEn ? '<span class="en">' + name[1] + '</span>' : '') + '</span>' + (showEn ? '<small>' + en + '</small>' : '') + (extra || '') + '</button>';
  }
  function huntRules() {
    function li(icon, la, more) { return '<li><i aria-hidden="true">' + icon + '</i><div>' + T(la) + (showEn ? '<p>' + more + '</p>' : '') + '</div></li>'; }
    return '<ul class="tb-hrules">' + li('🦅', X.goal3, 'Reach the eagle standard before he reaches you.') +
      li('⚠️', XH.foe, 'One warrior chases you, a little faster every second.') +
      li('🧭', XH.turns, 'The board turns now and then. <b>Up always runs north</b>, toward the red N on the board’s edge, wherever it is on screen. Right runs east, down south, left west.') + '</ul>';
  }
  function huntIntro() {
    return '<h2>' + T(XH.mHunt) + '</h2><p class="la big">' + XH.seek[0] + '</p>' +
      (showEn ? '<p class="gloss">' + XH.seek[1] + '</p><p>AD 15 and 16. Germanicus led Roman armies back into Germania and recovered two of the eagles lost with Varus: one found among the Bructeri (Tacitus, <i>Annals</i> 1.60), one dug up from a grove after a leader of the Marsi told where it lay (<i>Annals</i> 2.25). Race through the forest to the eagle before a Germanic warrior catches you.</p>' : '') +
      huntRules() + (showEn ? '<p class="small">Arrow keys or W A S D; on a phone, the N E S W buttons (N always on top) or a swipe (up = north). Each round brings a bigger forest, a faster warrior and more turns. If he catches you, you lose a helmet and try a new forest.</p>' : '') +
      recLine('hunt') + '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="hplay">' + T(X.start) + '</button><button type="button" class="tb-btn helpbtn">' + T(X.help) + '</button></div>';
  }
  function huntNextHTML() {
    return '<h2>' + T([XH.round[0] + ' ' + roman(S.round) + ' · ' + XH.mHunt[0], 'Round ' + S.round + ' · Eagle Hunt']) + '</h2>' + huntRules() +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="hplay">' + T(X.start) + '</button></div>';
  }
  function campIntro() {
    return '<h2>' + T(XH.mCamp) + '</h2>' + (showEn ? '<p>Classic days and eagle hunts take turns, each a little harder than the last, for one score. You have three helmets for the whole campaign; each eagle you recover wins back a lost one.</p>' : '') + recLine('camp') + '<hr class="tb-hr">';
  }
  function huntOverCard(news) {
    return '<h2>' + T(XH.over) + '</h2><p class="score">' + X.score[0] + ': <b>' + S.score + '</b> · ' + XH.eagles[0] + ': <b>' + S.eagles + '</b></p>' +
      recLine('hunt', news) +
      (showEn ? '<p>Germanicus recovered two of the three lost eagles in AD 15 and 16. The last came back in AD 41, when Publius Gabinius won it from the Chauci (Cassius Dio 60.8).</p>' : '') +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="hunt">' + T(X.again) + '</button><button type="button" class="tb-btn go" data-act="menu">' + T(XH.modes) + '</button></div>';
  }
  function campOverCard(news) {
    return '<h2>' + T(XH.over) + '</h2><p class="score">' + X.score[0] + ': <b>' + S.score + '</b> · ' + XH.stage[0] + ' <b>' + roman(S.stage) + '</b> · ' + XH.eagles[0] + ': <b>' + S.eagles + '</b></p>' +
      recLine('camp', news) + '<p class="la big">Quintili Vare, legiones redde!</p>' +
      (showEn ? '<p class="gloss">“Quinctilius Varus, give me back my legions!” (Suetonius, <i>Augustus</i> 23).</p>' : '') + wordList() +
      '<div class="tb-row"><button type="button" class="tb-btn big go" data-act="camp">' + T(X.again) + '</button><button type="button" class="tb-btn go" data-act="menu">' + T(XH.modes) + '</button></div>';
  }
  function huntSide() {
    var keys = [['up', '▲ W'], ['right', '▶ D'], ['down', '▼ S'], ['left', '◀ A']];
    return '<h3>' + T(XH.mHunt) + '</h3><ul class="tb-compass">' + keys.map(function (k) {
      return '<li><kbd>' + k[1] + '</kbd><b>' + PADC[k[0]][0] + '</b><span class="la">' + PADC[k[0]][1][0] + '</span>' + (showEn ? ' <span class="en">' + PADC[k[0]][1][1] + '</span>' : '') + '</li>';
    }).join('') + '</ul>' + (showEn ? '<p class="small">The keys follow the board, not the screen: ▲ always runs toward the red N.</p>' : '') +
      '<h3>' + T(['Gloria summa', 'Your best']) + '</h3>' + recLine(gameMode === 'camp' ? 'camp' : 'hunt') +
      (showEn ? '<p class="small">AD 15–16: Germanicus’ armies recovered two lost eagles (Tacitus, <i>Annals</i> 1.60, 2.25).</p>' : '');
  }
  function renderHuntHud() {
    root.querySelector('#h-score').innerHTML = '<span class="la">' + X.score[0] + '</span> <b>' + S.score + '</b>';
    root.querySelector('#h-lives').innerHTML = '<span class="la">' + X.lives[0] + '</span> ' + Array(Math.max(0, S.lives) + 1).join('🪖');
    root.querySelector('#h-day').innerHTML = '<span class="la">' + XH.round[0] + '</span> <b>' + roman(S.round) + '</b>';
    root.querySelector('#h-words').innerHTML = gameMode === 'camp' ? '<span class="la">' + XH.stage[0] + '</span> <b>' + roman(S.stage) + '</b>' : '<span class="la">' + XH.streak[0] + '</span> <b>' + S.streak + '</b>';
  }

  // ---------- loop ----------
  function frame(ts) {
    var t = ts / 1000, dt = Math.min(0.05, t - (last || t)); last = t;
    if (S && state !== 'paused' && state !== 'card') { if (H) huntUpdate(dt * GS); else if (gameMode !== 'hunt') update(dt * GS); }
    if (H) drawHunt(); else if (S && gameMode !== 'hunt') draw(); else drawIdle(t);
    W.requestAnimationFrame(frame);
  }
  function drawIdle(t) { anim = t; if (!bg) drawBackground(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0); }

  loadMaze(); shell(); card(menuCard); W.requestAnimationFrame(frame);
  // links such as /games/teutoburg/#eagle-hunt open that mode's start card
  try { var hsh = (W.location.hash || '').toLowerCase(); if (hsh === '#eagle-hunt') startHunt(); else if (hsh === '#campaign') startCampaign(); } catch (e) { }
  W.__teut = { get S() { return S; }, get state() { return state; }, get coins() { return coins; }, get player() { return player; }, get ghosts() { return ghosts; }, update: update, newGame: newGame, steer: steer, setState: function (s) { state = s; },
    get H() { return H; }, get mode() { return gameMode; }, huntUpdate: function (dt) { huntUpdate(dt); }, startHunt: startHunt, startCampaign: startCampaign, startClassic: startClassic, toMenu: toMenu, dayWon: function () { dayWon(); } };
})(typeof window !== 'undefined' ? window : {}, typeof document !== 'undefined' ? document : { getElementById: function () { return null; } });
