/* Siege: knock down the defenders with ancient siege engines, at sieges from history and literature, from Homer's Troy
   to Rome in AD 537, plus one later machine for comparison, the trebuchet. Levels in siege-levels.js; physics in physics.js.
   Greek words are Koine (the Greek of the New Testament), labelled as such; Latin words are in dictionary form. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('sg'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var PH = W.SiegePhysics;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var TR = function (s) { return W.grTranslit ? W.grTranslit(s) : ''; };
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- the machines ----------
  var ENG = {
    sling: { name: 'Sling', orig: 'σφενδόνη', origL: 'g', gloss: 'sling', power: 'Muscle: your arm, made longer by two cords', when: 'long before catapults', who: 'shepherds and armies everywhere', shot: 'stone',
      vmin: 8, vmax: 24, amin: -5, amax: 55, ly: 1.6, proj: { kind: 'stone', r: 0.2, density: 4.5 }, bars: [1, 2, 1],
      text: 'A pouch on two cords. The slinger whirls it round and lets one cord go, and the stone flies off far faster than a throw by hand. Slingers fought at sieges long before there were catapults: Homer’s Locrians fight with slings, and Greek sling bullets of lead were sometimes cast with a word on them, such as ΔΕΞΑΙ, “take this!”',
      tip: 'Light and quick. Good against people and thin wood, useless against stone.' },
    gastra: { name: 'Gastraphetes', orig: 'γαστραφέτης', origL: 'g', gloss: 'belly-bow', power: 'Tension: a big bow bends', when: 'from about 400 BC', who: 'Greeks', shot: 'bolt',
      vmin: 12, vmax: 30, amin: -5, amax: 40, ly: 1.3, proj: { kind: 'bolt', w: 0.9, h: 0.1, density: 6 }, bars: [2, 1, 1],
      text: 'A large crossbow. The soldier braced its curved stock against his belly and leaned on it to draw the string, which is how it got its name. All its power comes from the bow bending, like an ordinary bow, only stronger. It was probably the first catapult, made for Dionysius I of Syracuse around 399 BC.',
      tip: 'Fast and flat: aim straight at the target. Its light bolt breaks wood, but bounces off stone.' },
    oxybeles: { name: 'Oxybeles', orig: 'ὀξυβελής', origL: 'g', gloss: '“sharp-dart shooter”', power: 'Torsion: two arms in twisted skeins', when: 'from about 350 BC', who: 'Macedonians and Greeks', shot: 'bolt',
      vmin: 13, vmax: 31, amin: -5, amax: 42, ly: 1.5, proj: { kind: 'bolt', w: 1.0, h: 0.1, density: 5.5 }, bars: [3, 1, 1],
      text: 'The first torsion engines shot bolts, not stones. Instead of a bow, each of its two arms is set in a bundle of twisted sinew or hair. When the string is winched back the bundles twist even tighter, and twisting stores far more energy than bending. Philip II of Macedon used engines like this at Perinthus and Byzantium.',
      tip: 'Faster and flatter than the gastraphetes, with a heavier bolt. Still no use against stone.' },
    polybolos: { name: 'Polybolos', orig: 'πολυβόλος', origL: 'g', gloss: '“many-thrower”', power: 'Torsion, with a chain that reloads it', when: 'described about 200 BC', who: 'Dionysius of Alexandria, an engineer', shot: 'bolt', multi: 3,
      vmin: 12, vmax: 29, amin: -5, amax: 40, ly: 1.5, proj: { kind: 'bolt', w: 0.8, h: 0.08, density: 6 }, bars: [2, 1, 1],
      text: 'A repeating catapult. Turning a winch drove a chain that pulled back the string, dropped a new bolt from a box on top, and shot it, again and again, without anyone re-aiming. Philo of Byzantium describes one he saw at Rhodes.',
      tip: 'Every shot is three bolts, one after another, along the same path.' },
    scorpio: { name: 'Scorpio', orig: 'scorpio', origL: 'l', gloss: '“scorpion”, for its sting', power: 'Torsion: two arms in twisted skeins', when: 'Roman, from the 1st century BC', who: 'every Roman legion', shot: 'bolt',
      vmin: 14, vmax: 33, amin: -5, amax: 40, ly: 1.3, proj: { kind: 'bolt', w: 0.8, h: 0.1, density: 6 }, bars: [3, 1, 1],
      text: 'A small torsion bolt-shooter that two men could carry and work. Its iron-tipped bolt flew fast and straight, and it was accurate enough to hit the same spot again and again. Later writers, like Procopius, call a bolt-shooter like this a ballista, so the names can be confusing.',
      tip: 'The fastest, flattest shot in the game. Aim straight at people.' },
    ballista: { name: 'Ballista', orig: 'ballista', origL: 'l', gloss: 'from Greek βάλλειν, “to throw”', power: 'Torsion: two arms in twisted skeins', when: 'from about 340 BC', who: 'Greeks, then Romans', shot: 'stone',
      vmin: 12, vmax: 30, amin: -5, amax: 50, ly: 1.7, proj: { kind: 'stone', r: 0.26, density: 4 }, bars: [3, 2, 2],
      text: 'Each of its two arms is set in a tight bundle of twisted sinew, rope or hair. A winch pulls the arms back, twisting the bundles even more, and when they are let go they spring forward. Twisting stores much more energy than bending a bow, so torsion engines could throw real stones. The Greeks called stone-throwers lithoboloi; the Romans called them ballistae.',
      tip: 'Strong and fairly flat. Its stone smashes wood and can crack stone blocks.' },
    onager: { name: 'Onager', orig: 'onager', origL: 'l', gloss: '“wild donkey”, for its kick', power: 'Torsion: one arm in one twisted skein', when: 'described in the 4th century AD', who: 'Romans', shot: 'stone',
      vmin: 10, vmax: 24, amin: 25, amax: 75, ly: 2.3, proj: { kind: 'stone', r: 0.38, density: 3.6 }, bars: [3, 3, 3],
      text: 'A single upright arm, set in one big twisted skein, with a sling on the end. When the arm is released it slams into a padded crossbar and the machine bucks, which is why soldiers named it after the wild donkey. The historian Ammianus Marcellinus, who fought at Amida, describes it.',
      tip: 'It lobs heavy stones in a high arc, over walls and mounds. Aim high.' },
    falarica: { name: 'Falarica', orig: 'falarica', origL: 'l', gloss: 'a fire spear', power: 'Muscle and fire: a burning spear, thrown', when: 'described by Livy at Saguntum, 219 BC', who: 'the Saguntines, and Turnus in Virgil’s Aeneid', shot: 'fire', fire: true,
      vmin: 9, vmax: 21, amin: 0, amax: 60, ly: 1.8, proj: { kind: 'bolt', w: 1.3, h: 0.12, density: 4 }, bars: [1, 2, 1],
      text: 'Not a machine but a weapon thrown by hand: a shaft of fir with a long iron head, the shaft wrapped in tow smeared with pitch and set alight. It shows what attackers feared most: fire, against engines and towers made of wood.',
      tip: 'Hit wood and it catches fire, and the fire spreads from beam to beam. Stone, brick and earth do not burn.' },
    trebuchet: { name: 'Trebuchet', orig: 'trebuchet', origL: '', gloss: 'an Old French word', power: 'Gravity: a falling weight swings a long lever', when: 'not ancient: the counterweight kind from the 12th century AD', who: 'medieval armies', shot: 'stone', late: true,
      vmin: 10, vmax: 25, amin: 30, amax: 75, ly: 5, proj: { kind: 'stone', r: 0.62, density: 3.6 }, bars: [3, 3, 4],
      text: 'Not a Greek or Roman machine at all. A trebuchet is a long beam on a pivot. In the first kind, the traction trebuchet, a team of people pulled ropes on the short end; it was used in China by the 4th century BC and reached the Mediterranean in the 6th century AD. The counterweight trebuchet, from the 12th century, drops a huge box of earth or stones instead. Gravity, not twisted rope, does the work, so it can throw the heaviest stones of all.',
      tip: 'Very heavy stones in a high arc. Even stone towers crumble.' }
  };
  var ENG_ORDER = ['sling', 'gastra', 'oxybeles', 'polybolos', 'scorpio', 'ballista', 'onager', 'falarica', 'trebuchet'];

  // ---------- the sieges (siege-levels.js) ----------
  var CH = W.SiegeLevels.chapters, LV = W.SiegeLevels.levels;
  function chOf(L) { for (var k = 0; k < CH.length; k++) if (CH[k].id === L.ch) return k; return 0; }
  var WORDS = { // word shown when something breaks, by the level's language
    g: { wood: ['ξύλον', 'wood'], stone: ['λίθος', 'stone'], target: ['στρατιώτης', 'soldier'], fire: ['πῦρ', 'fire'] },
    l: { wood: ['lignum', 'wood'], stone: ['lapis', 'stone'], target: ['miles', 'soldier'], fire: ['ignis', 'fire'], brick: ['later', 'brick'] }
  };

  // ---------- save ----------
  var KEY = 'trb-siege-v1', st = { done: {}, words: true, guide: 'short' };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function opened(i) { return true; } // every siege can be played in any order
  function engUnlocked(e) { return true; }

  // ---------- game state ----------
  var cv = $('canvas'), c = cv.getContext('2d'), dpr = 1, Wd = 0, Ht = 0, S = 20, gy = 0, X0 = -1.5, VIEW = 44;
  var G = null; // the current level
  function fit() {
    dpr = Math.min(2, W.devicePixelRatio || 1); Wd = cv.clientWidth; Ht = cv.clientHeight;
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr);
    var need = G ? G.need : 13;
    S = Math.min(Wd / VIEW, (Ht - 50) / need); X0 = -1.5; gy = Ht - Math.max(62, Ht * 0.1); // the ground sits above the aiming buttons
  }
  W.addEventListener('resize', fit);
  function sx(x) { return (x - X0) * S; }
  function sy(y) { return gy - y * S; }
  function wx(px) { return px / S + X0; }
  function wy(py) { return (gy - py) / S; }

  function makeBuilder(world, L) {
    var B = {
      body: function (o) { var b = world.add(o); return b; },
      wood: function (x, y, w, h) { return B.body({ x: x, y: y + h / 2, w: w, h: h, density: 0.7, friction: 0.7, data: { mat: 'wood', hp: 40 + 30 * w * h } }); },
      stone: function (x, y, w, h) { return B.body({ x: x, y: y + h / 2, w: w, h: h, density: 2.2, friction: 0.8, data: { mat: 'stone', hp: 280 * Math.max(0.4, w * h) } }); },
      brick: function (x, y, w, h) { return B.body({ x: x, y: y + h / 2, w: w, h: h, density: 1.8, friction: 0.8, data: { mat: 'brick', hp: 150 * Math.max(0.4, w * h) } }); },
      earth: function (x, y, w, h) { return B.body({ x: x, y: y + h / 2, w: w, h: h, density: 1.6, friction: 0.95, data: { mat: 'earth', hp: 1500 * Math.max(0.4, w * h) } }); },
      hide: function (x, y, w, h) { return B.body({ x: x, y: y + h / 2, w: w, h: h, density: 0.5, friction: 0.9, data: { mat: 'hide', hp: 1e9 } }); },
      frame: function (x, y, w, h) { B.wood(x - w / 2 + 0.15, y, 0.3, h); B.wood(x + w / 2 - 0.15, y, 0.3, h); B.wood(x, y + h, w + 0.3, 0.3); },
      target: function (x, y) { G.targets++; return B.body({ x: x, y: y + 0.36, w: 0.72, h: 0.72, density: 0.9, friction: 0.6, data: { mat: 'target', hp: 5, side: L.lang } }); },
      fixed: function (x, y, w, h, kind) { return B.body({ static: true, x: x, y: y + h / 2, w: w, h: h, friction: 0.8, data: { mat: kind } }); }
    };
    return B;
  }

  function newLevel(i, engOverride) {
    var L = LV[i], world = new PH.World({ gravity: -10, iterations: 12 });
    G = { i: i, L: L, world: world, eng: engOverride || L.eng, shots: L.shots, used: 0, targets: 0, killed: 0, phase: 'settle', t: 0, fired: 0, proj: null, projs: [], queue: 0, fx: [], floats: [], saidWord: {}, aim: { a: 0, p: 0.6 }, arm: 0, over: false, words: [], acc: 0, base: L.base || 0 };
    var E = ENG[G.eng]; G.aim.a = clamp(G.eng === 'onager' || G.eng === 'trebuchet' ? 50 : G.eng === 'falarica' ? 30 : G.base ? 4 : 12, E.amin, E.amax);
    if (G.base) world.add({ static: true, x: -1.35, y: G.base / 2, w: 9.3, h: G.base, friction: 0.8, data: { mat: L.baseKind || 'agger' } }); // your own ramp or wall
    // ground: everything left of the water line, or all of it
    var wl = L.water || 200;
    world.add({ static: true, x: (wl - 60) / 2, y: -0.5, w: wl + 60, h: 1, friction: 0.8, data: { mat: 'ground' } });
    L.build(makeBuilder(world, L));
    var mx = 0, my = 0; world.bodies.forEach(function (b) { if (b.data.mat === 'ground') return; var bb = b.aabb(); mx = Math.max(mx, bb[2]); my = Math.max(my, bb[3]); });
    VIEW = Math.max(30, mx + 3) + 1.5; G.right = VIEW - 1.5 + 0.2; G.need = Math.max(9, my + 3.5, ENG[G.eng].ly + G.base + 3); fit();
    world.onImpulse = hit;
    G.t = 0; G.phase = 'settle';
    hud(); say('');
  }

  function damage(b, other, v) {
    if (!b.im || b.dead || !b.data.hp || b.data.proj) return;
    var m = other.im ? other.m : b.m, e = 0.5 * Math.min(m, 6) * v * v;
    if (G.phase === 'settle') return; // the structure finding its feet at the start
    b.data.hp -= e;
    if (b.data.hp <= 0) breakBody(b);
  }
  function hit(a, b, v, vr) {
    if ((a.data.proj || b.data.proj) && vr > v) v = 0.5 * (v + vr); // a shot striking at a slant still does damage
    if (a.data.fire) ignite(b); if (b.data.fire) ignite(a);
    damage(a, b, v); damage(b, a, v);
    if (a.data.proj && b.data.mat !== 'target') crush(b, a, v); else if (b.data.proj && a.data.mat !== 'target') crush(a, b, v);
  }
  // a heavy blow on a beam lying on a defender knocks him out too, so fallen planks can't make a shield
  function crush(b, proj, v) {
    var w = G.world; if (v < 4) return;
    for (var k in w.arb) { var A = w.arb[k], o = A.a === b ? A.b : A.b === b ? A.a : null; if (o && o.data.mat === 'target') damage(o, proj, v * 0.7); }
  }
  // fire: wood burns and falls apart after a while, and sets the wood touching it alight; defenders caught by it run
  function ignite(b) {
    if (!b || b.dead || !b.im || !G || G.phase === 'settle') return;
    var m = b.data.mat; if (m !== 'wood' && m !== 'target') return;
    if (b.data.burn > 0) return;
    b.data.burn = m === 'wood' ? 2.2 : 0.8; b.data.sp = 0.45;
    if (m === 'wood') { G.lastHit = { x: b.p.x, y: b.p.y }; word('fire'); }
  }
  function burning() { return G.world.bodies.some(function (b) { return !b.dead && b.data.burn > 0; }); }
  function spread(b) {
    var w = G.world;
    for (var k in w.arb) { var A = w.arb[k]; if (A.a === b) ignite(A.b); else if (A.b === b) ignite(A.a); }
  }

  function breakBody(b) {
    if (b.dead) return;
    G.world.remove(b);
    var col = b.data.mat === 'wood' ? '#a8763e' : b.data.mat === 'stone' ? '#b9b2a3' : '#f3dfa3';
    var n = RM ? 4 : 10;
    for (var i = 0; i < n; i++) G.fx.push({ x: b.p.x + (Math.random() - 0.5) * (b.w || b.r * 2), y: b.p.y + (Math.random() - 0.5) * (b.h || b.r * 2), vx: (Math.random() - 0.5) * 6, vy: Math.random() * 6, life: 0.9, col: col, s: b.data.mat === 'target' ? 0.18 : 0.14 });
    if (b.data.mat === 'target') { G.killed++; G.floats.push({ x: b.p.x, y: b.p.y + 0.6, t: '★', life: 1.2 }); }
    word(b.data.mat);
    hud();
  }

  function word(mat) {
    if (!st.words || G.saidWord[mat]) return;
    var wd = (mat === 'target' && G.L.targetWord) || WORDS[G.L.lang][mat]; if (!wd) return;
    G.saidWord[mat] = 1;
    G.floats.push({ x: G.lastHit ? G.lastHit.x : 30, y: (G.lastHit ? G.lastHit.y : 4) + 1.2, t: wd[0], life: 1.8, w: 1 });
    say(wd[0], wd[1]);
    logWord(wd[0], wd[1]);
  }
  function logWord(f, e) { if (G.words.indexOf(f) < 0) G.words.push(f); try { if (W.TRBWords) W.TRBWords.log('siege', G.L.lang, f, e); } catch (er) { } }

  // ---------- firing ----------
  function launchVel() { var E = ENG[G.eng], sp = E.vmin + (E.vmax - E.vmin) * G.aim.p, a = G.aim.a * Math.PI / 180; return { x: Math.cos(a) * sp, y: Math.sin(a) * sp }; }
  function launchPt() { var E = ENG[G.eng]; return { x: 2.4, y: E.ly + G.base }; }
  function isFire() { return !!(ENG[G.eng].fire || G.L.fire); }
  function windNow() { var w = G.L.wind; if (!w) return 0; return typeof w === 'number' ? w : w[Math.min(G.used, w.length - 1)]; }
  function shoot() {
    var E = ENG[G.eng], v = launchVel(), p = launchPt(), P = E.proj, o = { x: p.x, y: p.y, vx: v.x, vy: v.y, density: P.density, friction: 0.5, data: { proj: 1, mat: 'proj', fire: isFire() } };
    if (P.kind === 'bolt') { o.w = P.w; o.h = P.h; o.a = Math.atan2(v.y, v.x); } else o.r = P.r;
    G.proj = G.world.add(o); G.proj.data.kind = P.kind; G.proj.data.free = true; G.projs.push(G.proj); G.arm = 1;
  }
  function fire() {
    if (!G || G.phase !== 'aim' || G.shots <= 0) return;
    G.wind = windNow(); shoot();
    G.queue = (ENG[G.eng].multi || 1) - 1; G.qT = 0.22;
    G.shots--; G.used++; G.phase = 'fly'; G.fired = 0; G.saidWord = {};
    G.lastShot = { a: G.aim.a, p: G.aim.p, path: [] };
    hud();
  }

  // ---------- update ----------
  var DT = 1 / 120;
  function step(dt) {
    var w = G.world;
    G.t += dt; G.arm = Math.max(0, G.arm - dt * 2.5);
    if (G.queue > 0 && G.phase === 'fly') { G.qT -= dt; if (G.qT <= 0) { shoot(); G.queue--; G.qT = 0.22; } }
    G.projs.forEach(function (q) {
      if (q.dead || !q.data.free) return;
      if (G.wind) q.v.x += G.wind * dt;
      if (q.data.kind === 'bolt') { var pv = q.v; if (Math.hypot(pv.x, pv.y) > 4) { q.a = Math.atan2(pv.y, pv.x); q.w0 = 0; } }
    });
    w.step(dt);
    if (G.proj) {
      var pp = G.proj.p; G.lastHit = { x: pp.x, y: pp.y };
      if (G.lastShot && G.fired < 6 && (G.lastShot.path.length === 0 || Math.hypot(pp.x - G.lastShot.path[G.lastShot.path.length - 1][0], pp.y - G.lastShot.path[G.lastShot.path.length - 1][1]) > 0.6)) G.lastShot.path.push([pp.x, pp.y]);
    }
    G.projs.forEach(function (q) { if (q.data.free && Object.keys(w.arb).some(function (k) { var A = w.arb[k]; return (A.a === q && A.b.data.mat !== 'ground') || (A.b === q && A.a.data.mat !== 'ground'); })) { q.data.free = false; } });
    // fire
    w.bodies.forEach(function (b) {
      if (b.dead || !(b.data.burn > 0)) return;
      b.data.burn -= dt; b.data.sp -= dt;
      if (b.data.mat === 'wood' && b.data.sp <= 0) { b.data.sp = 0.45; spread(b); }
      if (!RM && Math.random() < dt * 6) G.fx.push({ x: b.p.x + (Math.random() - 0.5) * 0.5, y: b.p.y + 0.3, vx: (Math.random() - 0.3) * 0.6 + (G.wind || 0) * 0.3, vy: 1.2 + Math.random(), life: 1.1, col: 'rgba(70,60,55,.55)', s: 0.22 });
      if (b.data.burn <= 0) { G.lastHit = { x: b.p.x, y: b.p.y }; breakBody(b); }
    });
    // out of bounds: fell off the world or into the sea
    var wl = G.L.water;
    w.bodies.forEach(function (b) {
      if (!b.im || b.dead) return;
      var gone = b.p.y < -4 || b.p.x > G.right || b.p.x < -10 || (wl && b.p.x > wl && b.p.y < (b.r || b.h / 2 || 0.3) - 0.2 - 0.3);
      // a defender pushed off the field, or knocked flat on his side, is out of the fight
      if (!gone && b.data.mat === 'target' && G.phase !== 'settle' && Math.abs(b.a) > 1.1) { breakBody(b); return; }
      if (gone) { if (b.data.mat === 'target') { splash(b); breakBody(b); } else { if (wl && b.p.x > wl) splash(b); b.dead = true; } }
    });
    G.fx.forEach(function (f) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= 14 * dt; }); G.fx = G.fx.filter(function (f) { return f.life > 0; });
    G.floats.forEach(function (f) { f.life -= dt; f.y += dt * 0.7; }); G.floats = G.floats.filter(function (f) { return f.life > 0; });
    // phases
    if (G.phase === 'settle' && G.t > 0.8) { G.phase = 'aim'; hud(); } // the Fire button is ready for the first shot
    if (G.phase === 'fly') {
      G.fired += dt;
      var moving = w.bodies.some(function (b) { return b.im && !b.dead && (Math.hypot(b.v.x, b.v.y) > 0.25 || Math.abs(b.w0) > 0.4); });
      if ((G.fired > 1.2 && !moving && G.queue <= 0 && !burning()) || G.fired > 12) endShot();
    }
    if ((G.phase === 'aim' || G.phase === 'fly' || G.phase === 'burn') && G.targets && G.killed >= G.targets) { G.phase = 'won'; G.endT = 0.8; hud(); }
    if (G.phase === 'burn' && !burning()) { G.phase = 'lost'; G.endT = 0.8; }
    if (G.phase === 'won' || G.phase === 'lost') { G.endT -= dt; if (G.endT <= 0 && !G.over) { G.over = true; result(); } }
  }
  function splash(b) { for (var i = 0; i < (RM ? 3 : 8); i++) G.fx.push({ x: b.p.x + (Math.random() - 0.5), y: 0.1, vx: (Math.random() - 0.5) * 3, vy: 3 + Math.random() * 4, life: 0.8, col: '#d8eef8', s: 0.12 }); }
  function endShot() {
    G.projs.forEach(function (p) { if (!p.dead) { G.fx.push({ x: p.p.x, y: p.p.y, vx: 0, vy: 1, life: 0.5, col: '#ddd', s: 0.3 }); G.world.remove(p); } });
    G.proj = null; G.projs = []; G.queue = 0; G.prevShot = G.lastShot;
    if (G.killed >= G.targets) { G.phase = 'won'; G.endT = 0.8; }
    else if (G.shots <= 0) { if (burning()) G.phase = 'burn'; else { G.phase = 'lost'; G.endT = 0.8; } }
    else G.phase = 'aim';
    hud();
  }

  // ---------- drawing ----------
  function draw() {
    var L = G.L;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, L.sky[0]); g.addColorStop(1, L.sky[1]); c.fillStyle = g; c.fillRect(0, 0, Wd, Ht);
    // distant hills and sea
    c.fillStyle = L.hills; c.beginPath(); c.moveTo(0, gy);
    for (var px = 0; px <= Wd + 10; px += 10) { var x = wx(px); c.lineTo(px, sy(1.5 + 1.2 * Math.sin(x * 0.17 + G.i) + 0.6 * Math.sin(x * 0.41))); }
    c.lineTo(Wd, gy); c.fill();
    if (L.moon) { c.fillStyle = 'rgba(255,248,220,.9)'; c.beginPath(); c.arc(sx(4), sy(G.need - 2.2), S * 1.1, 0, 7); c.fill(); c.fillStyle = 'rgba(255,248,220,.12)'; c.beginPath(); c.arc(sx(4), sy(G.need - 2.2), S * 2.2, 0, 7); c.fill(); }
    if (L.sea) { c.fillStyle = '#3f86b8'; c.fillRect(sx(36), sy(0.9), Wd, S * 0.9); }
    // ground and water
    var wl = L.water;
    c.fillStyle = L.ground; c.fillRect(0, gy, wl ? sx(wl) : Wd, Ht - gy);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, gy, wl ? sx(wl) : Wd, 3);
    if (wl) { c.fillStyle = '#2f78ad'; c.fillRect(sx(wl), sy(0.15), Wd, Ht); c.fillStyle = 'rgba(255,255,255,.35)'; for (var i = 0; i < 12; i++) c.fillRect(sx(wl + 1 + ((i * 3.7 + G.t * 0.6) % 30)), sy(0.1 + (i % 3) * 0.05), S * 0.8, 2); }
    // aiming line
    if (G.phase === 'aim') drawAim();
    if (G.prevShot && G.prevShot.path.length > 1 && G.phase === 'aim') { c.fillStyle = 'rgba(255,255,255,.55)'; G.prevShot.path.forEach(function (q) { c.beginPath(); c.arc(sx(q[0]), sy(q[1]), Math.max(1.5, S * 0.05), 0, 7); c.fill(); }); }
    G.world.bodies.forEach(function (b) { if (!b.dead && !b.im && b.data.mat !== 'ground') drawBody(b); });
    drawEngine(c, G.eng, sx(0), sy(G.base), S, G.arm, G.aim.a);
    G.world.bodies.forEach(function (b) { if (!b.dead && b.im) drawBody(b); });
    G.world.bodies.forEach(function (b) { if (!b.dead && b.data.burn > 0) drawFlame(b); });
    G.projs.forEach(function (b) { if (!b.dead && b.data.fire) drawFlame(b, 0.6); });
    G.fx.forEach(function (f) { c.globalAlpha = clamp(f.life * 2, 0, 1); c.fillStyle = f.col; c.fillRect(sx(f.x), sy(f.y), f.s * S, f.s * S); c.globalAlpha = 1; });
    G.floats.forEach(function (f) {
      c.globalAlpha = clamp(f.life, 0, 1); c.textAlign = 'center';
      c.font = (f.w ? Math.round(S * 0.9) + 'px "Gentium Book Plus",Georgia,serif' : 'bold ' + Math.round(S * 0.9) + 'px system-ui');
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(f.t, sx(f.x), sy(f.y)); c.fillStyle = f.w ? '#fff4c8' : '#f3d36a'; c.fillText(f.t, sx(f.x), sy(f.y)); c.globalAlpha = 1;
    });
  }
  function drawAim() {
    var p = launchPt(), v = launchVel(), T = st.guide === 'full' ? 4 : 0.35 * flightTime(p, v), wd = windNow();
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (var t = 0.05; t < T; t += 0.06) { var x = p.x + v.x * t + 0.5 * wd * t * t, y = p.y + v.y * t - 5 * t * t; if (y < 0) break; c.beginPath(); c.arc(sx(x), sy(y), Math.max(1.6, S * 0.06), 0, 7); c.fill(); }
  }
  function drawFlame(b, k) {
    k = k || 1; var X = sx(b.p.x), Y = sy(b.p.y), t = G.t * 14 + b.id * 1.7, r = S * 0.5 * k;
    var lean = (G.wind || 0) * 0.08 * S;
    for (var j = 0; j < 3; j++) {
      var ox = (j - 1) * r * 0.7, h = r * (1.6 + 0.5 * Math.sin(t + j * 2));
      c.fillStyle = j === 1 ? 'rgba(255,214,90,.9)' : 'rgba(240,110,40,.85)';
      c.beginPath(); c.moveTo(X + ox - r * 0.5, Y); c.quadraticCurveTo(X + ox + lean * 0.5, Y - h * 0.6, X + ox + lean, Y - h); c.quadraticCurveTo(X + ox + r * 0.2, Y - h * 0.4, X + ox + r * 0.5, Y); c.fill();
    }
  }
  function flightTime(p, v) { var a = -5, b = v.y, cc = p.y, d = b * b - 4 * a * cc; return (-b - Math.sqrt(d)) / (2 * a); }
  function drawBody(b) {
    var X = sx(b.p.x), Y = sy(b.p.y), m = b.data.mat;
    c.save(); c.translate(X, Y); c.rotate(-b.a);
    if (b.shape === 'c') {
      var r = b.r * S;
      { c.fillStyle = '#8f8a80'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.fillStyle = '#b9b3a8'; c.beginPath(); c.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }
    } else {
      var w = b.w * S, h = b.h * S;
      if (m === 'target') drawSoldier(w / 2, b);
      else if (m === 'wood') { c.fillStyle = '#a8763e'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = 'rgba(90,55,20,.55)'; c.lineWidth = 1; c.beginPath(); if (w > h) { c.moveTo(-w / 2 + 2, -h * 0.1); c.lineTo(w / 2 - 2, -h * 0.1); } else { c.moveTo(-w * 0.1, -h / 2 + 2); c.lineTo(-w * 0.1, h / 2 - 2); } c.stroke(); c.strokeStyle = '#6b4520'; c.strokeRect(-w / 2, -h / 2, w, h); }
      else if (m === 'brick') { c.fillStyle = '#b5654a'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = 'rgba(240,220,200,.55)'; c.lineWidth = 1; c.beginPath(); for (var by = -h / 2 + h / 3; by < h / 2 - 1; by += h / 3) { c.moveTo(-w / 2, by); c.lineTo(w / 2, by); } c.stroke(); c.strokeStyle = '#7a3a28'; c.strokeRect(-w / 2, -h / 2, w, h); }
      else if (m === 'earth') { c.fillStyle = '#8a6a44'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(40,25,10,.25)'; for (var q = 0; q < 6; q++) c.fillRect(-w / 2 + ((q * 37) % 10) / 10 * w, -h / 2 + ((q * 53) % 10) / 10 * h * 0.9, 3, 3); c.strokeStyle = '#5a4428'; c.strokeRect(-w / 2, -h / 2, w, h); }
      else if (m === 'hide') { c.fillStyle = '#c9a27a'; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.quadraticCurveTo(w, 0, w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.quadraticCurveTo(-w, 0, -w / 2, -h / 2); c.fill(); c.fillStyle = 'rgba(90,60,30,.45)'; c.beginPath(); c.arc(0, -h * 0.15, w * 0.3, 0, 7); c.arc(0, h * 0.25, w * 0.25, 0, 7); c.fill(); }
      else if (m === 'terrace' || m === 'wall') { c.fillStyle = m === 'wall' ? '#b9b2a3' : '#bba98a'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = 'rgba(90,80,65,.45)'; c.lineWidth = 1; c.beginPath(); for (var ty = -h / 2 + S * 0.5; ty < h / 2; ty += S * 0.5) { c.moveTo(-w / 2, ty); c.lineTo(w / 2, ty); } c.stroke(); if (m === 'wall') { c.fillStyle = '#b9b2a3'; for (var tx = -w / 2 + S * 0.2; tx < w / 2 - S * 0.3; tx += S * 0.8) c.fillRect(tx, -h / 2 - S * 0.3, S * 0.4, S * 0.3); } c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(-w / 2, -h / 2, w, 3); }
      else if (m === 'rock') { c.fillStyle = '#9a8f7e'; c.beginPath(); c.moveTo(-w / 2 - S * 0.4, h / 2); c.lineTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 + S * 0.6, h / 2); c.closePath(); c.fill(); c.strokeStyle = 'rgba(60,50,40,.35)'; c.lineWidth = 1.5; c.beginPath(); for (var ry = -h / 2 + S * 0.6; ry < h / 2; ry += S * 0.7) { c.moveTo(-w / 2 + S * 0.2, ry); c.lineTo(w / 2 - S * 0.4, ry + S * 0.15); } c.stroke(); }
      else if (m === 'agger') { c.fillStyle = '#9a7a4e'; c.beginPath(); c.moveTo(-w / 2, h / 2); c.lineTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 + S * 0.8, h / 2); c.closePath(); c.fill(); c.strokeStyle = 'rgba(70,45,20,.5)'; c.lineWidth = 2; c.beginPath(); for (var ay = -h / 2 + S * 0.7; ay < h / 2; ay += S * 0.7) { c.moveTo(-w / 2, ay); c.lineTo(w / 2, ay); } c.stroke(); }
      else if (m === 'stone') { c.fillStyle = '#b9b2a3'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-w / 2, -h / 2, w, h * 0.15); c.strokeStyle = '#7d766a'; c.lineWidth = 1.2; c.strokeRect(-w / 2, -h / 2, w, h); }
      else if (m === 'hull') { c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(-w / 2 - S * 0.6, -h / 2); c.lineTo(w / 2 + S * 0.8, -h / 2 - S * 0.3); c.lineTo(w / 2 - S * 0.4, h / 2 + S * 0.2); c.lineTo(-w / 2 + S * 0.3, h / 2 + S * 0.2); c.closePath(); c.fill(); c.fillStyle = '#c94c3a'; c.fillRect(-w / 2, -h * 0.1, w, h * 0.15); }
      else if (m === 'hill' || m === 'mound') { c.fillStyle = m === 'hill' ? '#6d8a4a' : '#a9814f'; c.beginPath(); c.moveTo(-w / 2 - S * 1.5, h / 2); c.quadraticCurveTo(-w / 2, -h / 2 - S * 0.2, 0, -h / 2); c.quadraticCurveTo(w / 2, -h / 2 - S * 0.2, w / 2 + S * 1.5, h / 2); c.closePath(); c.fill(); }
      else if (m === 'proj') { c.fillStyle = '#6b4a2a'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = '#555'; c.beginPath(); c.moveTo(w / 2, -h); c.lineTo(w / 2 + S * 0.25, 0); c.lineTo(w / 2, h); c.fill(); c.fillStyle = '#e8e0d0'; c.fillRect(-w / 2, -h * 1.4, S * 0.18, h * 2.8); }
      else if (m === 'ground') { }
      if (b.data.hp && b.data.hp0 && b.data.hp < b.data.hp0 * 0.5) { c.strokeStyle = 'rgba(40,30,20,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-w * 0.3, -h * 0.4); c.lineTo(0, 0); c.lineTo(w * 0.2, h * 0.4); c.stroke(); }
    }
    c.restore();
  }
  function drawSoldier(r, b) {
    var side = b.data.side, L = G.L, hurt = b.data.hp0 && b.data.hp < b.data.hp0 * 0.6;
    if (L.dummy) { // a straw practice target
      c.fillStyle = '#d9c27a'; c.fillRect(-r, -r, r * 2, r * 2); c.strokeStyle = '#9a8040'; c.lineWidth = 1; c.strokeRect(-r, -r, r * 2, r * 2);
      c.strokeStyle = '#b8322a'; c.lineWidth = Math.max(1.5, r * 0.18); c.beginPath(); c.arc(0, 0, r * 0.65, 0, 7); c.stroke(); c.fillStyle = '#b8322a'; c.beginPath(); c.arc(0, 0, r * 0.2, 0, 7); c.fill();
      return;
    }
    c.fillStyle = '#e2b48a'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = L.helm || '#b8863a'; c.beginPath(); c.arc(0, -r * 0.1, r * 1.02, Math.PI, 0); c.fill(); c.fillRect(-r * 1.02, -r * 0.15, r * 2.04, r * 0.18);
    if (L.crest) { c.fillStyle = '#b8322a'; c.fillRect(-r * 0.12, -r * 1.35, r * 0.24, r * 0.4); }
    c.fillStyle = '#222'; if (hurt) { c.font = Math.round(r) + 'px system-ui'; c.textAlign = 'center'; c.fillText('✕ ✕', 0, r * 0.35); } else { c.beginPath(); c.arc(-r * 0.35, r * 0.15, r * 0.12, 0, 7); c.arc(r * 0.35, r * 0.15, r * 0.12, 0, 7); c.fill(); }
    c.strokeStyle = '#7a4a2a'; c.lineWidth = Math.max(1, r * 0.12); c.beginPath(); c.arc(0, r * 0.55, r * 0.25, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  }
  // the machines, drawn at ground point (X, Y) with scale s px/m; arm 0..1 after firing; angle in degrees
  function drawEngine(c, e, X, Y, s, arm, ang) {
    c.save(); c.translate(X, Y);
    var wood = '#7a5230', dark = '#4a3018', rope = '#d9c9a0';
    function rect(x, y, w, h, col) { c.fillStyle = col; c.fillRect(x * s, -y * s - h * s, w * s, h * s); }
    function wheel(x, r) { c.fillStyle = dark; c.beginPath(); c.arc(x * s, -r * s, r * s, 0, 7); c.fill(); c.fillStyle = wood; c.beginPath(); c.arc(x * s, -r * s, r * s * 0.4, 0, 7); c.fill(); }
    var a = (ang || 0) * Math.PI / 180;
    function person(x, col) { // a standing figure, feet at x
      c.fillStyle = col || '#1f5fa8'; c.fillRect((x - 0.22) * s, -1.25 * s, 0.45 * s, 0.75 * s); c.fillStyle = '#c99a72'; c.fillRect((x - 0.17) * s, -0.5 * s, 0.13 * s, 0.5 * s); c.fillRect((x + 0.08) * s, -0.5 * s, 0.13 * s, 0.5 * s);
      c.fillStyle = '#d9a982'; c.beginPath(); c.arc(x * s, -1.45 * s, 0.2 * s, 0, 7); c.fill();
    }
    if (e === 'sling') {
      person(1.2, '#8a5a2a');
      var sw2 = arm > 0 ? -0.6 : 2.2; // the arm: back and up while aiming, forward after the throw
      c.strokeStyle = '#c99a72'; c.lineWidth = Math.max(2, s * 0.12); c.beginPath(); c.moveTo(1.3 * s, -1.15 * s); var hx = 1.3 + 0.55 * Math.cos(sw2), hy = 1.15 + 0.55 * Math.sin(sw2); c.lineTo(hx * s, -hy * s); c.stroke();
      c.strokeStyle = rope; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx * s, -hy * s); var px2 = hx + 0.5 * Math.cos(sw2 + (arm > 0 ? 0.3 : 0.9)), py2 = hy + 0.5 * Math.sin(sw2 + (arm > 0 ? 0.3 : 0.9)); c.lineTo(px2 * s, -py2 * s); c.stroke();
      if (!arm) { c.fillStyle = '#8f8a80'; c.beginPath(); c.arc(px2 * s, -py2 * s, 0.12 * s, 0, 7); c.fill(); }
    } else if (e === 'falarica') {
      person(1.0, '#7a2338');
      c.save(); c.translate(1.25 * s, -1.6 * s); c.rotate(-a);
      if (!arm) { c.fillStyle = wood; c.fillRect(-0.9 * s, -0.05 * s, 1.6 * s, 0.1 * s); c.fillStyle = '#555'; c.fillRect(0.7 * s, -0.04 * s, 0.4 * s, 0.08 * s); c.fillStyle = 'rgba(240,130,40,.9)'; c.beginPath(); c.arc(0.5 * s, 0, 0.13 * s, 0, 7); c.fill(); }
      c.restore();
      c.strokeStyle = '#c99a72'; c.lineWidth = Math.max(2, s * 0.12); c.beginPath(); c.moveTo(1.1 * s, -1.15 * s); c.lineTo(1.3 * s, -1.6 * s); c.stroke();
    } else if (e === 'oxybeles' || e === 'scorpio' || e === 'polybolos') {
      var dk = e === 'scorpio' ? '#3e2a18' : dark, hx2 = 1.6, hy2 = e === 'scorpio' ? 1.2 : 1.4;
      c.strokeStyle = dk; c.lineWidth = Math.max(2, s * 0.09); c.beginPath(); c.moveTo(1.0 * s, 0); c.lineTo(hx2 * s, -(hy2 - 0.1) * s); c.lineTo(2.2 * s, 0); c.moveTo(hx2 * s, -(hy2 - 0.1) * s); c.lineTo(hx2 * s, 0); c.stroke();
      c.save(); c.translate(hx2 * s, -hy2 * s); c.rotate(-a);
      c.fillStyle = wood; c.fillRect(-1.0 * s, -0.07 * s, 1.8 * s, 0.14 * s);
      c.fillStyle = e === 'scorpio' ? '#8a8f9a' : dk; c.fillRect(0.25 * s, -0.38 * s, 0.22 * s, 0.76 * s); // the frame for the skeins (a metal plate on the scorpio)
      var sw3 = arm > 0 ? 0.08 : -0.45;
      c.strokeStyle = wood; c.lineWidth = Math.max(2, s * 0.08); c.beginPath(); c.moveTo(0.36 * s, -0.33 * s); c.lineTo((0.36 + sw3) * s, -0.8 * s); c.moveTo(0.36 * s, 0.33 * s); c.lineTo((0.36 + sw3) * s, 0.8 * s); c.stroke();
      c.strokeStyle = rope; c.lineWidth = 1; c.beginPath(); c.moveTo((0.36 + sw3) * s, -0.8 * s); c.lineTo((arm > 0 ? 0.36 + sw3 : -0.75) * s, 0); c.lineTo((0.36 + sw3) * s, 0.8 * s); c.stroke();
      if (e === 'polybolos') { c.fillStyle = '#6b4a2a'; c.fillRect(-0.2 * s, -0.5 * s, 0.4 * s, 0.42 * s); c.strokeStyle = '#999'; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(-1.0 * s, 0.12 * s); c.lineTo(0.8 * s, 0.12 * s); c.stroke(); c.setLineDash([]); }
      c.restore();
    } else if (e === 'gastra') {
      // a soldier leaning on a crossbow on a rest
      rect(1.6, 0, 0.12, 1.1, dark);
      c.save(); c.translate(2.0 * s, -1.25 * s); c.rotate(-a);
      c.fillStyle = wood; c.fillRect(-1.0 * s, -0.08 * s, 1.5 * s, 0.16 * s);
      c.strokeStyle = dark; c.lineWidth = Math.max(2, s * 0.08); c.beginPath(); c.arc(0.25 * s, 0, 0.6 * s, -1.2, 1.2); c.stroke();
      c.strokeStyle = rope; c.lineWidth = 1; c.beginPath(); var bk = arm > 0 ? 0.25 : -0.3; c.moveTo(0.25 * s + Math.cos(1.2) * 0.6 * s, -Math.sin(1.2) * 0.6 * s); c.lineTo(bk * s, 0); c.lineTo(0.25 * s + Math.cos(1.2) * 0.6 * s, Math.sin(1.2) * 0.6 * s); c.stroke();
      c.restore();
      // the soldier
      c.fillStyle = '#1f5fa8'; c.fillRect(0.55 * s, -1.25 * s, 0.45 * s, 0.75 * s); c.fillStyle = '#c99a72'; c.fillRect(0.6 * s, -0.5 * s, 0.13 * s, 0.5 * s); c.fillRect(0.85 * s, -0.5 * s, 0.13 * s, 0.5 * s);
      c.fillStyle = '#d9a982'; c.beginPath(); c.arc(0.8 * s, -1.45 * s, 0.2 * s, 0, 7); c.fill(); c.fillStyle = '#c9973a'; c.beginPath(); c.arc(0.8 * s, -1.5 * s, 0.22 * s, Math.PI, 0); c.fill();
    } else if (e === 'ballista') {
      rect(0.4, 0.5, 2.6, 0.25, wood); wheel(0.8, 0.4); wheel(2.6, 0.4);
      rect(1.0, 0.75, 0.15, 0.6, dark); rect(2.2, 0.75, 0.15, 0.6, dark);
      c.save(); c.translate(1.7 * s, -1.7 * s); c.rotate(-a);
      c.fillStyle = wood; c.fillRect(-1.3 * s, -0.09 * s, 2.2 * s, 0.18 * s); // the slider
      c.fillStyle = dark; c.fillRect(0.3 * s, -0.45 * s, 0.25 * s, 0.9 * s); // the frame holding the skeins
      var sw = arm > 0 ? 0.1 : -0.55; // arms swing forward when fired
      c.strokeStyle = wood; c.lineWidth = Math.max(2, s * 0.1); c.beginPath(); c.moveTo(0.42 * s, -0.4 * s); c.lineTo((0.42 + sw) * s, -0.95 * s); c.moveTo(0.42 * s, 0.4 * s); c.lineTo((0.42 + sw) * s, 0.95 * s); c.stroke();
      c.strokeStyle = rope; c.lineWidth = 1; c.beginPath(); c.moveTo((0.42 + sw) * s, -0.95 * s); c.lineTo((arm > 0 ? 0.42 + sw : -0.9) * s, 0); c.lineTo((0.42 + sw) * s, 0.95 * s); c.stroke();
      c.fillStyle = rope; c.fillRect(0.33 * s, -0.42 * s, 0.18 * s, 0.2 * s); c.fillRect(0.33 * s, 0.22 * s, 0.18 * s, 0.2 * s);
      c.restore();
    } else if (e === 'onager') {
      rect(0.2, 0.3, 3, 0.3, wood); wheel(0.6, 0.3); wheel(2.8, 0.3);
      rect(2.6, 0.6, 0.2, 1.4, dark); rect(2.3, 1.9, 0.8, 0.25, '#8a6a42'); // the padded crossbar
      c.fillStyle = rope; c.fillRect(0.9 * s, -0.95 * s, 0.6 * s, 0.35 * s); // the skein
      var th = arm > 0 ? 1.45 : 0.15; // the arm, lying back or swung up against the bar
      c.save(); c.translate(1.2 * s, -0.78 * s); c.rotate(-(Math.PI - th));
      c.fillStyle = wood; c.fillRect(0, -0.08 * s, 2.0 * s, 0.16 * s); c.fillStyle = '#8f8a80'; c.beginPath(); c.arc(2.05 * s, 0, 0.18 * s, 0, 7); c.fill(); c.restore();
    } else if (e === 'trebuchet') {
      rect(0.2, 0, 3.4, 0.3, wood);
      c.strokeStyle = wood; c.lineWidth = Math.max(3, s * 0.18); c.beginPath(); c.moveTo(0.5 * s, -0.3 * s); c.lineTo(1.9 * s, -4.3 * s); c.lineTo(3.3 * s, -0.3 * s); c.stroke();
      var t = arm > 0 ? 1.2 : -0.75; // beam angle
      c.save(); c.translate(1.9 * s, -4.3 * s); c.rotate(-t);
      c.fillStyle = dark; c.fillRect(-4.2 * s, -0.1 * s, 5.4 * s, 0.2 * s);
      c.fillStyle = '#6b6258'; c.fillRect(0.7 * s, 0.1 * s, 0.9 * s, 1.0 * s); // counterweight box hanging from the short end
      c.restore();
      c.fillStyle = '#8f8a80'; if (!arm) { c.beginPath(); c.arc(0.4 * s, -0.5 * s, 0.28 * s, 0, 7); c.fill(); }
    }
    c.restore();
  }

  // ---------- HUD ----------
  function hud() {
    if (!G) return;
    $('#sg-lv').textContent = G.L.name + ' · ' + G.L.when;
    $('#sg-shots').textContent = '🪨 ' + G.shots;
    $('#sg-tg').textContent = '🪖 ' + (G.targets - G.killed);
    var sel = $('#sg-eng'), opts = ENG_ORDER.filter(function (e) { return e === G.eng || engUnlocked(e); });
    sel.innerHTML = opts.map(function (e) { return '<option value="' + e + '"' + (e === G.eng ? ' selected' : '') + '>' + ENG[e].name + '</option>'; }).join('');
    sel.disabled = G.used > 0 || opts.length < 2;
    $('#sg-fire').disabled = G.phase !== 'aim';
    aimText();
  }
  function aimText() {
    if (!G) return; var wd = G.phase === 'fly' ? G.wind || 0 : windNow();
    $('#sg-aim').textContent = (isFire() ? '🔥 ' : '') + ENG[G.eng].name + ' · angle ' + Math.round(G.aim.a) + '° · power ' + Math.round(G.aim.p * 100) + '%' + (wd ? ' · wind ' + (wd > 0 ? '→' : '←') + (Math.abs(wd) > 2.6 ? (wd > 0 ? '→' : '←') : '') : '');
  }
  var sayT = null;
  function say(f, e) {
    var el = $('#sg-word'); if (!f) { el.classList.remove('on'); return; }
    var gk = G.L.lang === 'g';
    el.innerHTML = '<b class="' + (gk ? 'gk' : 'la') + '">' + esc(f) + '</b>' + (gk && TR(f) ? ' <i>' + esc(TR(f)) + '</i>' : '') + ' = ' + esc(e) + ' <span class="sg-small" style="color:#cfe0d6">' + (gk ? 'Koine Greek' : 'Latin') + '</span>';
    el.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(function () { el.classList.remove('on'); }, 2400);
  }

  // ---------- overlays ----------
  var paused = true;
  function ov(html) { var o = $('#sg-ov'); o.innerHTML = '<div class="sg-box">' + html + '</div>'; o.hidden = false; paused = true; return o; }
  function closeOv() { $('#sg-ov').hidden = true; paused = false; last = 0; }
  function stars(n) { return '★★★'.slice(0, n) + '<span style="opacity:.3">' + '★★★'.slice(0, 3 - n) + '</span>'; }
  function wordsHtml(L) {
    if (!st.words) return '';
    var gk = L.lang === 'g';
    return '<p class="sg-small">' + (gk ? 'Words in Koine Greek, the Greek of the New Testament.' : (L.bonus ? 'Words in Latin, still the language of writing in medieval Europe.' : 'Words in Latin.')) + (L.wordNote ? ' ' + esc(L.wordNote) : '') + '</p><div class="sg-words">' +
      L.words.map(function (w) { return '<span><b>' + esc(w[0]) + '</b>' + (gk && TR(w[0]) ? ' <i class="sg-small">' + esc(TR(w[0])) + '</i>' : '') + ' = ' + esc(w[1]) + '</span>'; }).join('') + '</div>';
  }
  function engCard(e, small) {
    var E = ENG[e], names = ['Power', 'Arc', 'Weight of shot'];
    return '<div class="sg-eng"><canvas data-eng="' + e + '" width="300" height="220"></canvas><div><h3>' + E.name + (E.late ? '<span class="sg-tag late">later, not ancient</span>' : '<span class="sg-tag">' + esc(E.who) + '</span>') + '</h3>' +
      '<p class="sg-small">' + (E.origL ? '<span class="' + (E.origL === 'g' ? 'gk' : 'la') + '">' + esc(E.orig) + '</span>, ' : '') + esc(E.gloss) + ' · ' + esc(E.when) + '</p>' +
      '<p><b>' + esc(E.power) + '.</b> ' + (small ? '' : esc(E.text)) + '</p><p class="sg-small">' + esc(E.tip) + '</p>' +
      '<div class="sg-bars">' + names.map(function (n, i) { return '<span>' + n + '</span><i><b style="width:' + (E.bars[i] * 25) + '%"></b></i>'; }).join('') + '</div></div></div>';
  }
  function paintCards(o) {
    o.querySelectorAll('canvas[data-eng]').forEach(function (cc) { var x = cc.getContext('2d'); x.clearRect(0, 0, 300, 220); x.fillStyle = '#c9a86a'; x.fillRect(0, 190, 300, 30); var e = cc.dataset.eng, s = e === 'trebuchet' ? 34 : e === 'onager' ? 60 : e === 'sling' || e === 'falarica' ? 90 : 70; drawEngine(x, e, (300 - (e === 'trebuchet' ? 4 : e === 'sling' || e === 'falarica' ? 2.4 : 3.4) * s) / 2, 190, s, 0, e === 'onager' || e === 'trebuchet' ? 45 : e === 'falarica' ? 25 : 15); });
  }
  function lvButton(L, i) {
    var d = st.done[L.id];
    return '<button class="sg-lvb" data-i="' + i + '"><b>' + (i + 1) + '. ' + esc(L.name) + '</b><small>' + esc(L.when) + ' · ' + esc(ENG[L.eng].name) + (L.bonus ? ' · bonus' : L.kind === 'literature' ? ' · literature' : '') + '</small>' + (d ? '<span class="st">' + '★★★'.slice(0, d) + '</span>' : '') + '</button>';
  }
  function title() {
    G = null;
    var firstOpen = -1; LV.some(function (L, i) { if (!st.done[L.id]) { firstOpen = chOf(L); return true; } });
    var all = 0, got = 0; LV.forEach(function (L) { all += 3; got += st.done[L.id] || 0; });
    var o = ov('<h1>Siege</h1><p class="sg-sub">Pull back, let go, and knock out the defenders. ' + LV.length + ' sieges from history and literature, from Homer’s Troy to Rome in AD 537, each with its own machine and its own lesson. Play them in any order.</p>' +
      '<p class="sg-small">★ ' + got + ' of ' + all + ' stars</p>' +
      CH.map(function (ch, k) {
        var ls = [], cg = 0, ca = 0; LV.forEach(function (L, i) { if (L.ch === ch.id) { ls.push(i); ca += 3; cg += st.done[L.id] || 0; } });
        if (!ls.length) return '';
        var open = LV.length <= 30 || k === firstOpen || (firstOpen < 0 && k === 0);
        return '<details class="sg-ch"' + (open ? ' open' : '') + '><summary><span>' + (k + 1) + '. ' + esc(ch.name) + '</span> <small>' + esc(ch.when) + ' · ★ ' + cg + '/' + ca + '</small></summary><p class="sg-small">' + esc(ch.text) + '</p><div class="sg-lvs">' + ls.map(function (i) { return lvButton(LV[i], i); }).join('') + '</div></details>';
      }).join('') +
      '<div class="sg-opts"><label><input type="checkbox" id="sg-w"' + (st.words ? ' checked' : '') + '> Latin and Greek words</label><label><input type="checkbox" id="sg-g"' + (st.guide === 'full' ? ' checked' : '') + '> Show the whole flight path when aiming (easier)</label></div>' +
      '<button class="sg-btn" id="sg-mach">The machines</button> <button class="sg-btn" id="sg-notes">📜 Siege notebook</button>' +
      '<details><summary>How to play</summary><ul><li><b>Aim:</b> press anywhere on the picture and pull back, like a slingshot; let go to fire. The dots show where the shot starts to go.</li><li><b>Keyboard:</b> ↑ ↓ change the angle, ← → change the power, Space fires.</li><li>Knock out every defender (🪖) before you run out of shots. Fewer shots earn more stars.</li><li>Wood breaks easily; brick takes a good hit; stone needs a heavy shot; earth and hanging hides soak up stones.</li><li>🔥 Burning shots set wood alight, and fire spreads to the wood touching it. Watch the wind, too: it pushes your shots.</li><li>Defenders are out when they are hit, crushed, knocked over, or pushed off the field or into the sea.</li><li>Win a siege to add its lesson to your notebook. Your progress is saved in this browser.</li></ul></details>');
    o.querySelectorAll('.sg-lvb').forEach(function (b) { b.addEventListener('click', function () { intro(+b.dataset.i); }); });
    $('#sg-w').addEventListener('change', function () { st.words = this.checked; save(); });
    $('#sg-g').addEventListener('change', function () { st.guide = this.checked ? 'full' : 'short'; save(); });
    $('#sg-mach').addEventListener('click', machines);
    $('#sg-notes').addEventListener('click', notes);
  }
  function lessonHtml(L) { return '<div class="sg-lesson"><h3>📜 ' + esc(L.lesson.t) + '</h3><p>' + esc(L.lesson.p) + '</p><p class="sg-small">' + (L.kind === 'literature' ? 'From literature: ' : 'Source: ') + esc(L.src) + '</p></div>'; }
  function notes() {
    var n = 0; LV.forEach(function (L) { if (st.done[L.id]) n++; });
    var o = ov('<h2>Siege notebook</h2><p class="sg-small">' + n + ' of ' + LV.length + ' lessons. Win a siege to add its lesson.</p>' +
      CH.map(function (ch, k) {
        var h = ''; LV.forEach(function (L, i) { if (L.ch !== ch.id) return; h += st.done[L.id] ? '<div class="sg-note"><b>' + (i + 1) + '. ' + esc(L.name) + ', ' + esc(L.when) + '</b>' + lessonHtml(L) + '</div>' : '<div class="sg-note off"><b>' + (i + 1) + '. ' + esc(L.name) + '</b> <span class="sg-small">Win this siege to add its lesson.</span></div>'; });
        return h ? '<h3>' + (k + 1) + '. ' + esc(ch.name) + '</h3>' + h : '';
      }).join('') + '<button class="sg-btn pri" id="sg-back">Back</button>');
    $('#sg-back').addEventListener('click', title);
  }
  function machines() {
    var o = ov('<h2>The machines</h2>' +
      '<p>From your own arm to a giant lever: every machine in the game, in the order they appeared. You can try any machine on any siege, from the menu at the top of the screen.</p><p><b>Catapult</b> comes from the Greek <span class="gk">καταπέλτης</span> (katapeltēs), from <i>kata</i>, “against”, and <i>pallein</i>, “to hurl”. Today it means any throwing machine, but the ancient ones all worked by storing energy in something springy, then letting it go.</p>' +
      '<table class="sg-table"><tr><th>Machine</th><th>Where the power comes from</th><th>Who and when</th></tr>' +
      ENG_ORDER.map(function (e) { var E = ENG[e]; return '<tr><td><b>' + E.name + '</b></td><td>' + esc(E.power) + '</td><td>' + esc(E.who) + ', ' + esc(E.when) + '</td></tr>'; }).join('') + '</table>' +
      '<h3>Catapult or trebuchet?</h3><p>Before about 400 BC there were no catapults: people threw stones and spears by hand or with slings. Greek and Roman engines were <b>tension</b> machines, which bend a bow, or <b>torsion</b> machines, which twist bundles of sinew or hair, the more powerful kind. A <b>trebuchet</b> is something else: a giant lever. People pulling ropes, or later a falling counterweight, swing a long beam that flings the stone from a sling. Trebuchets came after the Greeks and Romans in the West, so this game includes one only as a bonus, for comparison.</p>' +
      '<h3>Bolts or stones?</h3><p>Bolt-shooters like the gastraphetes and the small Roman <i>scorpio</i> fly fast and flat, good against people. Stone-throwers lob heavier shots to break wooden defences. Ancient stone-throwers rarely brought down good stone walls, which is why sieges were usually won with towers, rams, mines, hunger or treachery.</p>' +
      ENG_ORDER.map(function (e) { return engCard(e); }).join('') +
      '<button class="sg-btn pri" id="sg-back">Back</button>');
    paintCards(o); $('#sg-back').addEventListener('click', title);
  }
  function intro(i, eng) {
    var L = LV[i], e = eng || L.eng;
    var ch = CH[chOf(L)], ext = [];
    if (L.fire && !ENG[e].fire) ext.push('🔥 Your shots are burning: they set wood alight.');
    if (L.wind) ext.push('💨 ' + (typeof L.wind === 'number' ? 'The wind is ' + (L.wind > 0 ? 'behind you, carrying your shots further.' : 'against you, holding your shots back.') : 'The wind changes during this siege. Watch the arrows at the bottom of the screen.'));
    if (L.base) ext.push('⛰ You shoot from ' + (L.baseKind === 'wall' ? 'the top of a wall' : 'a raised ramp') + '.');
    var o = ov('<p class="sg-small">Level ' + (i + 1) + ' of ' + LV.length + ' · ' + esc(ch.name) + (L.bonus ? ' · bonus' : '') + ' <span class="sg-tag' + (L.kind === 'literature' ? ' lit' : '') + '">' + (L.kind === 'literature' ? 'from literature' : 'from history') + '</span></p><h2>' + esc(L.name) + ', ' + esc(L.when) + '</h2><p><i>' + esc(L.side) + '</i> ' + esc(L.story) + '</p>' +
      (ext.length ? '<p class="sg-small">' + ext.join('<br>') + '</p>' : '') +
      '<details class="sg-les"><summary>📜 Lesson: ' + esc(L.lesson.t) + '</summary>' + lessonHtml(L) + '</details>' +
      wordsHtml(L) + engCard(e, false) +
      '<p class="sg-small">' + L.shots + ' shots. Three stars for ' + L.three + ' or fewer.</p><button class="sg-btn pri" id="sg-go">Start</button> <button class="sg-btn" id="sg-back">Back</button>');
    paintCards(o);
    $('#sg-go').addEventListener('click', function () { closeOv(); newLevel(i, e); if (st.words) L.words.forEach(function (w) { logWord(w[0], w[1]); }); });
    $('#sg-back').addEventListener('click', title);
  }
  function result() {
    var L = G.L, won = G.phase === 'won', n = won ? (G.extra ? 1 : G.used <= L.three ? 3 : G.used <= L.two ? 2 : 1) : 0;
    var firstWin = won && !st.done[L.id];
    if (won && n > (st.done[L.id] || 0)) { st.done[L.id] = n; save(); }
    var next = G.i + 1 < LV.length;
    var o = ov('<h2>' + (won ? (G.eng !== L.eng ? 'Done, with a different machine!' : L.name + ' has fallen!') : 'Out of shots') + '</h2>' + (won ? '<div class="sg-stars">' + stars(n) + '</div><p>' + G.used + ' shot' + (G.used === 1 ? '' : 's') + '.</p>' : '<p>' + (G.targets - G.killed) + ' defender' + (G.targets - G.killed === 1 ? ' is' : 's are') + ' still standing. Try a different angle, or a stronger shot.</p><p><button class="sg-btn pri" id="sg-more">Keep going: 3 more shots</button><br><span class="sg-small">(You can still win, but only for one star.)</span></p>') +
      (won ? lessonHtml(L) + (firstWin ? '<p class="sg-small">Added to your siege notebook.</p>' : '') : '') +
      (st.words && G.words.length ? '<p class="sg-small">Words from this siege</p>' + '<div class="sg-words">' + G.words.map(function (f) { var W2 = WORDS[L.lang], w = L.words.concat([W2.wood, W2.stone, W2.target, W2.fire, W2.brick, L.targetWord].filter(Boolean)).filter(function (x) { return x[0] === f; })[0]; return w ? '<span><b>' + esc(w[0]) + '</b> = ' + esc(w[1]) + '</span>' : ''; }).join('') + '</div>' : '') +
      '<p>' + (won && next ? '<button class="sg-btn pri" id="sg-next">Next siege</button> ' : '') + '<button class="sg-btn' + (won && !next ? ' pri' : '') + '" id="sg-again">Play again</button> ' +
      (won ? '<button class="sg-btn" id="sg-other">Try another machine</button> ' : '') + '<button class="sg-btn" id="sg-menu">All sieges</button></p>');
    if ($('#sg-next')) $('#sg-next').addEventListener('click', function () { intro(G.i + 1); });
    $('#sg-again').addEventListener('click', function () { closeOv(); newLevel(G.i, G.eng); });
    if ($('#sg-more')) $('#sg-more').addEventListener('click', function () { G.shots += 3; G.extra = true; G.over = false; G.phase = 'aim'; closeOv(); hud(); });
    if (won) paintCards(o);
    if ($('#sg-other')) $('#sg-other').addEventListener('click', function () { var opts = ENG_ORDER.filter(engUnlocked), k = (opts.indexOf(G.eng) + 1) % opts.length; intro(G.i, opts[k]); });
    $('#sg-menu').addEventListener('click', title);
  }

  // ---------- input ----------
  var drag = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  // Aiming: press, pull back, let go. The drag always ends when the button comes up, wherever the pointer is,
  // and a mouse that moves with no button held never changes the aim.
  cv.addEventListener('pointerdown', function (e) {
    if (!G || paused || G.phase !== 'aim' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: e.pointerId, s: pt(e), a: G.aim.a, p: G.aim.p, moved: 0 };
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
  });
  W.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; } // the button was released somewhere we did not hear about
    var q = pt(e), dx = drag.s.x - q.x, dy = q.y - drag.s.y, len = Math.hypot(dx, dy), E = ENG[G.eng];
    drag.moved = Math.max(drag.moved, len);
    if (len < 8) return;
    G.aim.a = clamp(Math.atan2(dy, dx) * 180 / Math.PI, E.amin, E.amax);
    G.aim.p = clamp(len / (Math.min(Wd, Ht) * 0.45), 0.05, 1);
    aimText();
  });
  function up(e) { if (!drag || e.pointerId !== drag.id) return; var d = drag; drag = null; try { cv.releasePointerCapture(e.pointerId); } catch (er) { } if (d.moved >= 8) fire(); }
  W.addEventListener('pointerup', up);
  W.addEventListener('pointercancel', function () { drag = null; });
  cv.addEventListener('lostpointercapture', function (e) { if (drag && e.pointerId === drag.id && e.pointerType !== 'mouse') drag = null; });
  W.addEventListener('blur', function () { drag = null; });
  function nudge(da, dp) { if (!G || G.phase !== 'aim') return; var E = ENG[G.eng]; G.aim.a = clamp(G.aim.a + da, E.amin, E.amax); G.aim.p = clamp(G.aim.p + dp, 0.05, 1); aimText(); }
  D.addEventListener('keydown', function (e) {
    if (!G || paused || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return;
    var k = e.key, big = e.shiftKey ? 5 : 1;
    if (k === 'ArrowUp') nudge(big, 0); else if (k === 'ArrowDown') nudge(-big, 0); else if (k === 'ArrowRight') nudge(0, 0.01 * big); else if (k === 'ArrowLeft') nudge(0, -0.01 * big);
    else if (k === ' ' || k === 'Enter') fire(); else if (k === 'Escape' || k === 'p') { pause(); } else return;
    e.preventDefault();
  });
  root.querySelectorAll('[data-n]').forEach(function (b) { var t = null; function go() { var n = b.dataset.n.split(','); nudge(+n[0], +n[1]); } b.addEventListener('pointerdown', function (e) { e.preventDefault(); go(); t = setInterval(go, 90); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { clearInterval(t); }); }); });
  $('#sg-fire').addEventListener('click', fire);
  $('#sg-eng').addEventListener('change', function () { if (G && G.used === 0) newLevel(G.i, this.value); });
  $('#sg-menu').addEventListener('click', pause);
  function pause() {
    if (!G) return;
    var o = ov('<h2>Paused</h2><p class="sg-small">' + esc(G.L.name) + '</p><button class="sg-btn pri" id="sg-res">Continue</button> <button class="sg-btn" id="sg-rs">Restart</button> <button class="sg-btn" id="sg-info">The machine</button> <button class="sg-btn" id="sg-menu2">All sieges</button>');
    $('#sg-res').addEventListener('click', closeOv);
    $('#sg-rs').addEventListener('click', function () { closeOv(); newLevel(G.i, G.eng); });
    $('#sg-info').addEventListener('click', function () { var oo = ov(engCard(G.eng) + '<button class="sg-btn pri" id="sg-res2">Continue</button>'); paintCards(oo); $('#sg-res2').addEventListener('click', closeOv); });
    $('#sg-menu2').addEventListener('click', title);
  }
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !paused) pause(); });

  // ---------- loop ----------
  var last = 0;
  function frame(ts) {
    W.requestAnimationFrame(frame);
    if (!G) { last = 0; return; }
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (!paused) { G.acc += dt; while (G.acc >= DT) { step(DT); G.acc -= DT; } }
    draw();
  }
  // remember each body's starting strength, for the crack drawing
  var _add = PH.World.prototype.add;
  PH.World.prototype.add = function (o) { var b = _add.call(this, o); if (b.data && b.data.hp) b.data.hp0 = b.data.hp; return b; };

  fit(); title(); W.requestAnimationFrame(frame);
  // test hook
  W.__siege = { LV: LV, CH: CH, ENG: ENG, get G() { return G; }, burning: function () { return burning(); }, start: function (i, e) { closeOv(); newLevel(i, e); }, aim: function (a, p) { G.aim.a = a; G.aim.p = p; }, fire: fire, step: function (s) { for (var t = 0; t < s; t += DT) step(DT); }, hold: function (v) { paused = v; } };
})(window, document);
