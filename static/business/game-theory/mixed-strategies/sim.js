/* Game Theory, Chapter 4: Mixed Strategies and Zero-Sum Games. Three interactives:
   1. (main, with missions) rock, paper, scissors against the Reader, a bot that learns your patterns and shows its
      model of you, or against a bot that plays the equilibrium mix;
   2. the indifference principle: slide the mixes p and q and watch the expected-payoff lines cross; any 2×2 game;
   3. penalty kicks as a zero-sum game: minimax, and taking kicks against a keeper.
   Models: model.js (window.GT4M), tested in node. Shared look and game math: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT4M, root = D.getElementById('gt4-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;
  var MS = L.missions($('gt4-missions'), 'gt4', [
    { id: 'p10', title: 'Meet the Reader', goal: 'Play 10 rounds of rock, paper, scissors against the Reader.' },
    { id: 'read', title: 'Get read', goal: 'Be predictable until the Reader is at least 80% sure of your next move.' },
    { id: 'lose5', title: 'Outguessed', goal: 'Lose 5 rounds in a row to the Reader.' },
    { id: 'beat', title: 'Beat the Reader', goal: 'Be ahead of the Reader after at least 30 rounds.' },
    { id: 'rand', title: 'Hide behind chance', goal: 'Press “Randomize for me” 20 times in a row against the Reader. Its forecasts stop working.' },
    { id: 'eq', title: 'Nothing to exploit', goal: 'Play 30 rounds against the Equilibrium bot, any way you like.' },
    { id: 'cross', title: 'Find the crossing', goal: 'In the indifference lab, move p to where Column’s two lines cross (within 0.02) in a game with a mixed equilibrium.' },
    { id: 'mm', title: 'The kicker’s minimax', goal: 'In the penalty lab, set the kicker’s mix within 2 points of the minimax mix.' }
  ]);

  /* glyphs for rock, paper and scissors, drawn as shapes so they look the same everywhere */
  function glyph(c, m, x, y, s, col) {
    c.save(); c.translate(x, y); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = s * 0.07; c.lineJoin = 'round'; c.lineCap = 'round';
    if (m === 0) { c.beginPath(); var pts = [[-.42, .05], [-.3, -.3], [.05, -.42], [.38, -.25], [.45, .1], [.25, .38], [-.1, .42], [-.38, .3]]; pts.forEach(function (p, k) { if (k) c.lineTo(p[0] * s, p[1] * s); else c.moveTo(p[0] * s, p[1] * s); }); c.closePath(); c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1; c.strokeStyle = 'rgba(6,17,26,.35)'; c.beginPath(); c.moveTo(-.15 * s, -.1 * s); c.lineTo(.1 * s, .05 * s); c.stroke(); }
    else if (m === 1) { c.globalAlpha = 0.92; dr.rrect(c, -.32 * s, -.42 * s, .64 * s, .84 * s, .05 * s); c.fill(); c.globalAlpha = 1; c.strokeStyle = 'rgba(6,17,26,.35)'; c.lineWidth = s * 0.03; for (var k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-.2 * s, (-.22 + k * .16) * s); c.lineTo(.2 * s, (-.22 + k * .16) * s); c.stroke(); } }
    else { c.lineWidth = s * 0.08; c.beginPath(); c.moveTo(-.05 * s, .1 * s); c.lineTo(.4 * s, -.4 * s); c.moveTo(.05 * s, .1 * s); c.lineTo(-.4 * s, -.4 * s); c.stroke(); c.lineWidth = s * 0.07; c.beginPath(); c.arc(-.18 * s, .3 * s, .14 * s, 0, 7); c.stroke(); c.beginPath(); c.arc(.18 * s, .3 * s, .14 * s, 0, 7); c.stroke(); }
    c.restore();
  }

  /* =====================================================================================
     1. ROCK, PAPER, SCISSORS
     ===================================================================================== */
  (function () {
    var view = $('gt4-view'), cv = $('gt4-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(Date.now() % 123457);
    var el = { bot: $('gt4-bot'), moves: $('gt4-moves'), rnd: $('gt4-rnd'), newg: $('gt4-new'), read: $('gt4-read'), reset: $('gt4-reset'), msg: $('gt4-msg') };
    var S = { bot: 'reader', rd: M.newReader(), h: [], score: 0, w: 0, d: 0, l: 0, hits: 0, streakL: 0, randRun: 0, t: 1, fc: null, trail: [], scoreHist: [0] };
    function reset() { S.rd = M.newReader(); S.h = []; S.score = 0; S.w = S.d = S.l = 0; S.hits = 0; S.streakL = 0; S.randRun = 0; S.trail = []; S.scoreHist = [0]; S.fc = S.bot === 'reader' ? M.forecast(S.rd, S.h) : null; el.msg.textContent = 'Pick a move. ' + (S.bot === 'reader' ? 'The Reader picks at the same time, using what it has learned about you.' : 'The Equilibrium bot plays each move one third of the time.'); sync(); }
    function play(you, viaRandom) {
      var it;
      if (S.bot === 'reader') { var f = M.forecast(S.rd, S.h); it = M.readerMove(S.rd, S.h, rng); if (f.p.indexOf(Math.max.apply(null, f.p)) === you) S.hits++; M.readerLearn(S.rd, S.h, you); }
      else it = Math.floor(rng() * 3);
      var res = M.result(you, it); S.score += res; if (res > 0) S.w++; else if (res < 0) S.l++; else S.d++;
      S.h.push({ you: you, it: it }); S.scoreHist.push(S.score); S.t = reduced ? 1 : 0;
      S.streakL = res < 0 ? S.streakL + 1 : 0; S.randRun = viaRandom ? S.randRun + 1 : 0;
      var n = S.h.length, cnt = [0, 0, 0]; S.h.forEach(function (e) { cnt[e.you]++; }); S.trail.push(cnt.map(function (x) { return x / n; })); if (S.trail.length > 80) S.trail.shift();
      S.fc = S.bot === 'reader' ? M.forecast(S.rd, S.h) : null;
      el.msg.textContent = 'You played ' + M.MOVES[you] + ', ' + (S.bot === 'reader' ? 'the Reader' : 'the bot') + ' played ' + M.MOVES[it] + ': ' + (res > 0 ? 'you win.' : res < 0 ? 'you lose.' : 'a draw.');
      // missions
      if (S.bot === 'reader') {
        if (n >= 10) done('p10', 'Ten rounds with the Reader.');
        if (S.fc && S.fc.conf >= 0.8) done('read', 'The Reader is ' + Math.round(S.fc.conf * 100) + '% sure what you’ll do next.');
        if (S.streakL >= 5) done('lose5', 'Five losses in a row: you were predictable.');
        if (n >= 30 && S.score > 0) done('beat', 'Ahead of the Reader after ' + n + ' rounds.');
        if (S.randRun >= 20) done('rand', 'Twenty random moves: nothing for it to learn.');
      } else if (n >= 30) done('eq', 'Thirty rounds: the equilibrium mix can’t be exploited, and can’t exploit you either.');
      sync();
    }
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }
    function sync() {
      GT.seg(el.bot, 'data-bot', S.bot);
      var n = S.h.length, cnt = [0, 0, 0]; S.h.forEach(function (e) { cnt[e.you]++; });
      el.read.innerHTML = '<dt>Rounds</dt><dd>' + n + '</dd><dt>Won · drawn · lost</dt><dd>' + S.w + ' · ' + S.d + ' · ' + S.l + '</dd><dt>Your score</dt><dd>' + (S.score > 0 ? '+' : '') + fmt(S.score, 0) + '</dd>' +
        (S.bot === 'reader' ? '<dt>Reader’s forecasts right</dt><dd>' + (n ? Math.round(100 * S.hits / n) + '%' : '—') + '</dd>' : '') +
        '<dt>Your mix R · P · S</dt><dd>' + (n ? cnt.map(function (x) { return Math.round(100 * x / n); }).join(' · ') + '%' : '—') + '</dd>';
      render();
    }
    function render() {
      var w = K.w, h = K.h, narrow = w < 560; dr.bg(c, w, h);
      var last = S.h[S.h.length - 1], e = S.t, ease = 1 - Math.pow(1 - e, 3);
      // arena
      var ax = 14, ay = 14, aw = narrow ? w - 28 : w * 0.56 - 20, ah = narrow ? h * 0.36 : h * 0.5 - 20;
      dr.panel(c, ax, ay, aw, ah, '');
      var gs = Math.min(aw * 0.22, ah * 0.5), cy = ay + ah * 0.48;
      dr.label(c, 'You', ax + aw * 0.25, ay + 18, C.pink, { size: 13, bold: true, align: 'center' });
      dr.label(c, S.bot === 'reader' ? 'The Reader' : 'Equilibrium bot', ax + aw * 0.75, ay + 18, C.blue, { size: 13, bold: true, align: 'center' });
      if (last) {
        var off = (1 - ease) * aw * 0.12;
        glyph(c, last.you, ax + aw * 0.25 + off, cy, gs, C.pink); glyph(c, last.it, ax + aw * 0.75 - off, cy, gs, C.blue);
        dr.label(c, M.MOVES[last.you], ax + aw * 0.25, cy + gs * 0.62, C.pink, { size: 12, align: 'center' });
        dr.label(c, M.MOVES[last.it], ax + aw * 0.75, cy + gs * 0.62, C.blue, { size: 12, align: 'center' });
        var res = M.result(last.you, last.it);
        dr.label(c, res > 0 ? 'You win' : res < 0 ? 'You lose' : 'Draw', ax + aw / 2, cy, res > 0 ? C.gold : res < 0 ? C.red : C.ink, { size: narrow ? 16 : 20, bold: true, align: 'center', alpha: ease });
      } else dr.label(c, 'Choose Rock, Paper or Scissors', ax + aw / 2, cy, C.muted, { size: 14, align: 'center' });
      dr.label(c, 'vs', ax + aw / 2, cy + gs * 0.62, C.muted, { size: 11, align: 'center' });
      // its model of you
      var mx0 = narrow ? 14 : w * 0.56, my0 = narrow ? ay + ah + 10 : 14, mw = narrow ? w - 28 : w * 0.44 - 14, mh = narrow ? 112 : h * 0.5 - 20;
      dr.panel(c, mx0, my0, mw, mh, S.bot === 'reader' ? 'Its model of you: your next move' : 'Its plan: no model, just a fair mix');
      var p = S.bot === 'reader' ? (S.fc ? S.fc.p : [1 / 3, 1 / 3, 1 / 3]) : [1 / 3, 1 / 3, 1 / 3];
      var bx = mx0 + 82, bw = mw - 130, rowH = Math.min(26, (mh - 56) / 3);
      [0, 1, 2].forEach(function (m) {
        var y = my0 + 34 + m * rowH;
        dr.label(c, M.MOVES[m], mx0 + 12, y, C.ink, { size: 12 });
        c.fillStyle = 'rgba(255,255,255,.06)'; dr.rrect(c, bx, y - 7, bw, 14, 5); c.fill();
        c.fillStyle = S.bot === 'reader' ? C.pink : C.blue; dr.rrect(c, bx, y - 7, Math.max(3, bw * p[m]), 14, 5); c.fill();
        dr.label(c, Math.round(p[m] * 100) + '%', bx + bw + 8, y, C.ink, { size: 11.5, bold: true });
      });
      if (S.bot === 'reader') {
        var th = S.fc ? M.THEORIES[S.fc.theory].name : '', top = p.indexOf(Math.max.apply(null, p)), ans = M.beats(top);
        dr.wrap(c, S.h.length ? 'Its best theory: **' + th + '**. Expecting ' + M.MOVES[top] + ', it will play ' + M.MOVES[ans] + '.' : 'It knows nothing about you yet.', mx0 + 12, my0 + 34 + 3 * rowH + 6, mw - 24, 16, C.muted, { size: 11.5, max: narrow ? 2 : 3, col2: C.gold });
      } else dr.wrap(c, 'Whatever you do, each of your moves wins, draws and loses one third of the time: your expected score is 0.', mx0 + 12, my0 + 34 + 3 * rowH + 6, mw - 24, 16, C.muted, { size: 11.5, max: 3 });
      // the triangle of your mix
      var ty0 = narrow ? my0 + mh + 10 : h * 0.5 + 6, tw = narrow ? (w - 38) * 0.5 : w * 0.38, th2 = h - ty0 - 14;
      dr.panel(c, 14, ty0, tw, th2, 'Your mix so far');
      var side = Math.min(tw - 40, (th2 - 46) / 0.866), tcx = 14 + tw / 2, tby = ty0 + 30 + side * 0.866 + 6;
      var V = [[tcx, tby - side * 0.866], [tcx - side / 2, tby], [tcx + side / 2, tby]]; // Rock top, Paper left, Scissors right
      c.strokeStyle = 'rgba(219,231,239,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(V[0][0], V[0][1]); c.lineTo(V[1][0], V[1][1]); c.lineTo(V[2][0], V[2][1]); c.closePath(); c.stroke();
      dr.label(c, 'R', V[0][0], V[0][1] - 9, C.muted, { size: 11, bold: true, align: 'center' }); dr.label(c, 'P', V[1][0] - 9, V[1][1], C.muted, { size: 11, bold: true, align: 'center' }); dr.label(c, 'S', V[2][0] + 9, V[2][1], C.muted, { size: 11, bold: true, align: 'center' });
      function pt(m) { return [m[0] * V[0][0] + m[1] * V[1][0] + m[2] * V[2][0], m[0] * V[0][1] + m[1] * V[1][1] + m[2] * V[2][1]]; }
      var ce = pt([1 / 3, 1 / 3, 1 / 3]); c.strokeStyle = C.green; c.lineWidth = 1.5; c.beginPath(); c.arc(ce[0], ce[1], 6, 0, 7); c.stroke();
      if (!narrow) dr.label(c, 'equilibrium', ce[0] + 9, ce[1] + 1, C.green, { size: 10 });
      if (S.trail.length) { c.strokeStyle = 'rgba(249,168,212,.45)'; c.lineWidth = 1.5; c.beginPath(); S.trail.forEach(function (m, k) { var q = pt(m); if (k) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke(); var q = pt(S.trail[S.trail.length - 1]); c.fillStyle = C.pink; c.beginPath(); c.arc(q[0], q[1], 5, 0, 7); c.fill(); }
      // the score over time
      var sx = 14 + tw + 10, sw = w - sx - 14;
      dr.panel(c, sx, ty0, sw, th2, 'Your score, round by round');
      var hs = S.scoreHist, n = hs.length, ym = Math.max(5, Math.max.apply(null, hs.map(Math.abs))), X = function (k) { return sx + 12 + (sw - 24) * (n <= 1 ? 0 : k / (n - 1)); }, Y = function (v) { return ty0 + 24 + (th2 - 36) * (0.5 - 0.5 * v / ym); };
      c.strokeStyle = 'rgba(219,231,239,.2)'; c.beginPath(); c.moveTo(sx + 10, Y(0)); c.lineTo(sx + sw - 10, Y(0)); c.stroke();
      dr.label(c, '0', sx + sw - 12, Y(0) - 7, C.muted, { size: 10, align: 'right' });
      if (n > 1) { c.strokeStyle = S.score >= 0 ? C.gold : C.red; c.lineWidth = 2; c.beginPath(); hs.forEach(function (v, k) { if (k) c.lineTo(X(k), Y(v)); else c.moveTo(X(k), Y(v)); }); c.stroke(); }
      dr.label(c, (S.score > 0 ? '+' : '') + S.score, sx + sw - 12, ty0 + 13, S.score >= 0 ? C.gold : C.red, { size: 12, bold: true, align: 'right' });
    }
    L.loop(function (dt) { if (S.t < 1) { S.t = Math.min(1, S.t + dt * 3); render(); } }, cv);
    el.moves.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) play(+b.dataset.m, false); });
    el.rnd.addEventListener('click', function () { play(Math.floor(Math.random() * 3), true); });
    el.bot.addEventListener('click', function (e) { var b = e.target.closest('button[data-bot]'); if (b) { S.bot = b.dataset.bot; reset(); } });
    el.newg.addEventListener('click', reset); el.reset.addEventListener('click', reset);
    cv.addEventListener('keydown', function (e) { var k = e.key.toLowerCase(); var m = { r: 0, '1': 0, p: 1, '2': 1, s: 2, '3': 2 }[k]; if (m !== undefined) { e.preventDefault(); play(m, false); } else if (k === 'x') play(Math.floor(Math.random() * 3), true); });
    W.addEventListener('resize', render); L.onTheme(render);
    reset();
    W.__gt4 = { S: S, play: play };
  })();

  /* =====================================================================================
     2. THE INDIFFERENCE PRINCIPLE
     ===================================================================================== */
  (function () {
    var view = $('gt4i-view'), cv = $('gt4i-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(4242);
    var el = { pre: $('gt4i-pre'), p: $('gt4i-p'), pO: $('gt4i-p-o'), q: $('gt4i-q'), qO: $('gt4i-q-o'), snap: $('gt4i-snap'), rnd: $('gt4i-rnd'), read: $('gt4i-read') };
    var S = { key: 'pennies', g: null, p: 0.8, q: 0.3, eq: null, drag: null };
    function load(k) { S.key = k; S.g = k === 'random' ? M.randomGame(rng) : M.GAMES[k]; S.g.p1 = 'Row'; S.g.p2 = 'Column'; S.eq = GT.mixed2x2(S.g); sync(); }
    function mixed() { return S.eq.filter(function (e) { return e.p > 1e-9 && e.p < 1 - 1e-9 && e.q > 1e-9 && e.q < 1 - 1e-9; })[0] || null; }
    function sync() {
      GT.seg(el.pre, 'data-g', S.key);
      el.p.value = S.p; el.pO.textContent = fmt(S.p, 2); el.q.value = S.q; el.qO.textContent = fmt(S.q, 2);
      var g = S.g, l2 = M.u2Lines(g, S.p), l1 = M.u1Lines(g, S.q), mx = mixed();
      var eqs = S.eq.map(function (e) { return '(' + (GT.frac(e.p) || fmt(e.p, 3)) + ', ' + (GT.frac(e.q) || fmt(e.q, 3)) + ')'; }).join(' ');
      el.read.innerHTML = '<dt>Column gets from ' + g.cols[0] + '</dt><dd>' + fmt(l2[0], 2) + '</dd><dt>… from ' + g.cols[1] + '</dt><dd>' + fmt(l2[1], 2) + '</dd><dt>Row gets from ' + g.rows[0] + '</dt><dd>' + fmt(l1[0], 2) + '</dd><dt>… from ' + g.rows[1] + '</dt><dd>' + fmt(l1[1], 2) + '</dd>' +
        '<dt>Mixed equilibrium</dt><dd>' + (mx ? '(' + (GT.frac(mx.p) || fmt(mx.p, 3)) + ', ' + (GT.frac(mx.q) || fmt(mx.q, 3)) + ')' : 'none') + '</dd><dt>All equilibria (<i>p</i>, <i>q</i>)</dt><dd class="gt4-wrapdd">' + (eqs || '—') + (S.eq.degenerate ? ' and a continuum' : '') + '</dd>';
      if (S.user && mx && Math.abs(S.p - mx.p) <= 0.02) { if (MS.done('cross')) L.toast(view, '✓ At p = ' + fmt(mx.p, 2) + ' Column is indifferent: any mix is a best response.'); }
      S.user = false;
      render();
    }
    var LY = {};
    function render() {
      var w = K.w, h = K.h, narrow = w < 640, g = S.g; dr.bg(c, w, h);
      var mx = mixed();
      // layout
      var pad = 12, colW = narrow ? w - 2 * pad : (w - 3 * pad) / 2;
      var r1 = { x: pad, y: pad, w: colW, h: narrow ? 170 : h * 0.44 };
      var r2 = narrow ? { x: pad, y: r1.y + r1.h + pad, w: colW, h: 230 } : { x: pad * 2 + colW, y: pad, w: colW, h: h * 0.44 };
      var r3 = narrow ? { x: pad, y: r2.y + r2.h + pad, w: colW, h: 190 } : { x: pad, y: r1.y + r1.h + pad, w: colW, h: h - r1.h - 3 * pad };
      var r4 = narrow ? { x: pad, y: r3.y + r3.h + pad, w: colW, h: 190 } : { x: pad * 2 + colW, y: r1.y + r1.h + pad, w: colW, h: h - r1.h - 3 * pad };
      // matrix
      dr.panel(c, r1.x, r1.y, r1.w, r1.h, '');
      var mb = { x: r1.x + 10, y: r1.y + 10, w: r1.w - 20, h: r1.h - 20 };
      GT.drawMatrix(c, mb, g, { headW: GT.headW(c, g, 54, mb.w * 0.32), ne: S.eq.filter(function (e) { return (e.p === 0 || e.p === 1) && (e.q === 0 || e.q === 1); }).map(function (e) { return [e.p === 1 ? 0 : 1, e.q === 1 ? 0 : 1]; }), size: narrow ? 17 : 19 });
      // the best-response square
      dr.panel(c, r2.x, r2.y, r2.w, r2.h, 'Best responses: Row (gold), Column (blue)');
      var sq = Math.min(r2.w - 70, r2.h - 56), sx = r2.x + (r2.w - sq) / 2 + 10, sy = r2.y + 28;
      LY.sq = { x: sx, y: sy, s: sq };
      c.strokeStyle = 'rgba(219,231,239,.3)'; c.lineWidth = 1; c.strokeRect(sx, sy, sq, sq);
      dr.label(c, 'p = P(' + g.rows[0] + ') →', sx + sq / 2, sy + sq + 13, C.p1, { size: 10.5, align: 'center' });
      c.save(); c.translate(sx - 14, sy + sq / 2); c.rotate(-Math.PI / 2); dr.label(c, 'q = P(' + g.cols[0] + ') →', 0, 0, C.p2, { size: 10.5, align: 'center' }); c.restore();
      var X = function (p) { return sx + p * sq; }, Y = function (q) { return sy + sq - q * sq; };
      // Row's BR: for each q, best p
      c.lineWidth = 3.5; c.lineCap = 'round';
      function brDraw(fn, col, isRow) { // a best-response correspondence: fn(t) > 0 means action 0 is best at t
        var f0 = fn(0), f1 = fn(1), E = 1e-9;
        c.strokeStyle = col; c.lineWidth = 3.5; c.lineCap = 'round';
        if (Math.abs(f0) < E && Math.abs(f1) < E) { c.globalAlpha = 0.35; c.fillStyle = col; c.fillRect(X(0), Y(1), sq, sq); c.globalAlpha = 0.9; return; }
        var cuts = [0]; if (f0 * f1 < 0) cuts.push(f0 / (f0 - f1)); cuts.push(1);
        c.beginPath();
        for (var k = 0; k + 1 < cuts.length; k++) {
          var a = cuts[k], b = cuts[k + 1], v = fn((a + b) / 2) > 0 ? 1 : 0;
          if (isRow) { c.moveTo(X(v), Y(a)); c.lineTo(X(v), Y(b)); } else { c.moveTo(X(a), Y(v)); c.lineTo(X(b), Y(v)); }
        }
        if (cuts.length === 3) { var t = cuts[1]; if (isRow) { c.moveTo(X(0), Y(t)); c.lineTo(X(1), Y(t)); } else { c.moveTo(X(t), Y(0)); c.lineTo(X(t), Y(1)); } }
        [0, 1].forEach(function (end) { if (Math.abs(fn(end)) < E && cuts.length === 2) { if (isRow) { c.moveTo(X(0), Y(end)); c.lineTo(X(1), Y(end)); } else { c.moveTo(X(end), Y(0)); c.lineTo(X(end), Y(1)); } } });
        c.stroke();
      }
      c.globalAlpha = 0.9; brDraw(function (q) { return GT.d1(g, q); }, C.p1, true); brDraw(function (p) { return GT.d2(g, p); }, C.p2, false); c.globalAlpha = 1;
      S.eq.forEach(function (e) { c.fillStyle = C.green; c.beginPath(); c.arc(X(e.p), Y(e.q), 6.5, 0, 7); c.fill(); c.strokeStyle = '#06111a'; c.lineWidth = 2; c.stroke(); });
      c.fillStyle = C.pink; c.beginPath(); c.arc(X(S.p), Y(S.q), 5, 0, 7); c.fill();
      // Column's lines vs p
      function lines(r, title, f, cur, star, col, names, axis) {
        dr.panel(c, r.x, r.y, r.w, r.h, title);
        var x0 = r.x + 36, x1 = r.x + r.w - 14, y0 = r.y + 28, y1 = r.y + r.h - 24;
        var vals = [f(0)[0], f(0)[1], f(1)[0], f(1)[1]], lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
        var pad2 = (hi - lo) * 0.12; lo -= pad2; hi += pad2;
        var Xl = function (t) { return x0 + (x1 - x0) * t; }, Yl = function (v) { return y1 - (y1 - y0) * (v - lo) / (hi - lo); };
        c.strokeStyle = 'rgba(219,231,239,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y1); c.lineTo(x1, y1); c.moveTo(x0, y0); c.lineTo(x0, y1); c.stroke();
        [0, 0.5, 1].forEach(function (t) { dr.label(c, String(t), Xl(t), y1 + 11, C.muted, { size: 10, align: 'center' }); });
        [lo + pad2, hi - pad2].forEach(function (v) { dr.label(c, fmt(v, 1), x0 - 5, Yl(v), C.muted, { size: 10, align: 'right' }); });
        [0, 1].forEach(function (k) {
          c.save(); c.strokeStyle = col; c.lineWidth = 2.5; if (k) c.setLineDash([7, 5]); c.beginPath(); c.moveTo(Xl(0), Yl(f(0)[k])); c.lineTo(Xl(1), Yl(f(1)[k])); c.stroke(); c.restore();
          dr.label(c, names[k], Xl(k ? 0.02 : 0.98), Yl(f(k ? 0.02 : 0.98)[k]) - 10, col, { size: 11, bold: true, align: k ? 'left' : 'right' });
        });
        if (star !== null) { c.save(); c.strokeStyle = C.green; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(Xl(star), y0); c.lineTo(Xl(star), y1); c.stroke(); c.restore(); dr.label(c, GT.frac(star) || fmt(star, 2), Xl(star), y0 - 2 + 0, C.green, { size: 11, bold: true, align: 'center' }); }
        c.save(); c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.moveTo(Xl(cur), y0 + 8); c.lineTo(Xl(cur), y1); c.stroke(); c.restore();
        var fv = f(cur); [0, 1].forEach(function (k) { c.fillStyle = col; c.beginPath(); c.arc(Xl(cur), Yl(fv[k]), 4.5, 0, 7); c.fill(); });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
      }
      LY.l3 = lines(r3, 'Column’s expected payoff as Row mixes', function (p) { return M.u2Lines(g, p); }, S.p, mx ? mx.p : null, C.p2, [g.cols[0], g.cols[1]], 'p');
      LY.l4 = lines(r4, 'Row’s expected payoff as Column mixes', function (q) { return M.u1Lines(g, q); }, S.q, mx ? mx.q : null, C.p1, [g.rows[0], g.rows[1]], 'q');
    }
    // dragging on the charts and the square
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function hitDrag(P) {
      var q = LY.sq; if (q && P.x >= q.x - 8 && P.x <= q.x + q.s + 8 && P.y >= q.y - 8 && P.y <= q.y + q.s + 8) return 'sq';
      if (LY.l3 && P.x >= LY.l3.x0 - 6 && P.x <= LY.l3.x1 + 6 && P.y >= LY.l3.y0 - 10 && P.y <= LY.l3.y1 + 10) return 'p';
      if (LY.l4 && P.x >= LY.l4.x0 - 6 && P.x <= LY.l4.x1 + 6 && P.y >= LY.l4.y0 - 10 && P.y <= LY.l4.y1 + 10) return 'q';
      return null;
    }
    function apply(P) {
      if (S.drag === 'sq') { S.p = clamp((P.x - LY.sq.x) / LY.sq.s, 0, 1); S.q = clamp(1 - (P.y - LY.sq.y) / LY.sq.s, 0, 1); }
      else if (S.drag === 'p') S.p = clamp((P.x - LY.l3.x0) / (LY.l3.x1 - LY.l3.x0), 0, 1);
      else if (S.drag === 'q') S.q = clamp((P.x - LY.l4.x0) / (LY.l4.x1 - LY.l4.x0), 0, 1);
      S.p = Math.round(S.p * 100) / 100; S.q = Math.round(S.q * 100) / 100; S.user = true; sync();
    }
    cv.addEventListener('pointerdown', function (e) { var P = ptr(e); S.drag = hitDrag(P); if (S.drag) { apply(P); try { cv.setPointerCapture(e.pointerId); } catch (er) { } } });
    cv.addEventListener('pointermove', function (e) { if (S.drag) apply(ptr(e)); });
    cv.addEventListener('pointerup', function () { S.drag = null; });
    el.p.addEventListener('input', function () { S.p = +el.p.value; S.user = true; sync(); });
    el.q.addEventListener('input', function () { S.q = +el.q.value; sync(); });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) load(b.dataset.g); });
    el.snap.addEventListener('click', function () { var mx = mixed(); if (mx) { S.p = Math.round(mx.p * 1000) / 1000; S.q = Math.round(mx.q * 1000) / 1000; sync(); } else L.toast(view, 'This game has no fully mixed equilibrium.'); });
    el.rnd.addEventListener('click', function () { load('random'); });
    W.addEventListener('resize', render); L.onTheme(render);
    load('pennies');
    W.__gt4i = { S: S, sync: sync, load: load };
  })();

  /* =====================================================================================
     3. PENALTY KICKS
     ===================================================================================== */
  (function () {
    var view = $('gt4k-view'), cv = $('gt4k-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(Date.now() % 31337 + 5);
    var el = { p: $('gt4k-p'), pO: $('gt4k-p-o'), keeper: $('gt4k-keeper'), n: $('gt4k-n'), o: $('gt4k-o'), mix: $('gt4k-mix'), ten: $('gt4k-ten'), read: $('gt4k-read') };
    var MM = M.pkMinimax(), G = M.pkKeeper();
    var S = { p: 0.5, keeper: 'minimax', kicks: [], goals: 0, anim: null, queue: 0 };
    function keeperDive() {
      if (S.keeper === 'minimax') return rng() < G ? 0 : 1;
      // the exploiting keeper dives where you kick more often (after a few kicks), using your observed frequency
      var n = S.kicks.length; if (n < 3) return rng() < 0.5 ? 0 : 1;
      var fN = S.kicks.filter(function (k) { return k.side === 0; }).length / n;
      var vN = fN * M.PK.A[0][0] + (1 - fN) * M.PK.A[1][0], vO = fN * M.PK.A[0][1] + (1 - fN) * M.PK.A[1][1];
      return vN < vO - 1e-9 ? 0 : vO < vN - 1e-9 ? 1 : (rng() < 0.5 ? 0 : 1);
    }
    function kick(side) {
      var dive = keeperDive(), goal = rng() < M.PK.A[side][dive];
      S.kicks.push({ side: side, dive: dive, goal: goal }); if (goal) S.goals++;
      S.anim = { side: side, dive: dive, goal: goal, t: reduced ? 1 : 0 };
      sync();
    }
    function sync() {
      el.p.value = S.p; el.pO.textContent = Math.round(S.p * 100) + '% natural';
      GT.seg(el.keeper, 'data-k', S.keeper);
      var n = S.kicks.length, vN = M.pkScore(S.p, 1), vO = M.pkScore(S.p, 0);
      el.read.innerHTML = '<dt>Goals</dt><dd>' + S.goals + ' of ' + n + (n ? ' (' + Math.round(100 * S.goals / n) + '%)' : '') + '</dd><dt>If the keeper dives natural</dt><dd>' + Math.round(vN * 100) + '%</dd><dt>If the keeper dives other</dt><dd>' + Math.round(vO * 100) + '%</dd><dt>Your guaranteed rate</dt><dd>' + Math.round(Math.min(vN, vO) * 100) + '%</dd><dt>Minimax mix and value</dt><dd>' + Math.round(MM.p * 100) + '% · ' + Math.round(MM.v * 1000) / 10 + '%</dd>';
      if (Math.abs(S.p - MM.p) <= 0.02 && MS.done('mm')) L.toast(view, '✓ At the minimax mix the keeper can’t do better than ' + Math.round(MM.v * 100) + '%.');
      render();
    }
    function render() {
      var w = K.w, h = K.h, narrow = w < 640; dr.bg(c, w, h);
      var gw = narrow ? w - 24 : w * 0.5 - 18, gx = 12, gy = 12, gh = narrow ? h * 0.48 : h - 24;
      dr.panel(c, gx, gy, gw, gh, '');
      // the goal, seen from behind the kicker
      var goalW = gw * 0.86, goalH = goalW * 0.33, ox = gx + (gw - goalW) / 2, oy = gy + gh * 0.2;
      c.fillStyle = 'rgba(99,230,190,.07)'; c.fillRect(ox, oy, goalW, goalH);
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; for (var k = 1; k < 12; k++) { c.beginPath(); c.moveTo(ox + goalW * k / 12, oy); c.lineTo(ox + goalW * k / 12, oy + goalH); c.stroke(); } for (k = 1; k < 4; k++) { c.beginPath(); c.moveTo(ox, oy + goalH * k / 4); c.lineTo(ox + goalW, oy + goalH * k / 4); c.stroke(); }
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(ox, oy + goalH); c.lineTo(ox, oy); c.lineTo(ox + goalW, oy); c.lineTo(ox + goalW, oy + goalH); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx + 8, oy + goalH); c.lineTo(gx + gw - 8, oy + goalH); c.stroke();
      dr.label(c, 'natural side', ox + goalW * 0.22, oy - 10, C.gold, { size: 11, align: 'center' }); dr.label(c, 'other side', ox + goalW * 0.78, oy - 10, C.gold, { size: 11, align: 'center' });
      // keeper and ball
      var A = S.anim, t = A ? A.t : 0, e = 1 - Math.pow(1 - Math.min(1, t * 1.2), 3);
      var kx = ox + goalW / 2, ky = oy + goalH * 0.62, diveX = A ? (A.dive === 0 ? -1 : 1) * goalW * 0.28 * e : 0, tilt = A ? (A.dive === 0 ? -1 : 1) * 1.1 * e : 0;
      c.save(); c.translate(kx + diveX, ky + (A ? -goalH * 0.12 * Math.sin(e * Math.PI) : 0)); c.rotate(tilt);
      c.fillStyle = C.blue; dr.rrect(c, -9, -goalH * 0.32, 18, goalH * 0.5, 7); c.fill(); c.beginPath(); c.arc(0, -goalH * 0.42, 8, 0, 7); c.fill();
      c.strokeStyle = C.blue; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, -goalH * 0.26); c.lineTo(-24, -goalH * 0.46); c.moveTo(8, -goalH * 0.26); c.lineTo(24, -goalH * 0.46); c.moveTo(-5, goalH * 0.16); c.lineTo(-10, goalH * 0.34); c.moveTo(5, goalH * 0.16); c.lineTo(10, goalH * 0.34); c.stroke(); c.restore();
      var bx0 = kx, by0 = gy + gh * 0.86, tx = ox + goalW * (A && A.side === 0 ? 0.16 : 0.84), ty = oy + goalH * 0.45;
      if (A && !A.goal && A.side === A.dive) { tx = kx + diveX * 0.9; ty = ky - goalH * 0.25; }
      else if (A && A.goal && A.side === A.dive) { tx = ox + goalW * (A.side === 0 ? 0.05 : 0.95); ty = oy + goalH * 0.16; } // past the diving keeper, into the top corner
      var bt = A ? Math.min(1, t * 1.5) : 0, bx = bx0 + (tx - bx0) * bt, by = by0 + (ty - by0) * bt - Math.sin(bt * Math.PI) * 20, br = 9 - 3 * bt;
      if (A && !A.goal && A.side !== A.dive && bt >= 1) { bx = tx + (A.side === 0 ? -1 : 1) * goalW * 0.12; } // a miss goes wide
      // the penalty spot and the kicker
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(bx0, by0 + 10, 7, 2.5, 0, 0, 7); c.fill();
      var kk = A ? Math.min(1, t * 3) : 0, kpx = bx0 - 34 + 22 * kk, kpy = by0 - 4;
      c.save(); c.strokeStyle = C.pink; c.fillStyle = C.pink; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.arc(kpx, kpy - 46, 7, 0, 7); c.fill(); c.beginPath(); c.moveTo(kpx, kpy - 38); c.lineTo(kpx + 2, kpy - 16); c.moveTo(kpx + 2, kpy - 16); c.lineTo(kpx - 8, kpy + 4); c.moveTo(kpx + 2, kpy - 16); c.lineTo(kpx + 12 + 8 * kk, kpy + 2 - 6 * kk); c.moveTo(kpx, kpy - 32); c.lineTo(kpx - 13, kpy - 20); c.moveTo(kpx, kpy - 32); c.lineTo(kpx + 13, kpy - 24); c.stroke(); c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.strokeStyle = '#06111a'; c.lineWidth = 1.5; c.stroke();
      if (A && t >= 0.9) dr.label(c, A.goal ? 'GOAL!' : (A.side === A.dive ? 'Saved' : 'Wide!'), gx + gw / 2, gy + gh * 0.08, A.goal ? C.gold : C.red, { size: 20, bold: true, align: 'center' });
      dr.label(c, 'Kicks ' + S.kicks.length + ' · goals ' + S.goals, gx + 12, gy + gh - 14, C.muted, { size: 11.5 });
      var hist = S.kicks.slice(-14); hist.forEach(function (k2, i) { c.fillStyle = k2.goal ? C.gold : 'rgba(255,135,135,.8)'; c.beginPath(); c.arc(gx + gw - 14 - i * 12, gy + gh - 14, 4, 0, 7); c.fill(); });
      // minimax chart
      var cx0 = narrow ? 12 : w * 0.5 + 6, cy0 = narrow ? gy + gh + 12 : 12, cw = narrow ? w - 24 : w * 0.5 - 18, ch = narrow ? h - gh - 36 : h - 24;
      dr.panel(c, cx0, cy0, cw, ch, 'Chance of a goal as you mix');
      var x0 = cx0 + 40, x1 = cx0 + cw - 16, y0 = cy0 + 30, y1 = cy0 + ch - 28, lo = 0.5, hi = 1;
      var X = function (p) { return x0 + (x1 - x0) * p; }, Y = function (v) { return y1 - (y1 - y0) * (v - lo) / (hi - lo); };
      c.strokeStyle = 'rgba(219,231,239,.25)'; c.lineWidth = 1; [0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) { c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke(); dr.label(c, Math.round(v * 100) + '%', x0 - 5, Y(v), C.muted, { size: 10, align: 'right' }); });
      dr.label(c, 'share of kicks to your natural side →', (x0 + x1) / 2, y1 + 14, C.muted, { size: 10.5, align: 'center' });
      var lN = function (p) { return M.pkScore(p, 1); }, lO = function (p) { return M.pkScore(p, 0); };
      // lower envelope
      c.save(); c.strokeStyle = 'rgba(99,230,190,.35)'; c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath(); for (var i = 0; i <= 100; i++) { var pp = i / 100, v = Math.min(lN(pp), lO(pp)); if (i) c.lineTo(X(pp), Y(v)); else c.moveTo(X(pp), Y(v)); } c.stroke(); c.restore();
      [[lN, 'keeper dives natural', []], [lO, 'keeper dives other', [7, 5]]].forEach(function (L2) { c.save(); c.strokeStyle = C.blue; c.lineWidth = 2.4; c.setLineDash(L2[2]); c.beginPath(); c.moveTo(X(0), Y(L2[0](0))); c.lineTo(X(1), Y(L2[0](1))); c.stroke(); c.restore(); });
      dr.label(c, 'keeper dives natural', X(0.02), Y(lN(0.02)) - 10, C.blue, { size: 10.5, bold: true });
      dr.label(c, 'keeper dives other', X(0.98), Y(lO(0.98)) - 10, C.blue, { size: 10.5, bold: true, align: 'right' });
      c.save(); c.strokeStyle = C.green; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(MM.p), y0); c.lineTo(X(MM.p), y1); c.stroke(); c.restore();
      dr.label(c, 'minimax ' + Math.round(MM.p * 100) + '% → ' + Math.round(MM.v * 100) + '% goals', X(MM.p), y0 - 4, C.green, { size: 11, bold: true, align: MM.p > 0.6 ? 'right' : 'center' });
      c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.moveTo(X(S.p), y0 + 10); c.lineTo(X(S.p), y1); c.stroke();
      c.fillStyle = C.pink; c.beginPath(); c.arc(X(S.p), Y(Math.min(lN(S.p), lO(S.p))), 6, 0, 7); c.fill();
      S.chart = { x0: x0, x1: x1, y0: y0, y1: y1 };
    }
    L.loop(function (dt) { if (S.anim && S.anim.t < 1.4) { S.anim.t += dt * 1.4; render(); } else if (S.queue > 0 && (!S.anim || S.anim.t >= 1.4)) { S.queue--; kick(rng() < S.p ? 0 : 1); } }, cv);
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, ch = S.chart; if (ch && x >= ch.x0 - 6 && x <= ch.x1 + 6 && y >= ch.y0 && y <= ch.y1 + 10) { S.p = Math.round(clamp((x - ch.x0) / (ch.x1 - ch.x0), 0, 1) * 100) / 100; sync(); } });
    el.p.addEventListener('input', function () { S.p = +el.p.value; sync(); });
    el.keeper.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) { S.keeper = b.dataset.k; S.kicks = []; S.goals = 0; S.anim = null; sync(); } });
    el.n.addEventListener('click', function () { kick(0); }); el.o.addEventListener('click', function () { kick(1); });
    el.mix.addEventListener('click', function () { kick(rng() < S.p ? 0 : 1); });
    el.ten.addEventListener('click', function () { S.queue = 10; if (reduced) { while (S.queue > 0) { S.queue--; kick(rng() < S.p ? 0 : 1); } } });
    W.addEventListener('resize', render); L.onTheme(render);
    sync();
    W.__gt4k = { S: S, sync: sync, kick: kick };
  })();
})(window, document);
