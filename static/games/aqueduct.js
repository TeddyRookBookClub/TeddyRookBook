/* Aqueduct Switches: water runs down from the castellum through stone channels with bronze sluice gates.
   Flip the gates so every stream reaches the fountain with its own mark, before the water gets there.
   A Teddy Rook Book brain game. The game logic is exported for Node tests (module.exports). */
(function (W, D) {
  'use strict';

  // ================= logic (no DOM) =================
  var MAXLV = 22;
  // per level: [streams, rows, switchable gates, fixed stone bridges]
  var TABLE = [null,
    [2, 2, 2, 0], [2, 3, 3, 0],
    [3, 3, 3, 0], [3, 4, 4, 0], [3, 5, 4, 1], [3, 6, 5, 1],
    [4, 5, 5, 0], [4, 5, 6, 1], [4, 6, 7, 1], [4, 6, 8, 2], [4, 7, 9, 2],
    [5, 6, 8, 2], [5, 7, 9, 2], [5, 7, 10, 2], [5, 8, 11, 3], [5, 8, 12, 3], [5, 9, 12, 4],
    [6, 7, 11, 3], [6, 8, 12, 3], [6, 8, 12, 4], [6, 9, 12, 5], [6, 9, 12, 6]];
  function clampLevel(n) { n = Math.round(+n || 1); return Math.max(1, Math.min(MAXLV, n)); }
  function params(n) {
    n = clampLevel(n);
    var t = TABLE[n];
    return {
      level: n, k: t[0], rows: t[1], gates: t[2], fixed: t[3],
      speed: Math.min(0.95, 0.3 + 0.03 * (n - 1)),           // rows of channel per second
      head: 2 + 0.5 * t[0],                                   // seconds before the sluices open
      minFlips: n <= 2 ? 1 : n <= 6 ? 2 : n <= 12 ? 3 : 4
    };
  }
  function shuffle(a, rnd) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Place gates on the grid: a gate at (r, c) joins channels c and c+1 in row r; gates in one row never share a channel.
  function placeGates(p, rnd) {
    for (var tries = 0; tries < 400; tries++) {
      var slots = [], r, c;
      for (r = 0; r < p.rows; r++) for (c = 0; c < p.k - 1; c++) slots.push([r, c]);
      shuffle(slots, rnd);
      var used = {}, out = [], need = p.gates + p.fixed;
      for (var i = 0; i < slots.length && out.length < need; i++) {
        r = slots[i][0]; c = slots[i][1];
        if (used[r + ':' + c] || used[r + ':' + (c + 1)]) continue;
        used[r + ':' + c] = used[r + ':' + (c + 1)] = 1; out.push({ r: r, c: c });
      }
      if (out.length < need) continue;
      var rowsUsed = {}; out.forEach(function (g) { rowsUsed[g.r] = 1; });
      if (Object.keys(rowsUsed).length < p.rows) continue;        // no empty rows
      out.sort(function (a, b) { return a.r - b.r || a.c - b.c; });
      var idx = shuffle(out.map(function (_, j) { return j; }), rnd).slice(0, p.fixed), fx = {};
      idx.forEach(function (j) { fx[j] = 1; });
      var sw = 0;
      out.forEach(function (g, j) { g.fixed = !!fx[j]; g.sw = g.fixed ? -1 : sw++; });
      return out;
    }
    return null;
  }
  // Follow the water: returns cols[r][col] = stream in that channel at the top of row r (r = 0..rows); cols[rows] = arrivals.
  function trace(pz, states) {
    var arr = [], out = [], i;
    for (i = 0; i < pz.k; i++) arr.push(i);
    out.push(arr.slice());
    var gi = 0;
    for (var r = 0; r < pz.rows; r++) {
      while (gi < pz.gates.length && pz.gates[gi].r === r) {
        var g = pz.gates[gi++];
        if (g.fixed || states[g.sw]) { var t = arr[g.c]; arr[g.c] = arr[g.c + 1]; arr[g.c + 1] = t; }
      }
      out.push(arr.slice());
    }
    return out;
  }
  function arrivals(pz, states) { var t = trace(pz, states); return t[t.length - 1]; }
  function check(pz, states) {
    var a = arrivals(pz, states), ok = [], n = 0;
    for (var j = 0; j < pz.k; j++) { ok.push(a[j] === pz.target[j]); if (a[j] === pz.target[j]) n++; }
    return { arrived: a, ok: ok, right: n, all: n === pz.k };
  }
  function maskStates(mask, n) { var s = []; for (var i = 0; i < n; i++) s.push(!!(mask >> i & 1)); return s; }
  function toMask(states) { var m = 0; for (var i = 0; i < states.length; i++) if (states[i]) m |= 1 << i; return m; }
  function bits(x) { var n = 0; while (x) { x &= x - 1; n++; } return n; }
  // Every gate setting that solves the puzzle, as bit masks (at most 2^12 settings to check), cached on the puzzle.
  function solving(pz) {
    if (pz._sol) return pz._sol;
    var out = [];
    for (var m = 0; m < (1 << pz.nsw); m++) if (check(pz, maskStates(m, pz.nsw)).all) out.push(m);
    try { Object.defineProperty(pz, '_sol', { value: out, enumerable: false }); } catch (e) { }
    return out;
  }
  // The fewest gate flips that would solve the puzzle from these states.
  function minFlips(pz, states) {
    var sm = solving(pz), m0 = toMask(states), best = Infinity;
    for (var i = 0; i < sm.length; i++) { var d = bits(sm[i] ^ m0); if (d < best) best = d; }
    return best;
  }
  function solution(pz, states) { // a nearest solving setting
    var sm = solving(pz), m0 = toMask(states), best = null, bd = Infinity;
    for (var i = 0; i < sm.length; i++) { var d = bits(sm[i] ^ m0); if (d < bd) { bd = d; best = sm[i]; } }
    return best == null ? null : maskStates(best, pz.nsw);
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // A new puzzle: the fountains' order comes from a hidden solving setting, so every puzzle can be solved.
  function generate(level, rnd) {
    rnd = rnd || Math.random;
    var p = params(level);
    for (var tries = 0; tries < 300; tries++) {
      var gates = placeGates(p, rnd); if (!gates) continue;
      var pz = { level: p.level, k: p.k, rows: p.rows, gates: gates, nsw: p.gates, target: null, start: null };
      var sol = []; for (var i = 0; i < pz.nsw; i++) sol.push(rnd() < 0.5);
      pz.target = arrivals(pz, sol);
      var ident = pz.target.every(function (s, j) { return s === j; });
      if (ident && p.k > 2) continue;                               // let the fountains look shuffled
      for (var t2 = 0; t2 < 60; t2++) {
        var st = []; for (i = 0; i < pz.nsw; i++) st.push(rnd() < 0.5);
        var mf = minFlips(pz, st);
        if (mf >= p.minFlips && mf <= p.minFlips + 2) { pz.start = st; pz.flips = mf; return pz; }
      }
    }
    throw new Error('aqueduct: could not make a puzzle');
  }
  // Up a level after a full set, down after a miss.
  function adapt(level, allRight) { return clampLevel(level + (allRight ? 1 : -1)); }
  function points(level, right, all, rushRows) {
    return right * 10 + (all ? 5 * level + Math.max(0, Math.round((rushRows || 0) * 3)) : 0);
  }

  var LOGIC = { MAXLV: MAXLV, params: params, generate: generate, trace: trace, arrivals: arrivals, check: check, minFlips: minFlips, solution: solution, adapt: adapt, points: points, mulberry: mulberry, clampLevel: clampLevel };
  if (typeof module === 'object' && module.exports) { module.exports = LOGIC; return; }
  if (!D) return;

  // ================= page =================
  var root = D.getElementById('aq'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var RM = false; try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var SESSION = 120, KEY = 'trb-brain-v1', SLUG = 'aqueduct';

  function loadAll() { try { var d = JSON.parse(W.localStorage.getItem(KEY)); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
  function mine() { var m = loadAll()[SLUG]; if (!m || typeof m !== 'object') m = {}; if (!Array.isArray(m.sessions)) m.sessions = []; return m; }
  function saveMine(m) { try { var d = loadAll(); d[SLUG] = m; W.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } }
  function soundOn() { return loadAll().sound === true; }
  function setSound(v) { try { var d = loadAll(); d.sound = !!v; W.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } }

  // ---- sound: tiny synthesized effects, off until turned on ----
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
  function splash(d, vol, delay) {
    if (!SND) return; var a = ac(); if (!a) return;
    var t = a.currentTime + (delay || 0), len = Math.floor(a.sampleRate * d), b = a.createBuffer(1, len, a.sampleRate), x = b.getChannelData(0);
    for (var i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8; g.gain.value = vol || 0.15;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  var SFX = {
    flip: function () { tone(520, 0.05, 'square', 0.04); tone(330, 0.06, 'square', 0.035, 0, 0.035); },
    open: function () { splash(0.5, 0.1); tone(180, 0.35, 'sine', 0.06, 260); },
    good: function () { splash(0.4, 0.12); tone(523, 0.12, 'sine', 0.1, 0, 0.05); tone(659, 0.12, 'sine', 0.1, 0, 0.14); tone(784, 0.22, 'sine', 0.1, 0, 0.23); },
    bad: function () { tone(230, 0.3, 'triangle', 0.12, 140); },
    nope: function () { tone(150, 0.08, 'square', 0.04); },
    end: function () { tone(392, 0.15, 'sine', 0.1); tone(523, 0.3, 'sine', 0.1, 0, 0.15); }
  };

  // ---- streams: color (color-blind-safe set), pattern and shape, so color is never the only clue ----
  var STREAMS = [
    { c: '#0072B2', ink: '#fff', name: 'blue circle', pat: 'solid' },
    { c: '#E69F00', ink: '#1b1b1b', name: 'orange triangle', pat: 'stripes' },
    { c: '#009E73', ink: '#fff', name: 'green square', pat: 'dots' },
    { c: '#CC79A7', ink: '#1b1b1b', name: 'pink diamond', pat: 'bands' },
    { c: '#56B4E9', ink: '#1b1b1b', name: 'sky-blue star', pat: 'hatch' },
    { c: '#D55E00', ink: '#fff', name: 'red plus', pat: 'chevrons' }
  ];
  function starPath(R, r) { var p = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; p += (i ? 'L' : 'M') + (q * Math.cos(a)).toFixed(1) + ',' + (q * Math.sin(a)).toFixed(1); } return p + 'Z'; }
  var SHAPES = [
    '<circle r="10"/>', '<path d="M0,-12L11,8L-11,8Z"/>', '<rect x="-9" y="-9" width="18" height="18"/>',
    '<path d="M0,-13L12,0L0,13L-12,0Z"/>', '<path d="' + starPath(13, 5.5) + '"/>', '<path d="M-4,-11h8v7h7v8h-7v7h-8v-7h-7v-8h7z"/>'
  ];
  function patDefs() {
    var o = '';
    STREAMS.forEach(function (s, i) {
      var k = s.ink, a = s.ink === '#fff' ? 0.55 : 0.4, body = '';
      if (s.pat === 'stripes') body = '<path d="M-2,2L2,-2M0,12L12,0M10,14L14,10" stroke="' + k + '" stroke-width="3" stroke-opacity="' + a + '"/>';
      else if (s.pat === 'dots') body = '<circle cx="6" cy="6" r="2.6" fill="' + k + '" fill-opacity="' + a + '"/>';
      else if (s.pat === 'bands') body = '<rect x="0" y="0" width="12" height="4" fill="' + k + '" fill-opacity="' + a + '"/>';
      else if (s.pat === 'hatch') body = '<path d="M0,0L12,12M12,0L0,12" stroke="' + k + '" stroke-width="2" stroke-opacity="' + a + '"/>';
      else if (s.pat === 'chevrons') body = '<path d="M0,9L6,3L12,9" fill="none" stroke="' + k + '" stroke-width="2.6" stroke-opacity="' + a + '"/>';
      if (body) o += '<pattern id="aqp' + i + '" width="12" height="12" patternUnits="userSpaceOnUse">' + body + '</pattern>';
    });
    return o + '<clipPath id="aq-clip"><rect id="aq-cliprect" x="-50" y="0" width="2000" height="0"/></clipPath>';
  }
  function badge(i, x, y, r) {
    var s = STREAMS[i], sc = (r / 24).toFixed(3);
    return '<g transform="translate(' + x + ',' + y + ')"><circle r="' + r + '" fill="' + s.c + '"/>' + (s.pat !== 'solid' ? '<circle r="' + r + '" fill="url(#aqp' + i + ')"/>' : '') +
      '<circle r="' + r + '" fill="none" class="aq-ring" stroke-width="3"/><g transform="scale(' + sc + ')" fill="#fff" stroke="#1b1b1b" stroke-width="2.2">' + SHAPES[i] + '</g></g>';
  }

  var ICON = {
    pause: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="4" y="3" width="4.5" height="14" rx="1" fill="currentColor"/><rect x="11.5" y="3" width="4.5" height="14" rx="1" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5,3L17,10L5,17Z" fill="currentColor"/></svg>'
  };
  // ---- geometry ----
  var U = 100, RH = 80, TOP = 120, BOT = 132;
  function X(c) { return U / 2 + c * U; }
  function Y(r) { return TOP + r * RH; }


  // ---- state ----
  var M = mine(), G = null, P = null;
  if (M.pace !== 'calm') M.pace = 'flow';
  function startLevel() { return LOGIC.clampLevel((M.level || 1) - 1); }

  // ---- menu ----
  function chart(list) {
    var s = list.slice(-20);
    if (!s.length) return '<p class="aq-small">Your scores will show here after your first session.</p>';
    var max = Math.max.apply(null, s.map(function (x) { return x.score || 0; })) || 1, w = 300, h = 96, bw = w / Math.max(10, s.length), best = M.best || 0;
    var bars = s.map(function (x, i) {
      var v = x.score || 0, bh = Math.max(2, v / max * (h - 18)), top = v === best && v > 0;
      return '<rect x="' + (i * bw + 2).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + bh.toFixed(1) + '" class="' + (top ? 'aq-bar best' : 'aq-bar') + '" rx="2"/>' +
        '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (h - bh - 3).toFixed(1) + '" class="aq-barlv">' + (x.level || '') + '</text>';
    }).join('');
    return '<figure class="aq-chart"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Scores of your last ' + s.length + ' sessions, oldest first: ' + s.map(function (x) { return x.score || 0; }).join(', ') + '">' + bars + '</svg>' +
      '<figcaption>Your last ' + s.length + ' session' + (s.length > 1 ? 's' : '') + ': bar height is the score, the small number is the level reached' + (best ? '; the gold bar is your best' : '') + '.</figcaption></figure>';
  }
  function menu() {
    stopLoop(); G = null; P = null; M = mine(); if (M.pace !== 'calm') M.pace = 'flow';
    var lv = startLevel(), n = M.sessions.length;
    root.innerHTML = '<div class="aq-menu">' +
      '<div class="aq-hero">' + heroArt() + '<div><h1>Aqueduct Switches</h1><p class="aq-sub"><span class="la">aqua</span> water · <span class="la">fons</span> fountain</p></div></div>' +
      '<p>Water runs down from the <span class="la">castellum</span>, the water tower at the top. Flip the bronze sluice gates so every stream reaches the fountain with its own mark, before the water gets there.</p>' +
      '<div class="aq-opt"><span>Pace</span><div class="aq-seg" role="group" aria-label="Pace"><button data-pace="flow" aria-pressed="' + (M.pace === 'flow') + '"' + (M.pace === 'flow' ? ' class="on"' : '') + '>Flowing water</button><button data-pace="calm" aria-pressed="' + (M.pace === 'calm') + '"' + (M.pace === 'calm' ? ' class="on"' : '') + '>Calm: water waits for you</button></div></div>' +
      '<div class="aq-btns"><button class="aq-btn pri" id="aq-go">' + (n ? 'Play · level ' + lv : 'Start') + '</button>' + (lv > 1 ? '<button class="aq-btn" id="aq-go1">Start at level 1</button>' : '') + '</div>' +
      '<p class="aq-small">Two-minute sessions. A full set of fountains moves you up a level; a miss moves you down one.' + (n ? ' Best score: <b>' + (M.best || 0) + '</b> · highest level: <b>' + (M.top || 1) + '</b> · sessions: ' + n + '.' : '') + ' Saved only in this browser.</p>' +
      chart(M.sessions) +
      '<details class="aq-help"><summary>How to play</summary><ul>' +
      '<li>Each stream has its own color, pattern and shape. The fountain it must reach, at the bottom, shows the same mark.</li>' +
      '<li>Tap a framed gate to flip it: <b>straight</b> (the water runs straight down) or <b>crossed</b> (the two streams swap channels). Gray stone bridges with no frame always cross and can’t be changed.</li>' +
      '<li>Once water has reached a gate, that gate is fixed, so set the top gates first.</li>' +
      '<li>Done early? Press <b>Release the water</b> (or Space) for bonus points.</li>' +
      '<li>Keyboard: Tab to a gate, arrow keys to move between gates, Enter to flip; Space releases the water; P pauses; M turns sound on or off.</li>' +
      '<li>It’s a fun challenge for planning and spatial thinking. Getting better at it mostly means getting better at this game.</li></ul></details>' +
      '<details class="aq-help"><summary>Rome’s water</summary><p>Eleven aqueducts brought water to ancient Rome, much of it running downhill in covered channels, some of it high on arches. In AD 97 Sextus Julius Frontinus became <span class="la">curator aquarum</span>, the official in charge of the city’s water, and wrote a book about the aqueducts, <i>De aquis urbis Romae</i>. Water arrived at a <span class="la">castellum</span>, a tank that shared it out through pipes to public fountains, baths and a few private homes. At Nîmes in southern France you can still see the round <span class="la">castellum divisorium</span> where water from the Pont du Gard was split up for different parts of the town.</p></details>' +
      '</div>';
    root.querySelectorAll('[data-pace]').forEach(function (b) { b.onclick = function () { M.pace = b.dataset.pace; var m = mine(); m.pace = M.pace; saveMine(m); menu(); var f = root.querySelector('[data-pace="' + M.pace + '"]'); if (f) f.focus(); }; });
    $('#aq-go').onclick = function () { start(lv); };
    if ($('#aq-go1')) $('#aq-go1').onclick = function () { start(1); };
  }
  function heroArt() {
    var arches = ''; for (var i = 0; i < 4; i++) arches += '<path d="M' + (8 + i * 26) + ',58V34a11,11 0 0 1 22,0V58" class="aq-h-arch"/>';
    return '<svg class="aq-heroart" viewBox="0 0 120 70" aria-hidden="true"><rect x="4" y="12" width="112" height="10" class="aq-h-top"/><rect x="4" y="22" width="112" height="40" class="aq-h-wall"/>' + arches +
      '<path d="M4,16H116" stroke="#0072B2" stroke-width="5"/><path d="M4,16H116" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 6" opacity=".7"/></svg>';
  }

  // ---- a session ----
  function start(level) {
    stopLoop();
    G = { level: LOGIC.clampLevel(level), top: LOGIC.clampLevel(level), score: 0, time: SESSION, paused: false, solved: 0, tried: 0, over: false, last: 0, raf: 0, pace: M.pace };
    root.innerHTML = '<div class="aq-game">' +
      '<div class="aq-top"><button class="aq-btn sm" id="aq-back" aria-label="Menu">☰<span class="aq-wide"> Menu</span></button>' +
      '<div class="aq-info"><b id="aq-lv"></b><span id="aq-score"></span></div>' +
      '<div class="aq-clock" title="Time left"><span class="aq-clockbar"><i id="aq-clockfill"></i></span><span id="aq-time" aria-label="Time left"></span></div>' +
      '<button class="aq-btn sm" id="aq-snd"></button><button class="aq-btn sm" id="aq-pause" aria-label="Pause">' + ICON.pause + '</button></div>' +
      '<div class="aq-boardwrap"><div class="aq-board" id="aq-board"></div></div>' +
      '<div class="aq-bottom"><p class="aq-msg" id="aq-msg" aria-live="polite"></p><button class="aq-btn pri" id="aq-open"></button></div>' +
      '<div class="aq-modal" id="aq-modal" hidden></div></div>';
    $('#aq-back').onclick = function () { if (G && !G.over) { var m = mine(); m.level = G.level; m.top = Math.max(m.top || 1, G.top); saveMine(m); } menu(); };
    $('#aq-pause').onclick = function () { pause(!G.paused); };
    $('#aq-open').onclick = release;
    $('#aq-snd').onclick = function () { SND = !SND; setSound(SND); drawSnd(); if (SND) SFX.flip(); };
    drawSnd(); hud();
    newPuzzle(true);
    G.last = 0; G.raf = W.requestAnimationFrame(loop);
  }
  function drawSnd() { var b = $('#aq-snd'); if (!b) return; b.textContent = SND ? '🔊' : '🔇'; b.setAttribute('aria-label', SND ? 'Sound on' : 'Sound off'); b.setAttribute('aria-pressed', SND ? 'true' : 'false'); }
  function hud() {
    if (!G) return;
    $('#aq-lv').textContent = 'Level ' + G.level;
    $('#aq-score').textContent = G.score + ' pts';
    var t = Math.max(0, Math.ceil(G.time)); $('#aq-time').textContent = Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2);
    $('#aq-clockfill').style.width = Math.max(0, G.time / SESSION * 100).toFixed(1) + '%';
  }
  function msg(h) { var m = $('#aq-msg'); if (m) m.innerHTML = h; }

  function newPuzzle(first) {
    var pz = LOGIC.generate(G.level), p = LOGIC.params(G.level);
    var hadFocus = D.activeElement && D.activeElement.classList && D.activeElement.classList.contains('aq-gate');
    P = { pz: pz, states: pz.start.slice(), phase: 'wait', wait: p.head, v: p.speed, f: -(TOP - 70) / RH, fEnd: pz.rows + 0.62, rush: false, rushAt: 0, forced: false, locked: {} };
    G.tried++;
    buildBoard();
    if (first) msg(G.pace === 'calm' ? 'Trace each stream down to its fountain, tap gates to flip them, then release the water.' : 'Trace each stream down to its fountain and tap gates to flip them. The water comes soon!');
    else msg(G.pace === 'calm' ? 'Set the gates, then release the water.' : 'New channels. Set the top gates first.');
    openLabel();
    if (hadFocus) { var g0 = root.querySelector('.aq-gate:not(.fixed)'); if (g0) g0.focus(); }
  }
  function openLabel() {
    var b = $('#aq-open'); if (!b || !P) return;
    b.disabled = P.phase === 'done' || P.rush;
    b.textContent = P.phase === 'wait' ? 'Release the water ▶' : 'Hurry the water ⏩';
  }
  function buildBoard() {
    var pz = P.pz, w = pz.k * U, h = Y(pz.rows) + BOT, o = '';
    var bd = $('#aq-board');
    bd.style.setProperty('--a', (w / h).toFixed(4)); bd.style.setProperty('--k', pz.k);
    o += '<svg viewBox="0 0 ' + w + ' ' + h + '" class="aq-svg" role="group" aria-describedby="aq-desc" aria-label="Aqueduct with ' + pz.k + ' streams and ' + pz.gates.filter(function (g) { return !g.fixed; }).length + ' gates"><defs>' + patDefs() + '</defs>';
    // background: arches of the aqueduct
    o += '<rect width="' + w + '" height="' + h + '" class="aq-bg"/>';
    for (var c = 0; c < pz.k; c++) o += '<path d="M' + (X(c) - 46) + ',' + h + 'V' + (TOP + 40) + 'a46,46 0 0 1 92,0V' + h + '" class="aq-arch"/>';
    // castellum
    o += '<rect x="4" y="14" width="' + (w - 8) + '" height="' + (TOP - 44) + '" rx="8" class="aq-cast"/><rect x="4" y="14" width="' + (w - 8) + '" height="10" rx="4" class="aq-cast-top"/>';
    o += '<g id="aq-tU"></g><g id="aq-wU" clip-path="url(#aq-clip)"></g><g id="aq-tO"></g><g id="aq-wO" clip-path="url(#aq-clip)"></g>';
    // sources
    for (c = 0; c < pz.k; c++) o += badge(c, X(c), 52, 22);
    o += '<g id="aq-countg"><rect x="' + (w / 2 - 64) + '" y="' + (TOP - 36) + '" width="128" height="30" rx="15" class="aq-pill"/><text id="aq-count" x="' + w / 2 + '" y="' + (TOP - 14) + '" class="aq-count"></text></g>';
    // fountains
    var by = Y(pz.rows);
    for (c = 0; c < pz.k; c++) {
      o += '<g class="aq-fount" id="aq-f' + c + '"><path d="M' + (X(c) - 40) + ',' + (by + 22) + 'h80l-8,26a10,10 0 0 1 -9,7h-46a10,10 0 0 1 -9,-7z" class="aq-basin"/>' +
        '<path d="M' + (X(c) - 34) + ',' + (by + 26) + 'h68l-5,17h-58z" class="aq-pool" id="aq-pool' + c + '"/>' +
        '<g class="aq-spray" id="aq-spray' + c + '"></g>' + badge(pz.target[c], X(c), by + 88, 19) +
        '<g class="aq-mark" id="aq-mark' + c + '"></g></g>';
    }
    // gates (interactive)
    pz.gates.forEach(function (g, i) {
      if (g.fixed) return;
      var x = X(g.c) - 44, y = Y(g.r) + 3;
      o += '<g class="aq-gate" data-i="' + i + '" tabindex="0" role="button"><rect x="' + x + '" y="' + y + '" width="' + (U + 88) + '" height="' + (RH - 6) + '" rx="12" class="aq-hit"/>' +
        '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (U + 82) + '" height="' + (RH - 12) + '" rx="10" class="aq-frame"/>' +
        '<path d="M' + (x + 3) + ',' + (Y(g.r) + RH / 2 - 9) + 'v18M' + (x + U + 85) + ',' + (Y(g.r) + RH / 2 - 9) + 'v18" class="aq-knob"/></g>';
    });
    o += '</svg><p class="aq-sr" id="aq-desc">Sources, left to right: ' + pz.target.map(function (_, j) { return STREAMS[j].name; }).join(', ') +
      '. Fountains, left to right, want: ' + pz.target.map(function (t) { return STREAMS[t].name; }).join(', ') + '.' + (pz.gates.some(function (g) { return g.fixed; }) ? ' Fixed stone bridges: ' + pz.gates.filter(function (g) { return g.fixed; }).map(function (g) { return 'row ' + (g.r + 1) + ', channels ' + (g.c + 1) + ' and ' + (g.c + 2); }).join('; ') + '.' : '') + '</p>';
    bd.innerHTML = o;
    bd.querySelectorAll('.aq-gate').forEach(function (el) {
      el.addEventListener('click', function () { flip(+el.dataset.i); });
    });
    drawChannels(); labelGates(); drawFront();
  }
  function labelGates() {
    root.querySelectorAll('.aq-gate').forEach(function (el) {
      var g = P.pz.gates[+el.dataset.i], x = P.states[g.sw], lock = !!P.locked[g.sw];
      el.classList.toggle('x', x); el.classList.toggle('lock', lock);
      el.setAttribute('aria-label', 'Gate in row ' + (g.r + 1) + ' joining channels ' + (g.c + 1) + ' and ' + (g.c + 2) + ': ' + (x ? 'crossed' : 'straight') + (lock ? ', water has passed' : ', press to flip'));
      if (lock) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
    });
  }
  function drawChannels() {
    // Each stream is drawn as one unbroken channel (no seams); where two channels cross, the one heading left
    // is drawn again on top as a little bridge. Stone bridges that can't be flipped are darker.
    var pz = P.pz, tr = LOGIC.trace(pz, P.states), eU = '', tU = '', wU = '', tO = '', wO = '';
    var cross = {}, fixedAt = {};
    pz.gates.forEach(function (g) {
      if (g.fixed || P.states[g.sw]) { cross[g.r + ':' + g.c] = g.c + 1; cross[g.r + ':' + (g.c + 1)] = g.c; }
      if (g.fixed) fixedAt[g.r + ':' + g.c] = fixedAt[g.r + ':' + (g.c + 1)] = 1;
    });
    function water(d, s, cap) { var st = STREAMS[s], k = 'aq-water' + (cap ? ' cap' : ''); return '<path d="' + d + '" stroke="' + st.c + '" class="' + k + '"/>' + (st.pat !== 'solid' ? '<path d="' + d + '" stroke="url(#aqp' + s + ')" class="' + k + '"/>' : ''); }
    for (var s = 0; s < pz.k; s++) {
      var c = s, d = 'M' + X(c) + ',70V' + Y(0);
      for (var r = 0; r < pz.rows; r++) {
        var to = cross[r + ':' + c] != null ? cross[r + ':' + c] : c;
        if (to === c) d += 'V' + Y(r + 1);
        else {
          d += 'V' + (Y(r) + RH * 0.18) + 'L' + X(to) + ',' + (Y(r + 1) - RH * 0.18) + 'V' + Y(r + 1);
          if (to < c) { // over the other channel
            var dd = 'M' + X(c) + ',' + (Y(r) + RH * 0.18) + 'L' + X(to) + ',' + (Y(r + 1) - RH * 0.18), fx = fixedAt[r + ':' + c] ? ' fixed' : '';
            tO += '<path d="' + dd + '" class="aq-edge cap' + fx + '"/><path d="' + dd + '" class="aq-trough cap' + fx + '"/>';
            wO += water(dd, s, true);
          }
        }
        c = to;
      }
      d += 'V' + (Y(pz.rows) + 30);
      eU += '<path d="' + d + '" class="aq-edge"/>'; tU += '<path d="' + d + '" class="aq-trough"/>'; wU += water(d, s, false);
    }
    $('#aq-tU').innerHTML = eU + tU; $('#aq-tO').innerHTML = tO; $('#aq-wU').innerHTML = wU; $('#aq-wO').innerHTML = wO;
  }
  function frontY() { return Math.max(0, Math.min(Y(P.pz.rows) + 34, TOP + P.f * RH)); }
  function drawFront() {
    var r = D.getElementById('aq-cliprect'); if (r) r.setAttribute('height', P.phase === 'wait' ? 0 : frontY());
    var c = D.getElementById('aq-count');
    var txt = P.phase === 'wait' ? (G.pace === 'calm' ? 'Ready? Release' : 'Water in ' + Math.max(1, Math.ceil(P.wait))) : '';
    if (c && c.textContent !== txt) { c.textContent = txt; D.getElementById('aq-countg').style.display = txt ? '' : 'none'; }
  }
  function flip(i) {
    if (!G || !P || G.paused || G.over) return;
    var g = P.pz.gates[i]; if (!g || g.fixed) return;
    if (P.phase === 'done') return;
    if (P.locked[g.sw]) { SFX.nope(); msg('The water has already passed that gate.'); return; }
    P.states[g.sw] = !P.states[g.sw];
    SFX.flip(); drawChannels(); labelGates();
  }
  function release() {
    if (!G || !P || G.paused || G.over || P.phase === 'done' || P.rush) return;
    P.rush = true; P.rushAt = P.f; P.phase = 'flow'; SFX.open(); openLabel();
  }
  function lockPassed() {
    var ch = false;
    P.pz.gates.forEach(function (g) { if (!g.fixed && !P.locked[g.sw] && P.f >= g.r + 0.12) { P.locked[g.sw] = true; ch = true; } });
    if (ch) labelGates();
  }
  function resolve() {
    P.phase = 'done'; openLabel();
    var r = LOGIC.check(P.pz, P.states), lv = G.level;
    var rushRows = P.rush && !P.forced ? Math.max(0, P.fEnd - P.rushAt) : 0;
    var pts = LOGIC.points(lv, r.right, r.all, rushRows);
    G.score += pts; if (r.all) G.solved++;
    G.level = LOGIC.adapt(lv, r.all); if (G.level > G.top) G.top = G.level;
    // fountains
    var by = Y(P.pz.rows);
    for (var j = 0; j < P.pz.k; j++) {
      var s = STREAMS[r.arrived[j]], pool = D.getElementById('aq-pool' + j), mk = D.getElementById('aq-mark' + j), sp = D.getElementById('aq-spray' + j), x = X(j);
      if (pool) { pool.style.fill = s.c; }
      if (mk) mk.innerHTML = '<g transform="translate(' + (x + 30) + ',' + (by + 70) + ')"><circle r="13" class="' + (r.ok[j] ? 'aq-ok' : 'aq-no') + '"/><text y="5" class="aq-marktxt">' + (r.ok[j] ? '✓' : '✗') + '</text></g>';
      if (sp && r.ok[j]) sp.innerHTML = '<path d="M' + x + ',' + (by + 24) + 'q-14,-26 -26,-6M' + x + ',' + (by + 24) + 'q14,-26 26,-6M' + x + ',' + (by + 24) + 'v-26" stroke="' + s.c + '" class="aq-jet' + (RM ? '' : ' anim') + '"/>';
    }
    var lvTxt = G.level > lv ? ' Up to level ' + G.level + '.' : G.level < lv ? ' Down to level ' + G.level + '.' : '';
    if (r.all) { SFX.good(); msg('<b class="la">' + (rushRows > 0.5 ? 'Optime!' : 'Bene!') + '</b> Every stream reached its fountain. +' + pts + (rushRows > 0.5 ? ' (with a bonus for releasing early)' : '') + '.' + lvTxt); }
    else { SFX.bad(); msg(r.right + ' of ' + P.pz.k + ' fountains right. +' + pts + '.' + lvTxt + ' The ✗ shows a fountain that got the wrong water.'); }
    hud();
    P.next = r.all ? 1.1 : 2.2;
  }
  function pause(on) {
    if (!G || G.over) return;
    G.paused = on;
    var m = $('#aq-modal');
    if (on) {
      m.hidden = false; m.classList.add('solid');
      m.innerHTML = '<div class="aq-box" role="dialog" aria-modal="true" aria-label="Paused"><h2>Paused</h2><p>The water waits. The board is hidden while you rest.</p><div class="aq-btns"><button class="aq-btn pri" id="aq-resume">Resume</button><button class="aq-btn" id="aq-quit">End session</button></div></div>';
      $('#aq-resume').onclick = function () { pause(false); };
      $('#aq-quit').onclick = function () { G.time = 0; pause(false); if (P && P.phase !== 'done') { P.forced = true; P.rush = true; P.phase = 'flow'; P.rushAt = P.f; } };
      $('#aq-resume').focus();
      $('#aq-pause').innerHTML = ICON.play; $('#aq-pause').setAttribute('aria-label', 'Resume');
    } else {
      m.hidden = true; m.innerHTML = ''; m.classList.remove('solid');
      $('#aq-pause').innerHTML = ICON.pause; $('#aq-pause').setAttribute('aria-label', 'Pause');
    }
  }
  function stopLoop() { if (G && G.raf) W.cancelAnimationFrame(G.raf); if (G) G.raf = 0; }
  function loop(ts) {
    if (!G || G.over) return;
    var dt = G.last ? Math.min(0.1, (ts - G.last) / 1000) : 0; G.last = ts;
    if (W.__aqFast) dt *= W.__aqFast;
    if (!G.paused && P) {
      G.time -= dt;
      if (G.time <= 0 && P.phase !== 'done' && !P.rush) { P.forced = true; P.rush = true; P.rushAt = P.f; P.phase = 'flow'; openLabel(); }
      if (P.phase === 'wait') {
        if (G.pace === 'flow') { P.wait -= dt; if (P.wait <= 0) { P.phase = 'flow'; SFX.open(); openLabel(); } }
      } else if (P.phase === 'flow') {
        P.f += dt * (P.rush ? 5 : P.v);
        lockPassed();
        if (P.f >= P.fEnd) { P.f = P.fEnd; resolve(); }
      } else if (P.phase === 'done') {
        P.next -= dt;
        if (P.next <= 0) { if (G.time <= 0) { end(); return; } newPuzzle(false); }
      }
      drawFront(); hud();
    }
    G.raf = W.requestAnimationFrame(loop);
  }
  function saveSession() {
    var m = mine();
    m.sessions.push({ t: Date.now(), score: G.score, level: G.top, solved: G.solved, tried: G.tried });
    if (m.sessions.length > 30) m.sessions = m.sessions.slice(-30);
    var nb = G.score > (m.best || 0) && m.sessions.length > 1;
    if (G.score > (m.best || 0)) m.best = G.score;
    m.level = G.level; m.top = Math.max(m.top || 1, G.top); m.pace = M.pace;
    saveMine(m); M = m;
    return nb;
  }
  function end() {
    G.over = true; stopLoop();
    var tried = G.tried, nb = saveSession();
    SFX.end();
    var m = $('#aq-modal'); m.hidden = false;
    m.innerHTML = '<div class="aq-box" role="dialog" aria-modal="true" aria-label="Session over"><h2>' + (nb ? '<span class="la">Optime!</span> A new best' : 'Time’s up') + '</h2>' +
      '<p class="aq-big">' + G.score + ' points</p>' +
      '<dl class="aq-stats"><div><dt>Set right</dt><dd>' + G.solved + ' of ' + tried + '</dd></div><div><dt>Level reached</dt><dd>' + G.top + '</dd></div><div><dt>Best</dt><dd>' + (M.best || 0) + '</dd></div></dl>' +
      chart(M.sessions) +
      '<div class="aq-btns"><button class="aq-btn pri" id="aq-again">Play again</button><button class="aq-btn" id="aq-tomenu">Menu</button></div></div>';
    $('#aq-again').onclick = function () { start(startLevel()); };
    $('#aq-tomenu').onclick = menu;
    $('#aq-again').focus();
    var o = $('#aq-open'); if (o) o.disabled = true;
  }

  D.addEventListener('keydown', function (e) {
    if (!G || G.over || !root.querySelector('.aq-game')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, t = e.target;
    if (k === 'p' || k === 'P' || (k === 'Escape' && !G.paused)) { e.preventDefault(); pause(!G.paused); return; }
    if (k === 'Escape' && G.paused) { e.preventDefault(); pause(false); return; }
    if (G.paused) return;
    if (k === 'm' || k === 'M') { e.preventDefault(); $('#aq-snd').click(); return; }
    var onCtl = t && t.closest && t.closest('button, a, .aq-gate, input, select, textarea');
    if (k === ' ' && !onCtl) { e.preventDefault(); release(); }
  });
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !G.over && !G.paused) pause(true); });

  // tiny test hooks for the site's automated checks
  W.__aq = {
    logic: LOGIC,
    get G() { return G; }, get P() { return P; },
    solve: function () { if (!P) return; var s = LOGIC.solution(P.pz, P.states); if (s) { P.states = s; drawChannels(); labelGates(); } },
    release: release, flip: flip
  };
  menu();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
