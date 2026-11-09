/* Math Gallery: Schelling's model of segregation (T. C. Schelling, "Dynamic Models of Segregation," Journal of
   Mathematical Sociology 1, 1971, 143-186). Our own code. Agents of two or three colors live on a square grid with some
   empty cells. An agent is content when the share of like neighbors (among the occupied neighboring cells) is at least
   the threshold T (and, in the "also wants some difference" variant, at most U). Discontent agents move.
   Neighborhoods: 8 (the ring around a cell), 4 (up, down, left, right) or 24 (two rings). Move rules: a random empty cell
   where the agent would be content, the nearest such cell, or any random empty cell. Update orders: one at a time in a
   random order, each agent checked when its turn comes; or the list of discontent agents made at the start of the round.
   An agent with no occupied neighbors counts as content. A run stops ("settles") after a round with no moves.
   Measures, after each round: the average share of like neighbors (agents with at least one neighbor), the share of
   discontent agents, and a block index: the multigroup dissimilarity index (Reardon and Firebaugh 2002) over 5x5 blocks,
   0 when every block has the board's mix and 1 when every block is one color.
   Gallery.schelling(opts) is the bare model (used by the tests in /tmp/work_schelling and by this page). */
(function () {
  'use strict';
  var G = window.Gallery = window.Gallery || {};
  var EPS = 1e-9, BLOCK = 5;

  function hoodOffsets(h) {
    var o = [], r = h === '24' ? 2 : 1, dx, dy;
    for (dy = -r; dy <= r; dy++) for (dx = -r; dx <= r; dx++) {
      if (!dx && !dy) continue;
      if (h === '4' && Math.abs(dx) + Math.abs(dy) !== 1) continue;
      o.push(dx, dy);
    }
    return o;
  }

  // opts: n (side), groups (2|3), red (red's share of people; the rest split evenly), empty (share of cells),
  // T, U (1 = no upper bound), hood ('8'|'4'|'24'), move ('ok'|'near'|'any'), order ('seq'|'batch'), wrap, seed
  function create(opts) {
    var m = { o: {} }, k;
    for (k in opts) m.o[k] = opts[k];
    var o = m.o, n, N, K, nb, cells, empt, pos, stamp, rng, near, q, qi, roundNo, moves, L = 0, O = 0;

    function buildHood() {
      var off = hoodOffsets(o.hood), x, y, i, j, c;
      K = off.length / 2; nb = new Int32Array(N * K);
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
        i = y * n + x;
        for (j = 0; j < K; j++) {
          var xx = x + off[2 * j], yy = y + off[2 * j + 1];
          if (o.wrap) { xx = (xx + n) % n; yy = (yy + n) % n; c = yy * n + xx; }
          else c = (xx < 0 || yy < 0 || xx >= n || yy >= n) ? -1 : yy * n + xx;
          nb[i * K + j] = c;
        }
      }
    }
    // offsets for "nearest": every other cell, sorted by distance, ties in a seeded random order
    function buildNear() {
      var a = [], dx, dy, lo = o.wrap ? -Math.floor((n - 1) / 2) : -(n - 1), hi = o.wrap ? Math.floor(n / 2) : n - 1;
      for (dy = lo; dy <= hi; dy++) for (dx = lo; dx <= hi; dx++) if (dx || dy) a.push([dx * dx + dy * dy, rng(), dx, dy]);
      a.sort(function (p, r) { return p[0] - r[0] || p[1] - r[1]; });
      near = new Int32Array(a.length * 2);
      for (var i = 0; i < a.length; i++) { near[2 * i] = a[i][2]; near[2 * i + 1] = a[i][3]; }
    }
    function count(i, t) {
      var l = 0, c = 0, b = i * K, j, v;
      for (j = 0; j < K; j++) { v = nb[b + j]; if (v < 0) continue; v = cells[v]; if (v) { c++; if (v === t) l++; } }
      L = l; O = c;
    }
    function content(i, t) {
      count(i, t); if (!O) return true;
      var f = L / O; return f >= o.T - EPS && f <= o.U + EPS;
    }
    m.content = content;
    function shuffle(a, len) { for (var i = len - 1; i > 0; i--) { var r = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[r]; a[r] = t; } }
    function swapE(a, b) { var x = empt[a], y = empt[b]; empt[a] = y; empt[b] = x; pos[y] = a; pos[x] = b; }
    function find(t, from) {
      var E = empt.length, i, j;
      if (!E) return -1;
      if (o.move === 'any') return empt[Math.floor(rng() * E)];
      if (o.move === 'ok') {
        for (i = 0; i < E; i++) { swapE(i, i + Math.floor(rng() * (E - i))); j = empt[i]; if (content(j, t)) return j; }
        return -1;
      }
      var x0 = from % n, y0 = (from - x0) / n, len = near.length / 2;
      for (i = 0; i < len; i++) {
        var xx = x0 + near[2 * i], yy = y0 + near[2 * i + 1];
        if (o.wrap) { xx = (xx + n) % n; yy = (yy + n) % n; } else if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        j = yy * n + xx;
        if (!cells[j] && content(j, t)) return j;
      }
      return -1;
    }
    function moveAgent(i, j) {
      var t = cells[i], p = pos[j];
      cells[j] = t; cells[i] = 0; empt[p] = i; pos[i] = p; pos[j] = -1; stamp[j] = roundNo; moves++;
      if (m.dirty.length < N) m.dirty.push(i, j); else m.dirtyAll = true;
    }
    function startRound() {
      roundNo++; moves = 0; var list = [], i;
      for (i = 0; i < N; i++) if (cells[i] && (o.order === 'seq' || !content(i, cells[i]))) list.push(i);
      shuffle(list, list.length); q = list; qi = 0;
    }
    function endRound() {
      m.rounds++; record();
      if (!moves) m.settled = true; else startRound();
    }
    // process up to k queued agents; returns true when a round ended
    m.advance = function (k) {
      if (m.settled) return false;
      while (k-- > 0 && qi < q.length) {
        var i = q[qi++], t = cells[i];
        if (!t || stamp[i] === roundNo) continue;
        if (o.order === 'seq' && content(i, t)) continue;
        cells[i] = 0; var j = find(t, i); cells[i] = t;
        if (j >= 0) moveAgent(i, j);
      }
      if (qi >= q.length) { endRound(); return true; }
      return false;
    };
    m.round = function () { if (m.settled) return; while (!m.advance(1e9)) { } };
    m.queueLength = function () { return q ? q.length : 0; };
    m.run = function (max) { while (!m.settled && m.rounds < max) m.round(); return m.stats(); };

    m.stats = function () {
      var s = 0, c = 0, unh = 0, ag = 0, i, t, cnt = [0, 0, 0, 0];
      for (i = 0; i < N; i++) {
        t = cells[i]; if (!t) continue; ag++; cnt[t]++;
        count(i, t);
        if (O) { s += L / O; c++; var f = L / O; if (f < o.T - EPS || f > o.U + EPS) unh++; }
      }
      // block index (multigroup dissimilarity)
      var nbk = Math.ceil(n / BLOCK), bc = new Int32Array(nbk * nbk * 4), x, y, g, P = [0, 0, 0, 0], I = 0, D = 0;
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) { t = cells[y * n + x]; if (t) bc[((Math.floor(y / BLOCK) * nbk + Math.floor(x / BLOCK)) * 4) + t]++; }
      for (g = 1; g <= 3; g++) { P[g] = ag ? cnt[g] / ag : 0; I += P[g] * (1 - P[g]); }
      for (i = 0; i < nbk * nbk; i++) {
        var tb = bc[4 * i + 1] + bc[4 * i + 2] + bc[4 * i + 3]; if (!tb) continue;
        for (g = 1; g <= 3; g++) D += tb * Math.abs(bc[4 * i + g] / tb - P[g]);
      }
      D = (ag && I) ? D / (2 * ag * I) : 0;
      return { like: c ? s / c : 0, unhappy: ag ? unh / ag : 0, block: D, agents: ag, unhappyCount: unh, rounds: m.rounds, settled: m.settled };
    };
    // history (at most 400 points: when full, keep every other point and record half as often)
    function record() {
      var h = m.hist;
      if (m.rounds % h.stride) return;
      var s = m.stats(); h.like.push(s.like); h.unh.push(s.unhappy); h.blk.push(s.block); h.r.push(m.rounds);
      if (h.like.length >= 400) {
        ['like', 'unh', 'blk', 'r'].forEach(function (key) { h[key] = h[key].filter(function (v, idx) { return idx % 2 === 0; }); });
        h.stride *= 2;
      }
    }
    m.reset = function () {
      n = o.n; N = n * n; rng = G.rng(o.seed);
      cells = new Uint8Array(N); stamp = new Int32Array(N); pos = new Int32Array(N);
      var occ = Math.round(N * (1 - o.empty)), red = Math.round(occ * o.red), rest = occ - red, blue = o.groups === 3 ? Math.round(rest / 2) : rest, i;
      var order = []; for (i = 0; i < N; i++) order.push(i);
      shuffle(order, N);
      for (i = 0; i < N; i++) cells[order[i]] = i < red ? 1 : i < red + blue ? 2 : i < occ ? 3 : 0;
      empt = []; for (i = 0; i < N; i++) { if (!cells[i]) { pos[i] = empt.length; empt.push(i); } else pos[i] = -1; }
      buildHood(); buildNear();
      roundNo = 0; m.rounds = 0; m.settled = false; m.cells = cells; m.n = n; m.dirty = []; m.dirtyAll = true;
      m.hist = { like: [], unh: [], blk: [], r: [], stride: 1 };
      record(); startRound();
      return m;
    };
    m.setHood = function (h) { o.hood = h; buildHood(); m.unsettle(); };
    m.unsettle = function () { if (m.settled) { m.settled = false; startRound(); } };
    m.likeAt = function (i) { var t = cells[i]; if (!t) return null; count(i, t); return { t: t, like: L, occ: O, ok: content(i, t) }; };
    return m.reset();
  }
  G.schelling = create;
  if (!G.piece) return;

  G.piece('schelling-segregation', function (g) {
    var M = Math;
    var GROUPS = ['red', 'blue', 'gold'];
    var GC = { light: ['#d55e00', '#0072b2', '#c98a00'], dark: ['#ff8a4c', '#56b4e9', '#f0c24f'] };
    var S = { n: 60, groups: 2, red: 0.5, empty: 0.1, T: 0.3, U: 1, hood: '8', move: 'ok', order: 'seq', wrap: true, seed: 1 };
    var compare = false, outlines = true, rate = 6, A, B;

    var bo = { aspect: 1, max: 560, min: 220, label: 'The board: red circles, blue squares and gold triangles on a grid with empty cells. Unhappy agents have a dark outline.' };
    var cv = g.canvas(bo);
    var co = { aspect: 0.3, max: 200, min: 150, label: 'Three live charts over the rounds: the average share of like neighbors, the share of unhappy agents, and the block index.' };
    var ch = g.canvas(co);
    function shape() {
      var w = g.stage.clientWidth || 600;
      if (compare) { bo.aspect = 0.5 + 26 / w; bo.max = 440; } else { bo.aspect = 1; bo.max = w < 640 ? 520 : 440; }
      co.aspect = w < 640 ? 1.25 : 0.25; co.max = w < 640 ? 540 : 180;
      cv.fit(); ch.fit();
    }

    function build() {
      pick = null; if (st4) st4.textContent = '';
      var o = {}, k; for (k in S) o[k] = S[k];
      if (compare) { o.T = 0.3; A = create(o); var o2 = {}; for (k in o) o2[k] = o[k]; o2.T = 0.5; B = create(o2); }
      else { A = create(o); B = null; }
      report(); g.redraw();
    }
    function models() { return B ? [A, B] : [A]; }
    function allSettled() { return models().every(function (m) { return m.settled; }); }

    // loop: `rate` rounds per second (0 = as fast as the device allows)
    var lastSay = 0, lastRep = 0;
    var Lp = g.loop(function (dt) {
      var t0 = performance.now();
      models().forEach(function (m) {
        if (m.settled) return;
        if (!rate) { do { m.advance(64); } while (!m.settled && performance.now() - t0 < 12); }
        else { m.carry = (m.carry || 0) + rate * dt * M.max(1, m.queueLength()); var k = M.floor(m.carry); m.carry -= k;
          // in chunks, within a time budget, so a slow round never freezes the page
          while (k > 0 && !m.settled && performance.now() - t0 < 14) { var c = M.min(k, 64); k -= c; if (m.advance(c)) { m.carry = 0; break; } }
          if (k > 0) m.carry = 0; }
      });
      var nowR = performance.now(); if (nowR - lastRep > 100 || allSettled()) { lastRep = nowR; report(); }
      g.redraw();
      if (allSettled()) { report(); announce(); return false; }
      return true;
    }, { stepText: 'Step a round', auto: true });
    Lp.stepOnce = (function () { return function () { Lp.pause(); models().forEach(function (m) { m.round(); }); report(); g.redraw(); announce(); }; })();
    var stepBtn = g.bar.querySelector('.gx-step');
    if (stepBtn) { var nb2 = stepBtn.cloneNode(true); stepBtn.parentNode.replaceChild(nb2, stepBtn); nb2.addEventListener('click', function () { Lp.stepOnce(); }); }
    var playBtn = g.bar.querySelector('.gx-play');
    playBtn.addEventListener('click', function () { if (allSettled() && !Lp.playing()) { models().forEach(function (m) { m.unsettle(); }); } }, true);

    var row1 = g.group();
    row1.appendChild(playBtn); if (nb2) row1.appendChild(nb2);
    g.button('↺ Reset', function () { Lp.pause(); build(); g.say('Reset with seed ' + S.seed + '.'); }, { parent: row1 });
    g.button('New seed', function () { newSeed(); }, { parent: row1 });
    g.select({ parent: row1, label: 'Speed', value: '6', options: [['1', 'slow'], ['6', 'medium'], ['20', 'fast'], ['0', 'fastest']], change: function (v) { rate = +v; } });

    var row2 = g.group();
    var tS = g.slider({ parent: row2, label: 'Wants at least this share alike', min: 0, max: 100, value: 30, fmt: function (v) { return v + '%'; }, input: function (v) { setT(v / 100, false); } });
    var p30 = g.button('30%', function () { setT(0.3, true); }, { parent: row2 });
    var p50 = g.button('50%', function () { setT(0.5, true); }, { parent: row2 });
    var cmp = g.toggle('Compare 30% and 50% side by side', false, function (on) { compare = on; tS.input.disabled = on; p30.disabled = on; p50.disabled = on; shape(); build(); if (!g.reduced) Lp.play(); g.say(on ? 'Two boards with the same start: the left wants 30 percent alike, the right 50 percent.' : 'One board.'); }, { parent: row2 });

    // more settings
    var det = g.el('details', 'gx-row'); det.style.display = 'block';
    var sum = g.el('summary', null, 'More settings'); sum.style.cursor = 'pointer'; sum.style.fontSize = '.92rem'; sum.style.margin = '.2rem 0 .4rem';
    det.appendChild(sum); g.bar.appendChild(det);
    var r3 = g.el('div', 'gx-row'); det.appendChild(r3);
    var r4 = g.el('div', 'gx-row'); r4.style.marginTop = '.45rem'; det.appendChild(r4);
    var r5 = g.el('div', 'gx-row'); r5.style.marginTop = '.45rem'; det.appendChild(r5);
    function restart() { Lp.pause(); build(); if (!g.reduced) Lp.play(); }
    g.select({ parent: r3, label: 'Grid', value: '60', options: [['20', '20 × 20'], ['30', '30 × 30'], ['40', '40 × 40'], ['60', '60 × 60'], ['80', '80 × 80'], ['100', '100 × 100']], change: function (v) { S.n = +v; restart(); } });
    g.select({ parent: r3, label: 'Colors', value: '2', options: [['2', 'red and blue'], ['3', 'red, blue and gold']], change: function (v) { S.groups = +v; redS.set(S.groups === 3 ? 34 : 50); S.red = S.groups === 3 ? 0.34 : 0.5; restart(); } });
    var redS = g.slider({ parent: r3, label: 'Red’s share of people', min: 10, max: 90, value: 50, fmt: function (v) { return v + '%'; }, input: function (v) { S.red = v / 100; restartSoon(); } });
    g.slider({ parent: r3, label: 'Empty cells', min: 2, max: 50, value: 10, fmt: function (v) { return v + '%'; }, input: function (v) { S.empty = v / 100; restartSoon(); } });
    g.select({ parent: r4, label: 'Neighbors', value: '8', options: [['8', '8 around (ring)'], ['4', '4 (up, down, left, right)'], ['24', '24 (two rings)']], change: function (v) { S.hood = v; models().forEach(function (m) { m.setHood(v); }); report(); g.redraw(); kick(); } });
    g.select({ parent: r4, label: 'Unhappy agents move to', value: 'ok', options: [['ok', 'a random spot they like'], ['near', 'the nearest spot they like'], ['any', 'any empty spot']], change: function (v) { S.move = v; models().forEach(function (m) { m.o.move = v; m.unsettle(); }); kick(); } });
    g.select({ parent: r4, label: 'Order', value: 'seq', options: [['seq', 'one at a time'], ['batch', 'all unhappy at once']], change: function (v) { S.order = v; models().forEach(function (m) { m.o.order = v; m.unsettle(); }); kick(); } });
    var uOn = g.toggle('Also wants some difference', false, function (on) { uS.input.disabled = !on; setU(on ? uS.value() / 100 : 1); }, { parent: r5 });
    var uS = g.slider({ parent: r5, label: 'Moves if more alike than', min: 30, max: 100, value: 80, fmt: function (v) { return v + '%'; }, input: function (v) { if (uOn.checked) setU(v / 100); } });
    uS.input.disabled = true;
    g.toggle('Edges wrap around', true, function (on) { S.wrap = on; restart(); }, { parent: r5 });
    g.toggle('Outline unhappy agents', true, function (on) { outlines = on; g.redraw(); }, { parent: r5 });
    det.querySelectorAll('select').forEach(function (e) { e.style.maxWidth = '100%'; e.style.minWidth = '0'; e.parentNode.style.flexWrap = 'wrap'; });
    var seedIn = g.el('input'); seedIn.type = 'number'; seedIn.min = 1; seedIn.max = 99999; seedIn.value = S.seed; seedIn.style.width = '6.5em'; seedIn.style.padding = '.3rem .45rem'; seedIn.style.border = '1px solid currentColor'; seedIn.style.borderRadius = '8px'; seedIn.style.background = 'transparent'; seedIn.style.color = 'inherit'; seedIn.style.font = 'inherit'; seedIn.inputMode = 'numeric';
    var sl = g.el('label', 'gx-field'); sl.appendChild(g.el('span', 'gx-lbl', 'Seed')); sl.appendChild(seedIn); r5.appendChild(sl);
    seedIn.addEventListener('change', function () { var v = M.max(1, M.min(99999, M.round(+seedIn.value) || 1)); seedIn.value = v; S.seed = v; restart(); });

    var rt = 0; function restartSoon() { clearTimeout(rt); rt = setTimeout(restart, 180); }
    function kick() { if (!g.reduced && !allSettled()) Lp.play(); }
    function newSeed() { S.seed = 1 + M.floor(M.random() * 99999); seedIn.value = S.seed; restart(); g.say('New random start, seed ' + S.seed + '.'); }
    function setT(v, fromBtn) {
      if (compare) return;
      S.T = v; if (fromBtn) tS.set(M.round(v * 100));
      A.o.T = v; A.unsettle(); report(); g.redraw(); kick();
      if (fromBtn) g.say('Each agent now wants at least ' + M.round(v * 100) + ' percent of its neighbors alike.');
    }
    function setU(v) { S.U = v; models().forEach(function (m) { m.o.U = v; m.unsettle(); }); report(); g.redraw(); kick(); }

    var st1 = g.out(), st2 = g.out(), st3 = g.out(), st4 = g.out();
    var hint = g.el('p', 'gx-hint', 'Red ● circles, blue ■ squares, gold ▲ triangles. A dark outline marks an unhappy agent. Tap or click a cell to see its neighbors. Keys on the board: Space play or pause, S step, R reset, N new seed, 3 or 5 for 30% or 50%, arrows change the share.');
    g.bar.appendChild(hint);

    function pct(x) { return M.round(x * 100) + '%'; }
    function report() {
      var a = A.stats();
      if (B) {
        var b = B.stats();
        st1.innerHTML = '<b>Wants 30%:</b> round ' + a.rounds + ', like neighbors <b>' + pct(a.like) + '</b>, unhappy ' + pct(a.unhappy) + ', block index ' + a.block.toFixed(2) + (a.settled ? ', settled' : '');
        st2.innerHTML = '<b>Wants 50%:</b> round ' + b.rounds + ', like neighbors <b>' + pct(b.like) + '</b>, unhappy ' + pct(b.unhappy) + ', block index ' + b.block.toFixed(2) + (b.settled ? ', settled' : '');
        st3.textContent = 'In the charts, the green line is the 30% board and the purple line the 50% board.';
      } else {
        st1.innerHTML = 'Round <b>' + a.rounds + '</b> · like neighbors on average <b>' + pct(a.like) + '</b> · unhappy <b>' + pct(a.unhappy) + '</b> · block index <b>' + a.block.toFixed(2) + '</b>';
        st2.textContent = a.settled ? (a.unhappyCount ? 'Stuck: ' + g.fmt(a.unhappyCount) + ' unhappy agents can find no spot they like.' : 'Settled: everyone is happy.') : 'Each agent wants at least ' + pct(S.T) + ' alike' + (S.U < 1 ? ' and at most ' + pct(S.U) : '') + '.';
        st3.textContent = '';
      }
    }
    function announce() {
      var now = Date.now(); if (now - lastSay < 800) return; lastSay = now;
      var a = A.stats(), s = 'After ' + a.rounds + ' rounds, the average agent has ' + pct(a.like) + ' like neighbors' + (a.settled ? ' and the board has settled.' : '.');
      if (B) { var b = B.stats(); s = 'Wanting 30 percent alike gave ' + pct(a.like) + ' like neighbors; wanting 50 percent gave ' + pct(b.like) + '.'; }
      g.say(s);
    }

    // keyboard and taps
    g.keys(cv.el, {
      ' ': function () { if (allSettled() && !Lp.playing()) models().forEach(function (m) { m.unsettle(); }); Lp.toggle(); },
      's': function () { Lp.stepOnce(); }, 'S': function () { Lp.stepOnce(); },
      'r': function () { Lp.pause(); build(); }, 'R': function () { Lp.pause(); build(); },
      'n': newSeed, 'N': newSeed,
      '3': function () { setT(0.3, true); }, '5': function () { setT(0.5, true); },
      ArrowUp: function () { setT(M.min(1, M.round(S.T * 100 + 5) / 100), true); }, ArrowRight: function () { setT(M.min(1, M.round(S.T * 100 + 5) / 100), true); },
      ArrowDown: function () { setT(M.max(0, M.round(S.T * 100 - 5) / 100), true); }, ArrowLeft: function () { setT(M.max(0, M.round(S.T * 100 - 5) / 100), true); }
    });
    cv.el.setAttribute('aria-keyshortcuts', 'Space S R N 3 5 ArrowUp ArrowDown');
    var layout = [], chartKey = '', lastA = null;
    var pick = null;
    g.drag(cv.el, { touch: 'manipulation', down: function (x, y) {
      for (var k = 0; k < layout.length; k++) {
        var L = layout[k], cs = L.side / L.m.n;
        if (x >= L.x && y >= L.y && x < L.x + L.side && y < L.y + L.side) {
          var cx = M.floor((x - L.x) / cs), cy = M.floor((y - L.y) / cs), i = cy * L.m.n + cx, info = L.m.likeAt(i);
          pick = { m: L.m, i: i };
          if (!info) st4.textContent = 'An empty cell.';
          else st4.textContent = 'This ' + GROUPS[info.t - 1] + ' agent has ' + info.like + ' like ' + (info.like === 1 ? 'neighbor' : 'neighbors') + ' out of ' + info.occ + ' (' + (info.occ ? pct(info.like / info.occ) : 'no neighbors') + '): ' + (info.ok ? 'happy.' : 'unhappy.');
          g.say(st4.textContent); g.redraw(); return;
        }
      }
    } });

    // one small picture per shape, drawn once per size and theme, then stamped on the board (much faster than paths)
    var spKey = '', spC = null;
    function sprites(cs, gc) {
      var px = M.max(4, M.ceil(cs)), key = px + gc.join();
      if (key === spKey) return spC;
      spKey = key; spC = gc.map(function (c, t) {
        var e = document.createElement('canvas'); e.width = e.height = px; var x = e.getContext('2d'), u = px;
        x.fillStyle = c; x.beginPath();
        if (t === 0) x.arc(u / 2, u / 2, u * 0.43, 0, 2 * M.PI);
        else if (t === 1) x.rect(u * 0.13, u * 0.13, u * 0.74, u * 0.74);
        else { x.moveTo(u / 2, u * 0.08); x.lineTo(u * 0.94, u * 0.9); x.lineTo(u * 0.06, u * 0.9); x.closePath(); }
        x.fill(); return e;
      });
      return spC;
    }
    function drawBoard(x, m, x0, y0, side, col, gc) {
      var n = m.n, cs = side / n, cells = m.cells, i, t, cx, cy;
      // the cells live on a cached picture in device pixels; only cells that changed are repainted
      var d = cv.dpr || 1, key = M.round(side * d) + '|' + gc.join() + col.panel, C = m.cache;
      if (!C || C.key !== key) { C = m.cache = { key: key, el: document.createElement('canvas') }; C.el.width = C.el.height = M.round(side * d); C.x = C.el.getContext('2d'); m.dirtyAll = true; }
      var P = C.el.width / n, sp = sprites(P, gc), cx2 = C.x;
      function paint(i) {
        var c = i % n, r = (i - c) / n, ax = M.round(c * P), ay = M.round(r * P), w = M.round((c + 1) * P) - ax, h = M.round((r + 1) * P) - ay, tt = cells[i];
        cx2.fillStyle = col.panel; cx2.fillRect(ax, ay, w, h);
        if (!tt) return;
        if (P < 6) { cx2.fillStyle = gc[tt - 1]; cx2.fillRect(ax, ay, w, h); } else cx2.drawImage(sp[tt - 1], ax, ay, w, h);
      }
      if (m.dirtyAll) { for (i = 0; i < n * n; i++) paint(i); m.dirtyAll = false; m.dirty.length = 0; }
      else { for (i = 0; i < m.dirty.length; i++) paint(m.dirty[i]); m.dirty.length = 0; }
      x.drawImage(C.el, x0, y0, side, side);
      if (outlines) {
        x.beginPath();
        var lw = M.max(1, M.min(2.2, cs * 0.14));
        for (i = 0; i < n * n; i++) {
          t = cells[i]; if (!t || m.content(i, t)) continue;
          cx = x0 + (i % n) * cs; cy = y0 + M.floor(i / n) * cs;
          if (cs * (cv.dpr || 1) >= 6) x.rect(cx + lw / 2, cy + lw / 2, cs - lw, cs - lw);
          else x.rect(cx + cs * 0.25, cy + cs * 0.25, cs * 0.5, cs * 0.5);
        }
        x.strokeStyle = col.ink; x.lineWidth = cs * (cv.dpr || 1) >= 6 ? lw : M.max(0.8, cs * 0.3); x.stroke();
      }
      if (pick && pick.m === m) {
        var px = x0 + (pick.i % n) * cs, py = y0 + M.floor(pick.i / n) * cs;
        x.strokeStyle = col.green; x.lineWidth = 2; x.strokeRect(px - 2, py - 2, cs + 4, cs + 4);
      }
    }
    function drawChart(x, X, Y, w, h, title, series, col, refs, cur) {
      x.fillStyle = col.panel; x.fillRect(X, Y, w, h);
      var pl = 34, pr = 8, pt = 27, pb = 16, iw = w - pl - pr, ih = h - pt - pb;
      x.font = '600 12px system-ui,sans-serif'; x.fillStyle = col.ink; x.textAlign = 'left'; x.textBaseline = 'top';
      if (cur && x.measureText(title[0] + '  ' + cur).width > w - 20) title = [title[1] || title[0]];
      x.fillText(title[0], X + 8, Y + 5);
      if (cur) { x.textAlign = 'right'; x.fillText(cur, X + w - 8, Y + 5); }
      x.font = '10px system-ui,sans-serif'; x.fillStyle = col.muted; x.textAlign = 'right'; x.textBaseline = 'middle';
      x.strokeStyle = col.grid; x.lineWidth = 1; x.beginPath();
      [0, 0.5, 1].forEach(function (v) { var yy = Y + pt + ih * (1 - v); x.moveTo(X + pl, yy); x.lineTo(X + pl + iw, yy); x.fillText(M.round(v * 100) + '%', X + pl - 4, yy); });
      x.stroke();
      var maxR = 10; series.forEach(function (s) { var r = s.h.r; if (r.length) maxR = M.max(maxR, r[r.length - 1]); });
      x.textAlign = 'right'; x.textBaseline = 'top'; x.fillText('round ' + maxR, X + pl + iw, Y + pt + ih + 3);
      x.textAlign = 'left'; x.fillText('0', X + pl, Y + pt + ih + 3);
      (refs || []).forEach(function (r) {
        var yy = Y + pt + ih * (1 - r.v); x.setLineDash([4, 4]); x.strokeStyle = r.c; x.lineWidth = 1.2; x.beginPath(); x.moveTo(X + pl, yy); x.lineTo(X + pl + iw, yy); x.stroke(); x.setLineDash([]);
      });
      series.forEach(function (s) {
        var d = s.h[s.key], r = s.h.r; if (!d.length) return;
        x.strokeStyle = s.c; x.lineWidth = 2; x.beginPath();
        for (var k = 0; k < d.length; k++) { var px = X + pl + iw * r[k] / maxR, py = Y + pt + ih * (1 - M.max(0, M.min(1, d[k]))); if (k) x.lineTo(px, py); else x.moveTo(px, py); }
        if (d.length === 1) x.lineTo(X + pl + 3, Y + pt + ih * (1 - d[0]));
        x.stroke();
      });
    }

    g.draw(function (col) {
      var x = cv.ctx, W = cv.w, H = cv.h, gc = col.dark ? GC.dark : GC.light;
      cv.clear(col.bg); layout = [];
      if (!B) {
        var side = M.min(W, H); drawBoard(x, A, M.round((W - side) / 2), 0, side, col, gc); layout.push({ m: A, x: M.round((W - side) / 2), y: 0, side: side });
      } else {
        var gap = 10, s2 = M.min((W - gap) / 2, H - 26), x1 = M.round((W - 2 * s2 - gap) / 2);
        x.font = '600 13px system-ui,sans-serif'; x.fillStyle = col.ink; x.textBaseline = 'top'; x.textAlign = 'center';
        x.fillText('Wants 30% alike', x1 + s2 / 2, 4); x.fillText('Wants 50% alike', x1 + s2 + gap + s2 / 2, 4);
        drawBoard(x, A, x1, 24, s2, col, gc); drawBoard(x, B, x1 + s2 + gap, 24, s2, col, gc);
        layout.push({ m: A, x: x1, y: 24, side: s2 }, { m: B, x: x1 + s2 + gap, y: 24, side: s2 });
      }
      // charts: repainted only when a round ends or something else changes
      var ck = [A.rounds, B ? B.rounds : -1, S.T, S.U, ch.w, ch.h, col.dark, A.hist.like.length, B ? 1 : 0, A === lastA].join();
      if (ck === chartKey) return;
      chartKey = ck; lastA = A;
      var y = ch.ctx, w = ch.w, h = ch.h, wide = w >= 640;
      ch.clear(col.bg);
      var cA = col.green, cB = col.purple, a = A.stats(), b = B ? B.stats() : null;
      var ser = function (key) { var s = [{ h: A.hist, key: key, c: cA }]; if (B) s.push({ h: B.hist, key: key, c: cB }); return s; };
      var cur = function (k) { return B ? pct(a[k]) + ' · ' + pct(b[k]) : pct(a[k]); };
      var refs = B ? [{ v: 0.3, c: col.a(cA, 0.8) }, { v: 0.5, c: col.a(cB, 0.8) }] : [{ v: S.T, c: col.a(col.gold, 0.9) }];
      var pw = wide ? (w - 16) / 3 : w, ph = wide ? h : (h - 16) / 3;
      var boxes = [0, 1, 2].map(function (k) { return wide ? [k * (pw + 8), 0] : [0, k * (ph + 8)]; });
      drawChart(y, boxes[0][0], boxes[0][1], pw, ph, ['Like neighbors (dashed: the wish)', 'Like neighbors'], ser('like'), col, refs, cur('like'));
      drawChart(y, boxes[1][0], boxes[1][1], pw, ph, ['Unhappy agents'], ser('unh'), col, null, cur('unhappy'));
      drawChart(y, boxes[2][0], boxes[2][1], pw, ph, ['Block index'], ser('blk'), col, null, B ? a.block.toFixed(2) + ' · ' + b.block.toFixed(2) : a.block.toFixed(2));
    });

    shape(); window.addEventListener('resize', function () { setTimeout(function () { shape(); g.redraw(); }, 130); });
    build();
  });
})();
