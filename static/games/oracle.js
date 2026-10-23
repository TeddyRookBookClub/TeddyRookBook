/* Oracle's Rule: the Pythia at Delphi sorts offerings of painted jars by a secret rule (color, shape or number)
   and changes the rule without warning. Put each offering with the plinth it matches; she answers only yes or no.
   A Teddy Rook Book brain game. The game logic is exported for Node tests (module.exports). */
(function (W, D) {
  'use strict';

  // ================= logic (no DOM) =================
  var MAXLV = 15, DIMS = ['color', 'shape', 'number'];
  function clampLevel(n) { n = Math.round(+n || 1); return Math.max(1, Math.min(MAXLV, n)); }
  function params(n) {
    n = clampLevel(n);
    return {
      level: n,
      need: n <= 2 ? [6, 8] : n <= 4 ? [5, 7] : n <= 7 ? [4, 6] : n <= 10 ? [4, 5] : [3, 5],   // right answers in a row before the rule changes
      limit: n <= 3 ? 0 : Math.max(1.6, 6.5 - 0.45 * (n - 4)),                             // seconds per offering (0 = no limit)
      amb: n < 6 ? 0 : n < 10 ? 0.15 : 0.3,                                                 // share of offerings that match one plinth two ways
      fb: Math.max(320, 760 - 35 * n)                                                       // ms the answer stays on screen
    };
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, rnd) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // four plinths: every color, shape and number appears on exactly one; plinth i holds i+1 jars
  function makeKeys(rnd) {
    var c = shuffle([0, 1, 2, 3], rnd), s = shuffle([0, 1, 2, 3], rnd), out = [];
    for (var i = 0; i < 4; i++) out.push({ color: c[i], shape: s[i], number: i });
    return out;
  }
  function keyFor(keys, card, dim) { for (var i = 0; i < 4; i++) if (keys[i][dim] === card[dim]) return i; return -1; }
  function same(a, b) { return !!a && !!b && a.color === b.color && a.shape === b.shape && a.number === b.number; }
  // An offering. Plain ones match three different plinths by color, shape and number, so each choice shows which feature you used.
  // "Two-way" ones match one plinth by two features (never all three).
  function makeCard(keys, rnd, twoWay, prev) {
    for (var t = 0; t < 50; t++) {
      var p = shuffle([0, 1, 2, 3], rnd), card;
      if (!twoWay) card = { color: keys[p[0]].color, shape: keys[p[1]].shape, number: keys[p[2]].number };
      else {
        var odd = Math.floor(rnd() * 3), src = [p[0], p[0], p[0]]; src[odd] = p[1];
        card = { color: keys[src[0]].color, shape: keys[src[1]].shape, number: keys[src[2]].number };
      }
      if (!same(card, prev)) return card;
    }
    return card;
  }
  function pickNeed(level, rnd) { var r = params(level).need; return r[0] + Math.floor(rnd() * (r[1] - r[0] + 1)); }
  function points(level, right, ms) { return right ? 10 + level + Math.max(0, Math.round(5 * (1 - (ms || 0) / 2500))) : 0; }

  // The game as a small state machine (no timing inside; the page tells it about time-outs).
  function Game(level, rnd) {
    this.rnd = rnd || Math.random;
    this.level = clampLevel(level); this.top = this.level;
    this.keys = makeKeys(this.rnd);
    this.rule = Math.floor(this.rnd() * 3);
    this.streak = 0; this.need = pickNeed(this.level, this.rnd);
    this.miss = 0; this.dropped = false;
    this.found = []; // misses it took in each finished rule period
    this.cards = 0; this.right = 0;
    this.card = null; this.next();
  }
  Game.prototype.next = function () { this.card = makeCard(this.keys, this.rnd, this.rnd() < params(this.level).amb, this.card); return this.card; };
  Game.prototype.answerKey = function () { return keyFor(this.keys, this.card, DIMS[this.rule]); };
  // choice: plinth 0-3, or -1 when time ran out. Returns what happened.
  Game.prototype.answer = function (choice) {
    var right = choice >= 0 && choice === this.answerKey(), lv = this.level, ev = { right: right, changed: false, hint: false, from: lv, card: this.card, rule: DIMS[this.rule] };
    this.cards++;
    if (right) {
      this.right++; this.streak++;
      if (this.streak >= this.need) {
        // the rule was found and held: level up if it took at most two misses, down if it took five or more
        if (!this.dropped) { if (this.miss <= 2) this.level = clampLevel(this.level + 1); else if (this.miss >= 5) this.level = clampLevel(this.level - 1); }
        this.found.push(this.miss);
        var others = [0, 1, 2].filter(function (d) { return d !== this.rule; }, this);
        this.rule = others[Math.floor(this.rnd() * 2)];
        this.streak = 0; this.need = pickNeed(this.level, this.rnd); this.miss = 0; this.dropped = false;
        ev.changed = true;
      }
    } else {
      this.streak = 0; this.miss++;
      if (this.miss % 6 === 0) { this.level = clampLevel(this.level - 1); this.dropped = true; ev.hint = true; }
    }
    if (this.level > this.top) this.top = this.level;
    ev.level = this.level;
    this.next();
    return ev;
  };
  Game.prototype.avgFound = function () { // average misses to find a new rule, after the first one
    var f = this.found.slice(1); if (!f.length) return null;
    return f.reduce(function (a, b) { return a + b; }, 0) / f.length;
  };

  var LOGIC = { MAXLV: MAXLV, DIMS: DIMS, params: params, makeKeys: makeKeys, keyFor: keyFor, makeCard: makeCard, Game: Game, points: points, mulberry: mulberry, clampLevel: clampLevel };
  if (typeof module === 'object' && module.exports) { module.exports = LOGIC; return; }
  if (!D) return;

  // ================= page =================
  var root = D.getElementById('or'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var RM = false; try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var SESSION = 90, KEY = 'trb-brain-v1', SLUG = 'oracle';
  function loadAll() { try { var d = JSON.parse(W.localStorage.getItem(KEY)); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
  function mine() { var m = loadAll()[SLUG]; if (!m || typeof m !== 'object') m = {}; if (!Array.isArray(m.sessions)) m.sessions = []; return m; }
  function saveMine(m) { try { var d = loadAll(); d[SLUG] = m; W.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } }
  function soundOn() { return loadAll().sound === true; }
  function setSound(v) { try { var d = loadAll(); d.sound = !!v; W.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } }

  // ---- sound: synthesized, off until turned on ----
  var AC = null, SND = soundOn();
  function ac() {
    if (!AC) { var C = W.AudioContext || W.webkitAudioContext; if (!C) return null; try { AC = new C(); } catch (e) { return null; } }
    if (AC.state === 'suspended') { try { AC.resume(); } catch (e) { } }
    return AC;
  }
  function tone(f, d, type, vol, f2, delay) {
    if (!SND) return; var a = ac(); if (!a) return;
    var t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.03);
  }
  var SFX = {
    yes: function () { tone(880, 0.09, 'sine', 0.09); tone(1320, 0.16, 'sine', 0.07, 0, 0.06); },   // a small bell
    no: function () { tone(196, 0.22, 'triangle', 0.12, 150); },
    late: function () { tone(150, 0.3, 'sine', 0.1, 110); },
    end: function () { tone(523, 0.14, 'sine', 0.1); tone(659, 0.14, 'sine', 0.1, 0, 0.13); tone(784, 0.3, 'sine', 0.1, 0, 0.26); },
    click: function () { tone(700, 0.04, 'square', 0.03); }
  };

  // ---- the jars: color always comes with its own painted pattern, so color is never the only clue ----
  var COLORS = [
    { c: '#D55E00', name: 'orange', pat: 'bands', ink: '#fff3df' },
    { c: '#0072B2', name: 'blue', pat: 'dots', ink: '#fff3df' },
    { c: '#F0E442', name: 'yellow', pat: 'zigzag', ink: '#4a3b00' },
    { c: '#2b2b2b', name: 'black', pat: 'lattice', ink: '#f2e3c4' }
  ];
  var SHAPES = [
    { name: 'amphora', pl: 'amphorae', gr: 'ἀμφορεύς', en: 'tall two-handled jar',
      body: 'M10,1H20V4H19V8C27,11 28,22 24,31L16,42H14L6,31C2,22 3,11 11,8V4H10Z',
      line: 'M11,6C4,6 4,14 7.5,16M19,6C26,6 26,14 22.5,16' },
    { name: 'water jar', pl: 'water jars', gr: 'ὑδρία', en: 'round water jar',
      body: 'M10,6H20V9H18V12C29,13 30,30 22,37V41H8V37C0,30 1,13 12,12V9H10Z',
      line: 'M3,21C-1,21 -1,28 3.5,28M27,21C31,21 31,28 26.5,28M18,10C26,8 27,15 25,18' },
    { name: 'oil flask', pl: 'oil flasks', gr: 'λήκυθος', en: 'slim oil flask',
      body: 'M12,2H18L17,7H16V10C21,11 21,13 21,15V36C21,39 19,40 18,40V42H12V40C11,40 9,39 9,36V15C9,13 9,11 14,10V7H13Z',
      line: 'M16,8C21,7 22,11 20.5,13' },
    { name: 'cup', pl: 'cups', gr: 'κύλιξ', en: 'wide drinking cup',
      body: 'M1,22H29C28,30 22,33 15,33C8,33 2,30 1,22ZM13,33H17V39H13ZM8,39H22L23,42H7Z',
      line: 'M2,24C-1,21 0,16 4,18M28,24C31,21 30,16 26,18' }
  ];
  var NUMW = ['one', 'two', 'three', 'four'];
  function patDefs() {
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<pattern id="orp0" width="6" height="5" patternUnits="userSpaceOnUse"><rect width="6" height="1.7" fill="' + COLORS[0].ink + '" fill-opacity=".85"/></pattern>' +
      '<pattern id="orp1" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.15" fill="' + COLORS[1].ink + '" fill-opacity=".9"/></pattern>' +
      '<pattern id="orp2" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0,3.5L1.5,1.5L3,3.5L4.5,1.5L6,3.5" fill="none" stroke="' + COLORS[2].ink + '" stroke-width="1" stroke-opacity=".9"/></pattern>' +
      '<pattern id="orp3" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0,0L5,5M5,0L0,5" stroke="' + COLORS[3].ink + '" stroke-width=".8" stroke-opacity=".9"/></pattern>' +
      '</defs></svg>';
  }
  function jar(color, shape, x, y) {
    var s = SHAPES[shape], c = COLORS[color];
    return '<g transform="translate(' + x + ',' + y + ')"><path d="' + s.line + '" fill="none" stroke="#2a1f14" stroke-width="3.6" stroke-linecap="round"/><path d="' + s.line + '" fill="none" stroke="' + c.c + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="' + s.body + '" fill="' + c.c + '"/><path d="' + s.body + '" fill="url(#orp' + color + ')"/><path d="' + s.body + '" fill="none" stroke="#2a1f14" stroke-width="1.3" stroke-linejoin="round"/></g>';
  }
  var SPOTS = [[[21, 26]], [[3, 26], [39, 26]], [[3, 3], [39, 3], [21, 50]], [[3, 3], [39, 3], [3, 50], [39, 50]]];
  function jars(o) { // o = {color, shape, number}: one to four jars in a little square
    var out = '';
    SPOTS[o.number].forEach(function (p) { out += jar(o.color, o.shape, p[0], p[1]); });
    return '<svg viewBox="0 0 72 96" aria-hidden="true" focusable="false">' + out + '</svg>';
  }
  function describe(o) { var n = o.number + 1; return NUMW[o.number] + ' ' + COLORS[o.color].name + ' ' + (n > 1 ? SHAPES[o.shape].pl : SHAPES[o.shape].name); }

  // ---- state ----
  var M = mine(), G = null, S = null; // G: page session; S: logic game
  if (M.timer !== 'relaxed') M.timer = 'quick';
  function startLevel() { return LOGIC.clampLevel((M.level || 1) - 1); }
  var ICON = {
    pause: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="4" y="3" width="4.5" height="14" rx="1" fill="currentColor"/><rect x="11.5" y="3" width="4.5" height="14" rx="1" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5,3L17,10L5,17Z" fill="currentColor"/></svg>'
  };
  function pythia(cls) {
    return '<svg class="' + cls + '" viewBox="0 0 90 80" aria-hidden="true" focusable="false">' +
      '<path d="M8,30L45,12L82,30Z" class="or-ped"/><rect x="10" y="30" width="70" height="5" class="or-ped"/>' +
      '<rect x="14" y="36" width="6" height="36" class="or-col"/><rect x="70" y="36" width="6" height="36" class="or-col"/><rect x="8" y="72" width="74" height="6" class="or-ped"/>' +
      '<path d="M45,20C40,26 50,28 45,34C40,40 50,42 46,48" class="or-vapor"/><path d="M38,24C34,30 42,33 38,39" class="or-vapor v2"/><path d="M52,24C56,30 48,33 52,39" class="or-vapor v3"/>' +
      '<path d="M32,52H58C57,58 52,61 45,61C38,61 33,58 32,52Z" class="or-bronze"/><path d="M36,60L30,72M54,60L60,72M45,61V72" class="or-legs"/>' +
      '<path d="M26,52C30,46 34,46 36,50M64,52C60,46 56,46 54,50" class="or-laurel"/></svg>';
  }

  // ---- menu ----
  function chart(list) {
    var s = list.slice(-20);
    if (!s.length) return '<p class="or-small">Your scores will show here after your first session.</p>';
    var max = Math.max.apply(null, s.map(function (x) { return x.score || 0; })) || 1, w = 300, h = 96, bw = w / Math.max(10, s.length), best = M.best || 0;
    var bars = s.map(function (x, i) {
      var v = x.score || 0, bh = Math.max(2, v / max * (h - 18));
      return '<rect x="' + (i * bw + 2).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + bh.toFixed(1) + '" class="' + (v === best && v > 0 ? 'or-bar best' : 'or-bar') + '" rx="2"/>' +
        '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (h - bh - 3).toFixed(1) + '" class="or-barlv">' + (x.level || '') + '</text>';
    }).join('');
    return '<figure class="or-chart"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Scores of your last ' + s.length + ' sessions, oldest first: ' + s.map(function (x) { return x.score || 0; }).join(', ') + '">' + bars + '</svg>' +
      '<figcaption>Your last ' + s.length + ' session' + (s.length > 1 ? 's' : '') + ': bar height is the score, the small number is the level reached' + (best ? '; the gold bar is your best' : '') + '.</figcaption></figure>';
  }
  function menu() {
    stop(); G = null; S = null; M = mine(); if (M.timer !== 'relaxed') M.timer = 'quick';
    var lv = startLevel(), n = M.sessions.length;
    root.innerHTML = patDefs() + '<div class="or-menu">' +
      '<div class="or-hero">' + pythia('or-heroart') + '<div><h1>Oracle’s Rule</h1><p class="or-sub"><span class="gr">γνῶθι σεαυτόν</span>, “know yourself,” carved at Apollo’s temple at Delphi</p></div></div>' +
      '<p>The Pythia, Apollo’s priestess at Delphi, sorts the offerings by a secret rule: by <b>color</b>, by <b>shape</b> or by <b>number</b>. Put each offering of jars with the plinth it matches. She answers only <span class="gr">ναί</span> (yes) or <span class="gr">οὐχί</span> (no). Every so often she changes the rule without a word.</p>' +
      '<div class="or-opt"><span>Timer</span><div class="or-seg" role="group" aria-label="Timer"><button data-timer="quick" aria-pressed="' + (M.timer === 'quick') + '"' + (M.timer === 'quick' ? ' class="on"' : '') + '>Quick: offerings time out at higher levels</button><button data-timer="relaxed" aria-pressed="' + (M.timer === 'relaxed') + '"' + (M.timer === 'relaxed' ? ' class="on"' : '') + '>Relaxed: no time-outs</button></div></div>' +
      '<div class="or-btns"><button class="or-btn pri" id="or-go">' + (n ? 'Play · level ' + lv : 'Start') + '</button>' + (lv > 1 ? '<button class="or-btn" id="or-go1">Start at level 1</button>' : '') + '</div>' +
      '<p class="or-small">90-second sessions. Find each new rule within two misses and you move up a level; five or more and you move down.' + (n ? ' Best score: <b>' + (M.best || 0) + '</b> · highest level: <b>' + (M.top || 1) + '</b> · sessions: ' + n + '.' : '') + ' Saved only in this browser.</p>' +
      chart(M.sessions) +
      '<details class="or-help"><summary>How to play</summary><ul>' +
      '<li>Four plinths stand in a row. Each has its own color, its own shape of jar and its own number of jars (one to four).</li>' +
      '<li>The offering at the bottom matches one plinth by color, another by shape and another by number. Pick the plinth that fits the rule. You start without knowing the rule: try one and listen to the answer.</li>' +
      '<li>The four colors are orange with bands, blue with dots, yellow with zigzags and black with a lattice, so you can sort by the painted pattern too.</li>' +
      '<li>The shapes: the tall two-handled amphora (<span class="gr">ἀμφορεύς</span>), the round water jar (<span class="gr">ὑδρία</span>, hydria), the slim oil flask (<span class="gr">λήκυθος</span>, lekythos) and the wide drinking cup (<span class="gr">κύλιξ</span>, kylix).</li>' +
      '<li>When a rule that was working suddenly gets a “no,” the rule has changed. Try another.</li>' +
      '<li>Keyboard: keys 1 to 4 choose a plinth (or Tab to it and press Enter); P pauses; M turns sound on or off.</li>' +
      '<li>It’s a fun challenge for attention and flexible thinking. Getting better at it mostly means getting better at this game.</li></ul></details>' +
      '<details class="or-help"><summary>The real oracle</summary><p>For centuries Greeks traveled to Delphi to put questions to Apollo through the Pythia, his priestess. Her answers could be famously double-edged. Herodotus tells how King Croesus of Lydia asked whether he should march against the Persians and was told that if he did, he would destroy a great empire. He marched, and the empire he destroyed was his own (Histories 1.53 and 1.91). Among the sayings carved at the temple was <span class="gr">γνῶθι σεαυτόν</span>, “know yourself.”</p><p>Psychologists have used card-sorting puzzles with a hidden rule that changes since the 1940s, to study how people let go of one idea and try another.</p></details>' +
      '</div>';
    root.querySelectorAll('[data-timer]').forEach(function (b) { b.onclick = function () { M.timer = b.dataset.timer; var m = mine(); m.timer = M.timer; saveMine(m); menu(); var f = root.querySelector('[data-timer="' + M.timer + '"]'); if (f) f.focus(); }; });
    $('#or-go').onclick = function () { start(lv); };
    if ($('#or-go1')) $('#or-go1').onclick = function () { start(1); };
  }

  // ---- a session ----
  function start(level) {
    stop();
    S = new LOGIC.Game(level);
    G = { time: SESSION, score: 0, paused: false, over: false, busy: false, shown: 0, left: 0, limit: 0, raf: 0, last: 0, timer: M.timer, msgT: 0 };
    root.innerHTML = patDefs() + '<div class="or-game">' +
      '<div class="or-top"><button class="or-btn sm" id="or-back" aria-label="Menu">☰<span class="or-wide"> Menu</span></button>' +
      '<div class="or-info"><b id="or-lv"></b><span id="or-score"></span></div>' +
      '<div class="or-clock" title="Time left"><span class="or-clockbar"><i id="or-clockfill"></i></span><span id="or-time"></span></div>' +
      '<button class="or-btn sm" id="or-snd"></button><button class="or-btn sm" id="or-pause" aria-label="Pause">' + ICON.pause + '</button></div>' +
      '<div class="or-temple">' + pythia('or-pythia') + '<div class="or-say" id="or-say"><span class="or-saygr gr" id="or-saygr">…</span><span class="or-sayen" id="or-sayen">Where does the offering go?</span></div></div>' +
      '<div class="or-offer"><div class="or-card" id="or-card"></div><div class="or-cardtimer" id="or-ctimer" hidden><i id="or-ctfill"></i></div></div>' +
      '<div class="or-keys" id="or-keys" role="group" aria-label="The four plinths"></div>' +
      '<p class="or-sr" id="or-live" aria-live="polite"></p>' +
      '<div class="or-modal" id="or-modal" hidden></div></div>';
    var kh = '';
    S.keys.forEach(function (k, i) {
      kh += '<button class="or-key" data-k="' + i + '" aria-label="Plinth ' + (i + 1) + ': ' + describe(k) + '"><span class="or-kbd" aria-hidden="true">' + (i + 1) + '</span>' + jars(k) + '<span class="or-mark" aria-hidden="true"></span></button>';
    });
    $('#or-keys').innerHTML = kh;
    root.querySelectorAll('.or-key').forEach(function (b) { b.onclick = function () { choose(+b.dataset.k); }; });
    $('#or-back').onclick = function () { if (G && !G.over) { var m = mine(); m.level = S.level; m.top = Math.max(m.top || 1, S.top); saveMine(m); } menu(); };
    $('#or-pause').onclick = function () { pause(!G.paused); };
    $('#or-snd').onclick = function () { SND = !SND; setSound(SND); drawSnd(); if (SND) SFX.click(); };
    drawSnd(); showCard(); hud();
    G.raf = W.requestAnimationFrame(loop);
  }
  function drawSnd() { var b = $('#or-snd'); if (!b) return; b.textContent = SND ? '🔊' : '🔇'; b.setAttribute('aria-label', SND ? 'Sound on' : 'Sound off'); b.setAttribute('aria-pressed', SND ? 'true' : 'false'); }
  function hud() {
    if (!G) return;
    $('#or-lv').textContent = 'Level ' + S.level;
    $('#or-score').textContent = G.score + ' pts';
    var t = Math.max(0, Math.ceil(G.time)); $('#or-time').textContent = Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2);
    $('#or-clockfill').style.width = Math.max(0, G.time / SESSION * 100).toFixed(1) + '%';
  }
  function showCard() {
    var c = $('#or-card');
    c.innerHTML = jars(S.card);
    c.setAttribute('aria-label', 'Offering: ' + describe(S.card));
    c.setAttribute('role', 'img');
    if (!RM) { c.classList.remove('in'); void c.offsetWidth; c.classList.add('in'); }
    var p = LOGIC.params(S.level);
    G.limit = G.timer === 'quick' ? p.limit : 0; G.left = G.limit; G.shown = now();
    $('#or-ctimer').hidden = !G.limit;
    if (G.limit) $('#or-ctfill').style.width = '100%';
    $('#or-live').textContent = 'Offering: ' + describe(S.card) + '.';
  }
  function now() { return W.performance && performance.now ? performance.now() : Date.now(); }
  function say(gr, en, cls) {
    var s = $('#or-say'); s.className = 'or-say ' + (cls || '');
    $('#or-saygr').textContent = gr; $('#or-sayen').textContent = en;
  }
  function choose(k) {
    if (!G || G.over || G.paused || G.busy) return;
    var ms = (now() - G.shown) * (W.__orFast || 1), lv = S.level, ev = S.answer(k);
    var pts = LOGIC.points(lv, ev.right, ms); G.score += pts;
    G.busy = true;
    var b = k >= 0 ? root.querySelector('.or-key[data-k="' + k + '"]') : null;
    if (ev.right) { SFX.yes(); say('ναί', '✓ Yes  +' + pts, 'yes'); }
    else if (k < 0) { SFX.late(); say('…', '⌛ Too slow. The oracle moved on.', 'no'); }
    else { SFX.no(); say('οὐχί', '✗ No', 'no'); }
    if (b) { b.classList.add(ev.right ? 'ok' : 'bad'); b.querySelector('.or-mark').textContent = ev.right ? '✓' : '✗'; }
    var extra = '';
    if (ev.level > ev.from) extra = 'Level up: ' + ev.level + '.';
    else if (ev.level < ev.from) extra = 'Level down: ' + ev.level + '.';
    if (ev.hint) extra += ' Hint: try sorting by a different feature: color, shape or number.';
    $('#or-live').textContent = (ev.right ? 'Yes.' : k < 0 ? 'Too slow.' : 'No.') + (extra ? ' ' + extra : '');
    if (extra) flash(extra);
    hud();
    G.fb = LOGIC.params(lv).fb / 1000 * (ev.hint ? 2.5 : 1);
    G.after = function () {
      if (b) { b.classList.remove('ok', 'bad'); b.querySelector('.or-mark').textContent = ''; }
      G.busy = false;
      if (G.time <= 0) { end(); return; }
      say('…', 'Where does the offering go?', '');
      showCard(); hud();
    };
  }
  function flash(t) { var s = $('#or-sayen'); if (s) s.textContent += '  ' + t; }
  function pause(on) {
    if (!G || G.over) return;
    G.paused = on;
    var m = $('#or-modal');
    if (on) {
      m.hidden = false; m.classList.add('solid');
      m.innerHTML = '<div class="or-box" role="dialog" aria-modal="true" aria-label="Paused"><h2>Paused</h2><p>The oracle waits. The offering is hidden while you rest.</p><div class="or-btns"><button class="or-btn pri" id="or-resume">Resume</button><button class="or-btn" id="or-quit">End session</button></div></div>';
      $('#or-resume').onclick = function () { pause(false); };
      $('#or-quit').onclick = function () { pause(false); G.time = 0; if (!G.busy) end(); };
      $('#or-resume').focus();
      $('#or-pause').innerHTML = ICON.play; $('#or-pause').setAttribute('aria-label', 'Resume');
    } else {
      m.hidden = true; m.innerHTML = ''; m.classList.remove('solid');
      $('#or-pause').innerHTML = ICON.pause; $('#or-pause').setAttribute('aria-label', 'Pause');
      G.shown = now() - (G.limit - G.left) * 1000;
    }
  }
  function stop() { if (G && G.raf) W.cancelAnimationFrame(G.raf); if (G) G.raf = 0; }
  function loop(ts) {
    if (!G || G.over) return;
    var dt = G.last ? Math.min(0.1, (ts - G.last) / 1000) : 0; G.last = ts;
    if (W.__orFast) dt *= W.__orFast;
    if (!G.paused) {
      G.time -= dt;
      if (G.busy) { G.fb -= dt; if (G.fb <= 0 && G.after) { var f = G.after; G.after = null; f(); } }
      else {
        if (G.time <= 0) { end(); return; }
        if (G.limit) {
          G.left -= dt; $('#or-ctfill').style.width = Math.max(0, G.left / G.limit * 100).toFixed(1) + '%';
          if (G.left <= 0) choose(-1);
        }
      }
      hud();
    }
    if (G && !G.over) G.raf = W.requestAnimationFrame(loop);
  }
  function end() {
    if (!G || G.over) return;
    G.over = true; stop();
    var m = mine(), acc = S.cards ? Math.round(S.right / S.cards * 100) : 0, avg = S.avgFound();
    m.sessions.push({ t: Date.now(), score: G.score, level: S.top, acc: acc, rules: S.found.length });
    if (m.sessions.length > 30) m.sessions = m.sessions.slice(-30);
    var had = m.sessions.length > 1, nb = G.score > (m.best || 0); if (nb) m.best = G.score;
    m.level = S.level; m.top = Math.max(m.top || 1, S.top); m.timer = M.timer;
    saveMine(m); M = m;
    SFX.end();
    var md = $('#or-modal'); md.hidden = false;
    var av = avg == null ? 0 : Math.round(avg * 10) / 10;
    md.innerHTML = '<div class="or-box" role="dialog" aria-modal="true" aria-label="Session over"><h2>' + (nb && had ? 'A new best!' : 'Time’s up') + '</h2>' +
      '<p class="or-big">' + G.score + ' points</p>' +
      '<dl class="or-stats"><div><dt>Placed right</dt><dd>' + S.right + ' of ' + S.cards + '</dd></div><div><dt>Rules found</dt><dd>' + S.found.length + '</dd></div><div><dt>Level reached</dt><dd>' + S.top + '</dd></div><div><dt>Best</dt><dd>' + (M.best || 0) + '</dd></div></dl>' +
      (avg != null ? '<p class="or-small">When the oracle changed her rule, you needed ' + av + ' miss' + (av === 1 ? '' : 'es') + ' on average to find the new one. One is the fewest anyone can need.</p>' : '') +
      chart(M.sessions) +
      '<div class="or-btns"><button class="or-btn pri" id="or-again">Play again</button><button class="or-btn" id="or-tomenu">Menu</button></div></div>';
    $('#or-again').onclick = function () { start(startLevel()); };
    $('#or-tomenu').onclick = menu;
    $('#or-again').focus();
  }

  D.addEventListener('keydown', function (e) {
    if (!G || G.over || !root.querySelector('.or-game')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'p' || k === 'P' || (k === 'Escape' && !G.paused)) { e.preventDefault(); pause(!G.paused); return; }
    if (k === 'Escape' && G.paused) { e.preventDefault(); pause(false); return; }
    if (G.paused) return;
    if (k === 'm' || k === 'M') { e.preventDefault(); $('#or-snd').click(); return; }
    if (/^[1-4]$/.test(k)) { e.preventDefault(); choose(+k - 1); }
  });
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !G.over && !G.paused) pause(true); });

  // tiny test hooks for the site's automated checks
  W.__or = { logic: LOGIC, get G() { return G; }, get S() { return S; }, choose: function (k) { choose(k); } };
  menu();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
