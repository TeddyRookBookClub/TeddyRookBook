/* Game Theory, Chapter 1: Games, Players and Payoffs. Two interactives:
   1. "Guess 2/3 of the average" against a simulated crowd of level-k thinkers (main, with missions);
   2. a payoff-matrix editor where you play rounds against computer opponents with personalities.
   Models: model.js (window.GT1M), tested in node. Shared look and game math: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT1M, root = D.getElementById('gt1-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;
  var LVCOL = ['#8fb3c6', '#63e6be', '#ffd479', '#b197fc', '#f9a8d4', '#ff8787'];
  var LVNAME = ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Equilibrium'];

  /* =====================================================================================
     1. GUESS p × THE AVERAGE
     ===================================================================================== */
  (function () {
    var view = $('gt1-view'), cv = $('gt1-cv'), hud = $('gt1-hud'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, store = L.store('gt1');
    var el = { guess: $('gt1-guess'), guessO: $('gt1-guess-o'), play: $('gt1-play'), play2: $('gt1-play2'), crowd: $('gt1-crowd'), pseg: $('gt1-p'),
      n: $('gt1-n'), nO: $('gt1-n-o'), noise: $('gt1-noise'), noiseO: $('gt1-noise-o'), learn: $('gt1-learn'), ladder: $('gt1-ladder'), read: $('gt1-read'), reset: $('gt1-reset'), newg: $('gt1-new') };
    var S = { zoom: 100, guess: store.get('guess', 50), crowd: 'typical', p: 2 / 3, n: 40, noise: 3, learn: true, ladder: true,
      round: 0, anchor: 50, hist: [], last: null, guesses: [], levels: [], anim: 1, dots: [], drag: false, rng: GT.rng(Date.now() % 100000 + 7), winStreak: 0, parts: [] };
    var MS = L.missions($('gt1-missions'), 'gt1', [
      { id: 'play', title: 'Play a round', goal: 'Pick a number and press Play. The crowd guesses at the same time.' },
      { id: 'l1', title: 'Think one step ahead', goal: 'In a first round with p = 2/3, guess 33 (within 2): the best reply to a crowd that guesses 50 on average.' },
      { id: 'win', title: 'Beat the typical crowd', goal: 'Win a round against the Typical crowd: be the closest to the target.' },
      { id: 'nash', title: 'Right in theory, wrong in practice', goal: 'Guess 0, the Nash equilibrium, against the Typical crowd in a first round, and see it lose.' },
      { id: 'rational', title: 'A room full of game theorists', goal: 'Against the All rational crowd, guess 0: everyone ties, and no other guess would do better.' },
      { id: 'unravel', title: 'Watch it unravel', goal: 'With learning on and p = 2/3, keep playing until the target drops below 3.' },
      { id: 'flip', title: 'Turn the game upside down', goal: 'Set p to 4/3 and win a round. Where is the equilibrium now?' }
    ]);
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }
    function crowdLevels() { S.levels = M.makeCrowd(S.n, M.CROWDS[S.crowd].mix); }
    function newGame() { S.round = 0; S.anchor = 50; S.hist = []; S.last = null; S.dots = []; S.guesses = []; S.winStreak = 0; crowdLevels(); pickZoom(); sync(); }
    // geometry
    function geo() {
      var w = K.w, h = K.h, narrow = w < 560, Z = S.zoom;
      var ax0 = narrow ? 22 : 34, ax1 = w - (narrow ? 18 : 28), axY = h - (narrow ? 86 : 78);
      return { w: w, h: h, ax0: ax0, ax1: ax1, axY: axY, top: narrow ? 132 : 158, narrow: narrow, Z: Z, x: function (v) { return ax0 + (ax1 - ax0) * Math.min(v, Z * 1.02) / Z; }, v: function (x) { return clamp((x - ax0) / (ax1 - ax0) * Z, 0, Z); } };
    }
    function pickZoom() { // zoom the number line in when every number in play is small
      if (S.p > 1) { S.zoom = 100; return; }
      var m = Math.max(S.guess, S.learn ? S.anchor : 50, S.guesses.length ? Math.max.apply(null, S.guesses) : 0);
      S.zoom = [5, 10, 20, 50, 100].filter(function (z) { return z >= m * 1.04 || z === 100; })[0];
    }
    function layoutDots() { // stack the crowd's guesses into columns above the axis
      var G = geo(), n = S.guesses.length; if (!n) { S.dots = []; return; }
      var avail = G.axY - G.top - 18, rad = clamp((G.ax1 - G.ax0) / 130, 3, 7), colW = rad * 2 + 1, cols = {}, maxH = 0;
      var idx = S.guesses.map(function (g, i) { return i; }).sort(function (a, b) { return S.guesses[a] - S.guesses[b]; });
      idx.forEach(function (i) { var k = Math.round(G.x(S.guesses[i]) / colW); cols[k] = (cols[k] || 0) + 1; maxH = Math.max(maxH, cols[k]); });
      var step = Math.min(rad * 2 + 1, avail / Math.max(1, maxH)); cols = {};
      S.dots = idx.map(function (i, order) {
        var k = Math.round(G.x(S.guesses[i]) / colW), h = cols[k] || 0; cols[k] = h + 1;
        return { i: i, x: k * colW, y: G.axY - 10 - h * step - rad, r: Math.min(rad, step / 2 + 0.4), delay: reduced ? 0 : 0.05 + 0.9 * (order / n) + 0.15 * S.rng(), lv: S.levels[i] };
      });
    }
    function playRound() {
      if (S.anim < 1 && !reduced) return;
      var first = S.round === 0, anchor = S.learn ? S.anchor : 50;
      if (!S.learn && S.round > 0) anchor = 50;
      S.guesses = M.guesses(S.levels, S.p, anchor, S.noise, S.rng); S.lastGuess = S.guess;
      var all = S.guesses.concat([S.guess]), sc = M.score(all, S.p);
      S.round++; S.last = sc; S.lastAnchor = anchor; S.hist.push(sc.target); if (S.hist.length > 40) S.hist.shift();
      if (S.learn) S.anchor = sc.avg;
      pickZoom(); layoutDots(); S.anim = reduced ? 1 : 0; S.parts.length = 0;
      store.set('guess', S.guess);
      // missions
      var isTyp = S.crowd === 'typical', twoThirds = Math.abs(S.p - 2 / 3) < 1e-6;
      done('play', 'You played. Target: ' + fmt(sc.target, 1) + '.');
      if (first && twoThirds && Math.abs(S.guess - 33.33) <= 2) done('l1', 'Level 1: the best reply to an average of 50.');
      if (isTyp && sc.youWin) done('win', 'You beat the crowd!');
      if (isTyp && first && twoThirds && S.guess <= 0.5 && !sc.youWin) done('nash', 'Zero is the equilibrium, yet it lost to real-ish people.');
      if (S.crowd === 'rational' && S.guess <= 0.5 && p23(S.p)) done('rational', 'Everyone ties at 0: no one can do better alone.');
      if (S.learn && twoThirds && sc.target < 3 && S.round > 1) done('unravel', 'Round by round the guesses fell toward 0.');
      if (S.p > 1 && sc.youWin) done('flip', 'With p = 4/3 everything climbs toward 100.');
      if (sc.youWin) burst();
      sync();
    }
    function p23(p) { return p < 1; }
    function burst() { if (reduced) return; var G = geo(), x = G.x(S.guess); for (var k = 0; k < 40; k++) { var a = Math.PI * (0.15 + 0.7 * Math.random()), s = 90 + 160 * Math.random(); S.parts.push({ x: x, y: G.axY - 6, vx: -Math.cos(a) * s, vy: -Math.sin(a) * s, life: 1, col: [C.gold, C.pink, C.green, C.blue][k % 4] }); } }
    function setGuess(v) { S.guess = Math.round(clamp(v, 0, 100) * 10) / 10; el.guess.value = S.guess; el.guessO.textContent = fmt(S.guess, Number.isInteger(S.guess) ? 0 : 1); }
    function sync() {
      setGuess(S.guess);
      GT.seg(el.crowd, 'data-crowd', S.crowd); GT.seg(el.pseg, 'data-p', S.p > 1 ? '4/3' : S.p < 0.6 ? '1/2' : '2/3');
      el.n.value = S.n; el.nO.textContent = S.n + ' players'; el.noise.value = S.noise; el.noiseO.textContent = S.noise === 0 ? 'none' : '±' + S.noise;
      el.learn.checked = S.learn; el.ladder.checked = S.ladder;
      var sc = S.last, rows = [];
      rows.push(['Round', String(S.round)]);
      if (sc) {
        rows.push(['Average guess', fmt(sc.avg, 2)], ['Target (' + (GT.frac(S.p) || fmt(S.p, 2)) + ' × average)', fmt(sc.target, 2)]);
        var wg = sc.winners.map(function (k) { return k === sc.n - 1 ? S.guess : S.guesses[k]; });
        rows.push(['Winning guess', fmt(wg[0], 1) + (sc.winners.length > 1 ? ' (' + sc.winners.length + '-way tie)' : '')]);
        rows.push(['Your guess', fmt(S.lastGuess, 1)], ['Your distance', fmt(sc.dist[sc.n - 1], 2)], ['Your place', ordinal(sc.place) + ' of ' + sc.n]);
      } else rows.push(['Target', 'press Play']);
      el.read.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      el.play.textContent = S.round ? '▶ Play round ' + (S.round + 1) : '▶ Play';
      if (el.play2) el.play2.textContent = el.play.textContent;
      hudText();
      if (reduced || S.anim >= 1) render();
    }
    function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
    function hudText() {
      var a = S.learn ? S.anchor : 50, p = S.p, eq = M.eq(p), parts = ['Level 0 ≈ ' + fmt(a, 1)];
      for (var k = 1; k <= 3; k++) parts.push('L' + k + ' ' + fmt(M.levelGuess(k, p, a), 1));
      hud.innerHTML = '<b>Round ' + (S.round + 1) + '</b> · target = ' + (GT.frac(p) || fmt(p, 2)) + ' × average<br>' + parts.join(' → ') + ' → … → <b>Nash ' + eq + '</b>';
    }
    // ---------- drawing ----------
    function render() {
      var G = geo(), w = G.w, h = G.h; dr.bg(c, w, h);
      var sc = S.last, t = S.anim;
      // history of targets (top right, under the tool buttons)
      var hw = G.narrow ? Math.min(160, w - 172) : Math.min(230, w * 0.34), hh = G.narrow ? 58 : 74, hx = G.narrow ? 10 : w - hw - 12, hy = G.narrow ? 10 : 58;
      dr.panel(c, hx, hy, hw, hh, 'Target, round by round');
      if (S.hist.length) {
        var n = S.hist.length, mx = Math.max(10, Math.max.apply(null, S.hist), M.eq(S.p) > 50 ? 100 : 0) * 1.05, px = function (k) { return hx + 12 + (hw - 52) * (n === 1 ? 0.5 : k / (n - 1)); }, py = function (v) { return hy + hh - 9 - (hh - 34) * v / mx; };
        c.strokeStyle = C.green; c.lineWidth = 2; c.beginPath(); S.hist.forEach(function (v, k) { if (k) c.lineTo(px(k), py(v)); else c.moveTo(px(k), py(v)); }); c.stroke();
        c.fillStyle = C.green; S.hist.forEach(function (v, k) { c.beginPath(); c.arc(px(k), py(v), k === n - 1 ? 3.5 : 2, 0, 7); c.fill(); });
        dr.label(c, fmt(S.hist[n - 1], 1), px(n - 1) + 7, py(S.hist[n - 1]), C.green, { size: 10.5, bold: true });
      } else dr.label(c, 'no rounds yet', hx + hw / 2, hy + hh / 2 + 6, C.muted, { size: 11, align: 'center' });
      // axis
      c.strokeStyle = 'rgba(219,231,239,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(G.ax0, G.axY); c.lineTo(G.ax1, G.axY); c.stroke();
      var tk = G.Z / 20, lb = G.Z / (G.narrow ? 5 : 10);
      for (var q = 0; q <= 20; q++) {
        var v = q * tk, x = G.x(v), big = Math.abs(v / lb - Math.round(v / lb)) < 1e-6; c.strokeStyle = 'rgba(219,231,239,' + (big ? 0.5 : 0.25) + ')'; c.beginPath(); c.moveTo(x, G.axY); c.lineTo(x, G.axY + (big ? 6 : 3)); c.stroke();
        if (big) dr.label(c, String(Math.round(v * 10) / 10), x, G.axY + 15, C.muted, { size: 10.5, align: 'center' });
      }
      if (G.Z < 100) dr.label(c, 'zoomed in: 0 to ' + G.Z, G.ax1, G.h - 12, C.gold, { size: 11, bold: true, align: 'right' });
      // the staircase of reasoning
      if (S.ladder) {
        var a = sc ? S.lastAnchor : (S.learn ? S.anchor : 50), p = S.p, prev = a, yL = G.axY - 4;
        var xs = [a]; for (var k = 1; k <= 4; k++) xs.push(M.levelGuess(k, p, a));
        for (k = 1; k <= 4; k++) {
          var x0 = G.x(xs[k - 1]), x1 = G.x(xs[k]); if (Math.abs(x1 - x0) < 4) break;
          c.save(); c.strokeStyle = LVCOL[k]; c.globalAlpha = 0.55; c.lineWidth = 1.5; c.setLineDash([3, 3]);
          var hgt = clamp(Math.abs(x1 - x0) * 0.45, 10, 60); c.beginPath(); c.moveTo(x0, yL); c.quadraticCurveTo((x0 + x1) / 2, yL - hgt, x1, yL); c.stroke(); c.restore();
          dr.label(c, 'L' + k, (x0 + x1) / 2, yL - hgt / 2 - 6, LVCOL[k], { size: 10, bold: true, align: 'center', alpha: 0.85 });
          prev = xs[k];
        }
        var eqx = G.x(M.eq(p)); c.fillStyle = LVCOL[5]; c.beginPath(); c.moveTo(eqx, G.axY - 1); c.lineTo(eqx - 5, G.axY - 9); c.lineTo(eqx + 5, G.axY - 9); c.closePath(); c.fill();
        dr.label(c, 'Nash', clamp(eqx, G.ax0 + 14, G.ax1 - 14), G.axY + 30, LVCOL[5], { size: 10.5, bold: true, align: 'center' });
        void prev;
      }
      // dots
      var winSet = {}; if (sc) sc.winners.forEach(function (k) { winSet[k] = 1; });
      S.dots.forEach(function (d) {
        var tt = clamp((t * 1.25 - d.delay) / 0.35, 0, 1), e = 1 - Math.pow(1 - tt, 3); if (tt <= 0) return;
        var y = G.top - 30 + (d.y - G.top + 30) * e;
        c.globalAlpha = 0.35 + 0.65 * e; c.fillStyle = LVCOL[d.lv]; c.beginPath(); c.arc(d.x, y, d.r, 0, 7); c.fill(); c.globalAlpha = 1;
        if (t >= 1 && winSet[d.i]) { c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.arc(d.x, y, d.r + 3, 0, 7); c.stroke(); }
      });
      // average and target lines, once the dots have landed
      var showLines = sc && t >= 0.85, la = clamp((t - 0.85) / 0.15, 0, 1);
      if (showLines) {
        var xa = G.x(sc.avg), xt = G.x(sc.target);
        c.save(); c.globalAlpha = la; c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(xa, G.top - 6); c.lineTo(xa, G.axY); c.stroke(); c.setLineDash([]);
        c.strokeStyle = C.green; c.lineWidth = 2.5; c.shadowColor = C.green; c.shadowBlur = 8; c.beginPath(); c.moveTo(xt, G.top - 20); c.lineTo(xt, G.axY); c.stroke(); c.restore();
        var la1 = 'average ' + fmt(sc.avg, 1), la2 = 'target ' + fmt(sc.target, 1);
        sideLabel(la2, xt, G.top - 26, C.green, true, xt <= xa, la, G);
        sideLabel(la1, xa, G.top - 10, '#fff', false, xt > xa, la, G);
      }
      // your marker
      var xy = G.x(S.guess), win = sc && sc.youWin && t >= 1;
      c.save(); c.strokeStyle = C.pink; c.lineWidth = 2; c.globalAlpha = 0.85; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(xy, G.top + 4); c.lineTo(xy, G.axY); c.stroke(); c.restore();
      c.save(); if (win) { c.shadowColor = C.pink; c.shadowBlur = 14; } c.fillStyle = C.pink; c.beginPath(); c.moveTo(xy, G.axY + 2); c.lineTo(xy - 9, G.axY + 16); c.lineTo(xy + 9, G.axY + 16); c.closePath(); c.fill(); c.restore();
      dr.label(c, 'You ' + fmt(S.guess, Number.isInteger(S.guess) ? 0 : 1), clamp(xy, G.ax0 + 22, G.ax1 - 22), G.axY + 46, C.pink, { size: 12.5, bold: true, align: 'center' });
      // result banner
      var bx = G.narrow ? w / 2 : (w - Math.min(230, w * 0.34) - 12) / 2 + 6, by = G.narrow ? 90 : 84;
      if (sc && t >= 1) {
        var msg = sc.youWin ? (sc.winners.length > 1 ? 'You tied for the win (' + sc.winners.length + ' winners)' : 'You win! Closest to the target') : 'Winner: ' + fmt(winnerGuess(sc), 1) + ' · you: ' + ordinal(sc.place) + ' of ' + sc.n;
        dr.label(c, msg, bx, by, sc.youWin ? C.gold : C.ink, { size: G.narrow ? 13.5 : 16, bold: true, align: 'center' });
      } else if (!sc) {
        dr.label(c, 'Drag the pink marker to choose your number,', w / 2, G.top + (G.axY - G.top) * 0.42, C.ink, { size: G.narrow ? 13 : 15, align: 'center' });
        dr.label(c, 'then press Play. The crowd guesses at the same time.', w / 2, G.top + (G.axY - G.top) * 0.42 + 22, C.muted, { size: G.narrow ? 12 : 14, align: 'center' });
      }
      // legend
      var lx = G.ax0, ly = h - 12, used = {}; S.levels.forEach(function (k) { used[k] = 1; });
      Object.keys(used).sort().forEach(function (k) { c.fillStyle = LVCOL[k]; c.beginPath(); c.arc(lx + 4, ly, 4, 0, 7); c.fill(); var tw = dr.label(c, G.narrow ? (k == 5 ? 'Eq' : 'L' + k) : LVNAME[k], lx + 11, ly, C.muted, { size: 10.5 }); lx += tw + 22; });
      // confetti
      S.parts.forEach(function (q) { c.globalAlpha = Math.max(0, q.life); c.fillStyle = q.col; c.fillRect(q.x - 2, q.y - 2, 4, 4); }); c.globalAlpha = 1;
    }
    function sideLabel(text, x, y, col, bold, leftSide, alpha, G) { // a label beside a vertical line, flipped if it would run off the axis
      c.save(); c.font = (bold ? '600 12px ' : '11.5px ') + GT.FONT; var tw = c.measureText(text).width; c.restore();
      if (leftSide && x - 6 - tw < G.ax0 - 20) leftSide = false; else if (!leftSide && x + 6 + tw > G.ax1 + 16) leftSide = true;
      dr.label(c, text, x + (leftSide ? -6 : 6), y, col, { size: bold ? 12 : 11.5, bold: bold, align: leftSide ? 'right' : 'left', alpha: alpha });
    }
    function winnerGuess(sc) { var k = sc.winners[0]; return k === sc.n - 1 ? S.lastGuess : S.guesses[k]; }
    L.loop(function (dt) {
      var busy = S.anim < 1 || S.parts.length;
      if (S.anim < 1) S.anim = Math.min(1, S.anim + dt / 1.5);
      S.parts.forEach(function (q) { q.vy += 260 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt * 0.9; });
      S.parts = S.parts.filter(function (q) { return q.life > 0; });
      if (busy || S.drag) render();
    }, cv);
    // ---------- input ----------
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) { var P = ptr(e), G = geo(); if (P.y > G.top - 10) { S.drag = true; setGuess(G.v(P.x)); try { cv.setPointerCapture(e.pointerId); } catch (er) { } render(); } });
    cv.addEventListener('pointermove', function (e) { if (!S.drag) return; setGuess(geo().v(ptr(e).x)); render(); });
    cv.addEventListener('pointerup', function () { if (S.drag) { S.drag = false; store.set('guess', S.guess); sync(); } });
    cv.addEventListener('keydown', function (e) {
      var st = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setGuess(Math.round(S.guess) - st); render(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setGuess(Math.round(S.guess) + st); render(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playRound(); }
      else if (e.key === 'r' || e.key === 'R') newGame();
    });
    el.guess.addEventListener('input', function () { setGuess(+el.guess.value); if (S.guess > S.zoom) { pickZoom(); layoutDots(); } render(); });
    el.play.addEventListener('click', playRound); if (el.play2) el.play2.addEventListener('click', playRound);
    el.crowd.addEventListener('click', function (e) { var b = e.target.closest('button[data-crowd]'); if (!b) return; S.crowd = b.dataset.crowd; newGame(); });
    el.pseg.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (!b) return; S.p = { '1/2': 0.5, '2/3': 2 / 3, '4/3': 4 / 3 }[b.dataset.p]; newGame(); });
    el.n.addEventListener('input', function () { S.n = +el.n.value; crowdLevels(); sync(); });
    el.n.addEventListener('change', function () { newGame(); });
    el.noise.addEventListener('input', function () { S.noise = +el.noise.value; sync(); });
    el.learn.addEventListener('change', function () { S.learn = el.learn.checked; newGame(); });
    el.ladder.addEventListener('change', function () { S.ladder = el.ladder.checked; render(); });
    el.reset.addEventListener('click', newGame); if (el.newg) el.newg.addEventListener('click', newGame);
    W.addEventListener('resize', function () { layoutDots(); render(); });
    L.onTheme(render);
    newGame();
    W.__gt1 = { S: S, play: playRound, setGuess: setGuess, sync: sync, newGame: newGame }; // for testing
  })();

  /* =====================================================================================
     2. BUILD A GAME AND PLAY IT
     ===================================================================================== */
  (function () {
    var box = $('gt1e'); if (!box) return;
    var el = { pre: $('gt1e-pre'), size: $('gt1e-size'), edit: $('gt1e-edit'), mx: $('gt1e-mx'), res: $('gt1e-res'), hist: $('gt1e-hist'),
      bots: $('gt1e-bots'), blurb: $('gt1e-blurb'), why: $('gt1e-why'), read: $('gt1e-read'), nf: $('gt1e-nf'), again: $('gt1e-again') };
    var S = { g: null, preset: 'pd', bot: 'greedy', edit: false, hist: [], you: 0, it: 0, rng: GT.rng(99), flash: null };
    function clone(g) { return { rows: g.rows.slice(), cols: g.cols.slice(), A: g.A.map(function (r) { return r.slice(); }), B: g.B.map(function (r) { return r.slice(); }), p1: 'You', p2: M.BOTS[S.bot].name }; }
    function load(k) { S.preset = k; S.g = clone(M.GAMES[k]); S.hist = []; S.you = S.it = 0; S.last = null; draw(); }
    function resize(n) {
      var g = S.g, names = [['Top', 'Middle', 'Bottom'], ['Left', 'Center', 'Right']];
      while (g.rows.length < n) { g.rows.push(names[0][g.rows.length]); g.A.forEach(function (r) { r.push(0); }); g.B.forEach(function (r) { r.push(0); }); g.cols.push(names[1][g.cols.length]); g.A.push(g.cols.map(function () { return 0; })); g.B.push(g.cols.map(function () { return 0; })); }
      while (g.rows.length > n) { g.rows.pop(); g.cols.pop(); g.A.pop(); g.B.pop(); g.A.forEach(function (r) { r.pop(); }); g.B.forEach(function (r) { r.pop(); }); }
      S.preset = 'custom'; S.hist = []; S.you = S.it = 0; S.last = null; draw();
    }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function draw() {
      var g = S.g; g.p2 = M.BOTS[S.bot].name;
      GT.seg(el.pre, 'data-g', S.preset); GT.seg(el.bots, 'data-bot', S.bot); GT.seg(el.size, 'data-n', g.rows.length);
      el.edit.setAttribute('aria-pressed', String(S.edit)); el.edit.textContent = S.edit ? '✓ Done editing' : '✎ Edit the game';
      if (S.edit) {
        var h = '<div class="gt1-ed"><table aria-label="Edit the payoffs. Your payoff first, the opponent’s second."><thead><tr><th></th>';
        g.cols.forEach(function (cn, j) { h += '<th><input type="text" class="gt1-n2" data-c="' + j + '" value="' + esc(cn) + '" maxlength="12" aria-label="Name of column ' + (j + 1) + '"></th>'; });
        h += '</tr></thead><tbody>';
        g.rows.forEach(function (rn, i) {
          h += '<tr><th><input type="text" class="gt1-n1" data-r="' + i + '" value="' + esc(rn) + '" maxlength="12" aria-label="Name of row ' + (i + 1) + '"></th>';
          g.cols.forEach(function (cn, j) { h += '<td><input type="number" class="gt1-a" data-i="' + i + '" data-j="' + j + '" value="' + g.A[i][j] + '" step="1" min="-99" max="99" aria-label="Your payoff at ' + esc(rn) + ', ' + esc(cn) + '"><input type="number" class="gt1-b" data-i="' + i + '" data-j="' + j + '" value="' + g.B[i][j] + '" step="1" min="-99" max="99" aria-label="Opponent payoff at ' + esc(rn) + ', ' + esc(cn) + '"></td>'; });
          h += '</tr>';
        });
        el.mx.innerHTML = h + '</tbody></table><p class="gt1-edhint">Gold: your payoff. Blue: the opponent’s. Names can be anything.</p></div>';
      } else {
        el.mx.innerHTML = GT.matrixHTML(g, { cls: 'gth-dark', hi: S.last ? [S.last.i, S.last.j] : null, label: 'The game. You choose a row, ' + g.p2 + ' chooses a column. Your payoff is first in each cell. Press a row button to play it.' });
        el.mx.querySelectorAll('tbody th').forEach(function (th, i) { th.innerHTML = '<button type="button" class="gt1-row" data-i="' + i + '" aria-label="Play ' + esc(g.rows[i]) + '">▶ ' + esc(g.rows[i]) + '</button>'; });
        if (S.flash) { var td = el.mx.querySelectorAll('tbody tr')[S.flash.i].querySelectorAll('td')[S.flash.j]; if (td) { td.classList.add('gt1-flash'); } }
      }
      // history, score, normal form
      el.hist.innerHTML = S.hist.slice(-12).map(function (e) { return '<span class="gt1-chip" title="' + esc(g.rows[e.i] + ' / ' + g.cols[e.j]) + '"><i>' + esc(g.rows[e.i]).slice(0, 1) + '·' + esc(g.cols[e.j]).slice(0, 1) + '</i><b class="gt1-y">' + GT.num(e.a) + '</b><b class="gt1-t">' + GT.num(e.b) + '</b></span>'; }).join('') || '<span class="gt1-none">Your rounds will show up here.</span>';
      var n = S.hist.length;
      el.read.innerHTML = '<dt>Rounds</dt><dd>' + n + '</dd><dt>Your total</dt><dd>' + GT.num(S.you) + (n ? ' (' + fmt(S.you / n, 2) + ' a round)' : '') + '</dd><dt>' + esc(g.p2) + '’s total</dt><dd>' + GT.num(S.it) + (n ? ' (' + fmt(S.it / n, 2) + ' a round)' : '') + '</dd>';
      el.blurb.textContent = M.BOTS[S.bot].blurb;
      el.nf.innerHTML = '<b>Players:</b> You (player 1) and ' + esc(g.p2) + ' (player 2).<br><b>Actions:</b> <i>A</i><sub>1</sub> = {' + g.rows.map(esc).join(', ') + '}, <i>A</i><sub>2</sub> = {' + g.cols.map(esc).join(', ') + '}.<br><b>Payoffs:</b> <i>u</i><sub>1</sub> and <i>u</i><sub>2</sub>, one number each for all ' + g.rows.length * g.cols.length + ' action profiles in the table. For example <i>u</i><sub>1</sub>(' + esc(g.rows[0]) + ', ' + esc(g.cols[g.cols.length - 1]) + ') = ' + GT.num(g.A[0][g.cols.length - 1]) + '.';
    }
    function play(i) {
      var g = S.g, mv = M.botMove(S.bot, g, S.hist, S.rng), j = mv.j, a = g.A[i][j], b = g.B[i][j];
      S.hist.push({ i: i, j: j, a: a, b: b }); S.you += a; S.it += b; S.last = { i: i, j: j };
      el.why.textContent = mv.why;
      el.res.innerHTML = 'You played <b class="gt1-y">' + esc(g.rows[i]) + '</b>, ' + esc(g.p2) + ' played <b class="gt1-t">' + esc(g.cols[j]) + '</b>: you get <b class="gt1-y">' + GT.num(a) + '</b>, it gets <b class="gt1-t">' + GT.num(b) + '</b>.';
      S.flash = { i: i, j: j }; draw(); setTimeout(function () { S.flash = null; var f = el.mx.querySelector('.gt1-flash'); if (f) f.classList.remove('gt1-flash'); }, 700);
    }
    el.mx.addEventListener('click', function (e) { var b = e.target.closest('button.gt1-row'); if (b) play(+b.dataset.i); });
    el.mx.addEventListener('change', function (e) {
      var t = e.target, g = S.g; if (!t.matches('input')) return;
      if (t.classList.contains('gt1-n1')) g.rows[+t.dataset.r] = t.value.trim() || 'Row ' + (+t.dataset.r + 1);
      else if (t.classList.contains('gt1-n2')) g.cols[+t.dataset.c] = t.value.trim() || 'Col ' + (+t.dataset.c + 1);
      else { var v = clamp(Math.round(+t.value || 0), -99, 99); t.value = v; (t.classList.contains('gt1-a') ? g.A : g.B)[+t.dataset.i][+t.dataset.j] = v; }
      S.preset = 'custom'; S.hist = []; S.you = S.it = 0; S.last = null; GT.seg(el.pre, 'data-g', 'custom');
    });
    el.edit.addEventListener('click', function () { S.edit = !S.edit; draw(); });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) { S.edit = false; load(b.dataset.g); el.res.textContent = 'New game: ' + M.GAMES[b.dataset.g].name + '. Pick a row to play.'; el.why.textContent = '—'; } });
    el.size.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (b) resize(+b.dataset.n); });
    el.bots.addEventListener('click', function (e) { var b = e.target.closest('button[data-bot]'); if (b) { S.bot = b.dataset.bot; S.hist = []; S.you = S.it = 0; S.last = null; el.why.textContent = '—'; el.res.textContent = 'New opponent: ' + M.BOTS[S.bot].name + '. Pick a row to play.'; draw(); } });
    el.again.addEventListener('click', function () { S.hist = []; S.you = S.it = 0; S.last = null; el.res.textContent = 'Scores cleared. Pick a row to play.'; el.why.textContent = '—'; draw(); });
    load('pd');
  })();
})(window, document);
