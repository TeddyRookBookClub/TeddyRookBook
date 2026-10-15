/* Game Theory, Chapter 3: Nash Equilibrium. Two interactives:
   1. (main, with missions) find pure-strategy Nash equilibria: underline best responses, or spot equilibria directly,
      with arrows that show each player's profitable deviations;
   2. focal points: coordination puzzles against simulated partners.
   Models: model.js (window.GT3M), tested in node. Shared look and game math: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT3M, root = D.getElementById('gt3-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;

  /* =====================================================================================
     1. FIND THE EQUILIBRIA
     ===================================================================================== */
  (function () {
    var view = $('gt3-view'), cv = $('gt3-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(Date.now() % 999331);
    var el = { pre: $('gt3-pre'), size: $('gt3-size'), mode: $('gt3-mode'), arrows: $('gt3-arrows'), newg: $('gt3-new'), check: $('gt3-check'), none: $('gt3-none'), show: $('gt3-show'),
      read: $('gt3-read'), story: $('gt3-story'), msg: $('gt3-msg'), reset: $('gt3-reset'), spotBox: $('gt3-spotbox') };
    var S = { key: 'bos', n: 3, mode: 'mark', arrows: false, g: null, u1: {}, u2: {}, need: null, picks: {}, mistakes: 0, done: false, shown: false, flash: null, t: 0, parts: [], cur: [0, 0], streak: 0, msg: '' };
    var MS = L.missions($('gt3-missions'), 'gt3', [
      { id: 'b1', title: 'Row’s best responses', goal: 'In any game, underline all of the row player’s best responses: in each column, click the left half of the cell with Row’s highest payoff.' },
      { id: 'bos', title: 'Two ways to meet', goal: 'Underline every best response in Bach or Stravinsky and find both equilibria.' },
      { id: 'chicken', title: 'Who swerves?', goal: 'Find both equilibria of Chicken. Each has one driver giving in.' },
      { id: 'stag', title: 'Trust or safety', goal: 'Find both equilibria of the stag hunt, then read which one is safer.' },
      { id: 'none', title: 'No resting place', goal: 'Show that matching pennies has no pure-strategy equilibrium: underline everything and find no cell with two marks.' },
      { id: 'r3', title: 'Clean 3×3', goal: 'Mark every best response in a random 3×3 with no wrong clicks.' },
      { id: 'spot4', title: 'Eagle eye', goal: 'In Spot mode with the arrows off, find all equilibria of a random 4×4 on the first check.' }
    ]);
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }
    function load(key) {
      S.key = key || S.key;
      if (S.key === 'rand') { S.g = M.genRandom(S.n, rng, rng() < 0.85 ? 'some' : 'none'); S.g.p1 = 'Row'; S.g.p2 = 'Column'; }
      else { var G0 = M.GAMES[S.key]; S.g = { rows: G0.rows.slice(), cols: G0.cols.slice(), A: G0.A, B: G0.B, p1: 'Player 1', p2: 'Player 2' }; }
      S.u1 = {}; S.u2 = {}; S.picks = {}; S.mistakes = 0; S.done = false; S.shown = false; S.flash = null; S.firstCheck = true;
      S.need = M.marks(S.g); S.ne = GT.pureNE(S.g); S.cur = [0, 0];
      S.msg = S.mode === 'mark' ? 'Click the left half of a cell to underline Row’s payoff if it is the best in its column, the right half to underline Column’s payoff if it is the best in its row.' : 'Click every cell you think is a Nash equilibrium, then press Check. If there is none, press “No equilibrium”.';
      sync();
    }
    function nm(i, j) { return '(' + S.g.rows[i] + ', ' + S.g.cols[j] + ')'; }
    function markCount() { return { have: Object.keys(S.u1).length + Object.keys(S.u2).length, need: S.need.u1.length + S.need.u2.length }; }
    function mark(i, j, half) {
      if (S.mode !== 'mark' || S.done) return;
      var g = S.g, key = i + ',' + j;
      if (half === 1) {
        if (S.u1[key]) return;
        if (S.need.u1.indexOf(key) >= 0) { S.u1[key] = 1; S.msg = 'Yes: against ' + g.cols[j] + ', Row’s best is ' + g.rows[i] + ' (' + GT.num(g.A[i][j]) + ').'; }
        else { var b = GT.br1(g, j)[0]; S.mistakes++; S.flash = { i: i, j: j, t: 1, half: 1 }; S.msg = 'Not a best response: against ' + g.cols[j] + ', Row gets ' + GT.num(g.A[b][j]) + ' from ' + g.rows[b] + ', more than ' + GT.num(g.A[i][j]) + '.'; }
      } else {
        if (S.u2[key]) return;
        if (S.need.u2.indexOf(key) >= 0) { S.u2[key] = 1; S.msg = 'Yes: against ' + g.rows[i] + ', Column’s best is ' + g.cols[j] + ' (' + GT.num(g.B[i][j]) + ').'; }
        else { var b2 = GT.br2(g, i)[0]; S.mistakes++; S.flash = { i: i, j: j, t: 1, half: 2 }; S.msg = 'Not a best response: against ' + g.rows[i] + ', Column gets ' + GT.num(g.B[i][b2]) + ' from ' + g.cols[b2] + ', more than ' + GT.num(g.B[i][j]) + '.'; }
      }
      // complete for player 1?
      if (S.need.u1.every(function (k) { return S.u1[k]; })) done('b1', 'B₁ complete: Row’s best response to every column.');
      var mc = markCount();
      if (mc.have === mc.need) complete();
      sync();
    }
    function selectionText() {
      var s = M.selection(S.g); if (!s) return '';
      var t = '';
      if (s.pareto !== null) t += ' ' + nm(s.eq[s.pareto].cell[0], s.eq[s.pareto].cell[1]) + ' is better for both (Pareto-dominant).';
      if (s.risk !== null) t += ' ' + nm(s.eq[s.risk].cell[0], s.eq[s.risk].cell[1]) + ' is risk-dominant: the losses from a partner’s mistake are smaller (' + s.eq[s.risk].loss + ' vs ' + s.eq[1 - s.risk].loss + ').';
      return t;
    }
    function complete() {
      S.done = true; var ne = S.ne;
      if (ne.length) S.msg = 'Complete. Cells with both payoffs underlined are the Nash equilibria: ' + ne.map(function (e) { return nm(e[0], e[1]); }).join(' and ') + '.' + selectionText();
      else S.msg = 'Complete, and no cell has both payoffs underlined: this game has no pure-strategy Nash equilibrium. Someone always wants to switch (Chapter 4 fixes this with randomizing).';
      if (S.key === 'bos') done('bos', 'Both equilibria of Bach or Stravinsky.');
      if (S.key === 'chicken') done('chicken', 'One swerves, one doesn’t: two equilibria.');
      if (S.key === 'stag') done('stag', 'Stag is better, Hare is safer.');
      if (S.key === 'pennies') done('none', 'No cell has two marks: no pure equilibrium.');
      if (S.key === 'rand' && S.n === 3 && S.mistakes === 0) done('r3', 'Every best response, no mistakes.');
      burst();
    }
    // spot mode
    function pick(i, j) { if (S.mode !== 'spot' || S.done) return; var k = i + ',' + j; if (S.picks[k]) delete S.picks[k]; else S.picks[k] = 1; S.msg = Object.keys(S.picks).length + ' cell(s) picked. Press Check when you have them all.'; sync(); }
    function check(claimNone) {
      if (S.mode !== 'spot' || S.done) return;
      var ne = S.ne.map(function (e) { return e[0] + ',' + e[1]; }), picks = claimNone ? [] : Object.keys(S.picks);
      var right = ne.length === picks.length && ne.every(function (k) { return picks.indexOf(k) >= 0; });
      if (right) {
        S.done = true; S.msg = (ne.length ? 'Right: ' + S.ne.map(function (e) { return nm(e[0], e[1]); }).join(' and ') + (ne.length > 1 ? ' are' : ' is') + ' all the equilibria.' : 'Right: there is no pure-strategy equilibrium.') + selectionText();
        if (S.key === 'rand' && S.n === 4 && !S.arrows && S.firstCheck) done('spot4', 'All equilibria of a 4×4 on the first try.');
        if (S.key === 'bos' && ne.length) done('bos', 'Both equilibria of Bach or Stravinsky.');
        if (S.key === 'chicken') done('chicken', 'One swerves, one doesn’t: two equilibria.');
        if (S.key === 'stag') done('stag', 'Stag is better, Hare is safer.');
        if (S.key === 'pennies') done('none', 'No pure equilibrium.');
        burst();
      } else {
        S.mistakes++; S.firstCheck = false;
        var wrong = picks.filter(function (k) { return ne.indexOf(k) < 0; }), missing = ne.filter(function (k) { return picks.indexOf(k) < 0; });
        if (wrong.length) { var w = wrong[0].split(',').map(Number), d = M.deviation(S.g, w[0], w[1]); S.msg = nm(w[0], w[1]) + ' is not an equilibrium: ' + (d.row >= 0 ? 'Row would switch to ' + S.g.rows[d.row] + ' (+' + GT.num(d.gain1) + ')' : 'Column would switch to ' + S.g.cols[d.col] + ' (+' + GT.num(d.gain2) + ')') + '.'; S.flash = { i: w[0], j: w[1], t: 1 }; }
        else S.msg = 'Not all of them: ' + missing.length + ' more equilibrium' + (missing.length > 1 ? 'a' : '') + ' to find.' + (claimNone ? ' There is at least one.' : '');
      }
      sync();
    }
    function showAll() { S.shown = true; S.need.u1.forEach(function (k) { S.u1[k] = 1; }); S.need.u2.forEach(function (k) { S.u2[k] = 1; }); S.done = true; S.msg = (S.ne.length ? 'Equilibria: ' + S.ne.map(function (e) { return nm(e[0], e[1]); }).join(', ') + '.' : 'No pure-strategy equilibrium.') + selectionText(); sync(); }
    function sync() {
      GT.seg(el.pre, 'data-g', S.key); GT.seg(el.size, 'data-n', S.n); GT.seg(el.mode, 'data-m', S.mode); el.arrows.checked = S.arrows;
      el.size.hidden = S.key !== 'rand'; el.spotBox.hidden = S.mode !== 'spot';
      el.story.textContent = S.key === 'rand' ? 'A random ' + S.n + '×' + S.n + ' game with payoffs from 0 to 9. It may have several equilibria, one, or none.' : M.GAMES[S.key].story;
      var mc = markCount();
      el.read.innerHTML = (S.mode === 'mark' ? '<dt>Best responses marked</dt><dd>' + mc.have + ' of ' + mc.need + '</dd>' : '<dt>Cells picked</dt><dd>' + Object.keys(S.picks).length + '</dd>') + '<dt>Wrong clicks</dt><dd>' + S.mistakes + '</dd><dt>Equilibria</dt><dd>' + (S.done ? (S.ne.length ? S.ne.map(function (e) { return nm(e[0], e[1]); }).join(' ') : 'none') : '?') + '</dd>';
      el.msg.textContent = S.msg; render();
    }
    // ---------- drawing ----------
    function render() {
      var w = K.w, h = K.h, narrow = w < 560; dr.bg(c, w, h);
      var g = S.g, n = g.rows.length, title = S.key === 'rand' ? 'Random ' + n + '×' + n : M.GAMES[S.key].name;
      dr.label(c, title + (narrow ? '' : S.mode === 'mark' ? ' · underline the best responses' : ' · spot the equilibria'), 14, 22, C.ink, { size: narrow ? 13 : 15, bold: true });
      var mc = markCount();
      dr.label(c, S.mode === 'mark' ? 'Marked ' + mc.have + ' of ' + mc.need + (S.mistakes ? ' · wrong clicks ' + S.mistakes : '') : (S.mistakes ? 'Wrong checks ' + S.mistakes : 'Click cells, then Check'), 14, 42, C.muted, { size: 12 });
      var top = 58, bot = narrow ? 104 : 92, availW = w - 24, availH = h - top - bot;
      var headW = GT.headW(c, g, 54, Math.min(130, availW * 0.3)), headH = 36, names = 22, cw = Math.min(150, (availW - headW) / n), ch = Math.min(96, (availH - headH - names) / n);
      var box = { x: (w - (headW + cw * n)) / 2, y: top + (availH - (names + headH + ch * n)) / 2, w: headW + cw * n, h: names + headH + ch * n };
      var showNE = S.done ? S.ne : [];
      var fill = function (i, j) { if (S.mode === 'spot' && S.picks[i + ',' + j]) return 'rgba(249,168,212,.16)'; return null; };
      var G = GT.drawMatrix(c, box, g, { headW: headW, headH: headH, u1: function (i, j) { return !!S.u1[i + ',' + j]; }, u2: function (i, j) { return !!S.u2[i + ',' + j]; }, ne: showNE, cellFill: fill, sel: S.kbd ? S.cur : null,
        flash: S.flash && S.flash.t > 0 ? { i: S.flash.i, j: S.flash.j, t: S.flash.t * 0.5, col: C.red } : null, size: n === 4 && narrow ? 15 : undefined });
      S.G = G;
      // picks in spot mode: a pink ring
      if (S.mode === 'spot') Object.keys(S.picks).forEach(function (k) { var ij = k.split(',').map(Number), r = G.cell(ij[0], ij[1]); c.save(); c.strokeStyle = C.pink; c.lineWidth = 2.5; dr.rrect(c, r.x + 6, r.y + 6, r.w - 12, r.h - 12, 7); c.stroke(); c.restore(); });
      // deviation arrows
      if (S.arrows || S.shown) {
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var d = M.deviation(g, i, j), r = G.cell(i, j), len = Math.min(r.w, r.h) * 0.32;
          if (d.row >= 0) { var up = d.row < i; dr.arrow(c, r.x + 13, r.y + r.h / 2 + (up ? len / 2 : -len / 2), 0, up ? -len : len, C.p1, { width: 2.2, alpha: 0.85 }); }
          if (d.col >= 0) { var lf = d.col < j; dr.arrow(c, r.x + r.w / 2 + (lf ? len / 2 : -len / 2), r.y + r.h - 11, lf ? -len : len, 0, C.p2, { width: 2.2, alpha: 0.85 }); }
        }
      }
      // message
      dr.wrap(c, S.msg, 14, h - bot + 18, w - 28, narrow ? 17 : 19, S.flash && S.flash.t > 0 ? '#ffd8a8' : C.ink, { size: narrow ? 12.5 : 14, max: narrow ? 5 : 4 });
      S.parts.forEach(function (q) { c.globalAlpha = Math.max(0, q.life); c.fillStyle = q.col; c.fillRect(q.x - 2, q.y - 2, 4, 4); }); c.globalAlpha = 1;
    }
    function burst() { if (reduced) return; var x = K.w / 2, y = K.h / 2; for (var k = 0; k < 40; k++) { var a = Math.random() * 6.283, s = 80 + 170 * Math.random(); S.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 1, col: [C.gold, C.pink, C.green, C.blue][k % 4] }); } }
    L.loop(function (dt) {
      var busy = S.parts.length || (S.flash && S.flash.t > 0);
      if (S.flash && S.flash.t > 0) S.flash.t = Math.max(0, S.flash.t - dt * 1.5);
      S.parts.forEach(function (q) { q.vy += 260 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt * 0.8; }); S.parts = S.parts.filter(function (q) { return q.life > 0; });
      if (busy) render();
    }, cv);
    // ---------- input ----------
    cv.addEventListener('click', function (e) {
      if (!S.G) return; var r = cv.getBoundingClientRect(), h = S.G.hit(e.clientX - r.left, e.clientY - r.top); S.kbd = false;
      if (!h || h.i === undefined) return;
      if (S.mode === 'mark') mark(h.i, h.j, h.half); else pick(h.i, h.j);
    });
    cv.addEventListener('keydown', function (e) {
      var n = S.g.rows.length, k = e.key;
      if (k.indexOf('Arrow') === 0) { e.preventDefault(); S.kbd = true; if (k === 'ArrowUp') S.cur[0] = (S.cur[0] + n - 1) % n; if (k === 'ArrowDown') S.cur[0] = (S.cur[0] + 1) % n; if (k === 'ArrowLeft') S.cur[1] = (S.cur[1] + n - 1) % n; if (k === 'ArrowRight') S.cur[1] = (S.cur[1] + 1) % n; render(); }
      else if (k === '1' || k === ',') { S.kbd = true; mark(S.cur[0], S.cur[1], 1); }
      else if (k === '2' || k === '.') { S.kbd = true; mark(S.cur[0], S.cur[1], 2); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); S.kbd = true; pick(S.cur[0], S.cur[1]); }
      else if (k === 'c' || k === 'C') check(false);
      else if (k === 'a' || k === 'A') { S.arrows = !S.arrows; sync(); }
      else if (k === 'n' || k === 'N') load();
    });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) load(b.dataset.g); });
    el.size.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (b) { S.n = +b.dataset.n; load('rand'); } });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) { S.mode = b.dataset.m; load(); } });
    el.arrows.addEventListener('change', function () { S.arrows = el.arrows.checked; if (S.arrows) S.firstCheck = false; sync(); });
    el.newg.addEventListener('click', function () { load(); });
    el.reset.addEventListener('click', function () { load(); });
    el.check.addEventListener('click', function () { check(false); });
    el.none.addEventListener('click', function () { check(true); });
    el.show.addEventListener('click', showAll);
    W.addEventListener('resize', render); L.onTheme(render);
    load('bos');
    W.__gt3 = { S: S, mark: mark, pick: pick, check: check, load: load, setMode: function (m) { S.mode = m; load(); }, setN: function (n) { S.n = n; } };
  })();

  /* =====================================================================================
     2. FOCAL POINTS
     ===================================================================================== */
  (function () {
    var box = $('gt3f'); if (!box) return;
    var el = { q: $('gt3f-q'), opts: $('gt3f-opts'), res: $('gt3f-res'), next: $('gt3f-next'), prog: $('gt3f-prog'), score: $('gt3f-score') };
    var rng = GT.rng(Date.now() % 77777), S = { k: 0, wins: 0, played: 0, answered: false };
    function draw() {
      var P = M.FOCAL[S.k]; S.answered = false;
      el.prog.textContent = 'Puzzle ' + (S.k + 1) + ' of ' + M.FOCAL.length;
      el.q.textContent = P.q; el.res.innerHTML = ''; el.next.hidden = true;
      if (P.grid !== undefined) el.opts.innerHTML = '<div class="gt3f-grid">' + P.opts.map(function (o, i) { return '<button type="button" data-k="' + i + '" class="' + (i === P.grid ? 'gt3f-odd' : '') + '" aria-label="Square ' + (i + 1) + (i === P.grid ? ', the red one' : '') + '"></button>'; }).join('') + '</div>';
      else el.opts.innerHTML = P.opts.map(function (o, i) { return '<button type="button" data-k="' + i + '">' + o + '</button>'; }).join('');
    }
    function answer(k) {
      if (S.answered) return; S.answered = true;
      var P = M.FOCAL[S.k], j = M.focalPartner(P, rng), win;
      if (P.pay === 'claim') { var a = +P.opts[k].slice(1), b = +P.opts[j].slice(1); win = a + b <= 100; }
      else win = j === k;
      S.played++; if (win) S.wins++;
      el.opts.querySelectorAll('button').forEach(function (bt, i) { bt.disabled = true; if (i === k) bt.classList.add('gt3f-you'); if (i === j) bt.classList.add('gt3f-them'); });
      var who = P.grid !== undefined ? 'square ' + (j + 1) + (j === P.grid ? ' (the red one)' : '') : P.opts[j];
      var mine = P.grid !== undefined ? 'square ' + (k + 1) : P.opts[k];
      var head = P.pay === 'claim' ? (win ? '✓ Compatible: you get ' + P.opts[k] + ' and your partner ' + P.opts[j] + '.' : '✗ Your claims add up to more than $100: you both get nothing.') : (win ? '✓ You both chose ' + mine + '. You coordinated!' : '✗ You chose ' + mine + '; your partner chose ' + who + '.');
      var bars = '<div class="gt3f-bars" aria-label="How simulated partners answer">' + P.opts.map(function (o, i) { var lab = P.grid !== undefined ? (i === P.grid ? 'red square' : '') : o; return lab ? '<div><span>' + lab + '</span><i style="width:' + Math.round(P.w[i] * 100) + '%"></i><b>' + Math.round(P.w[i] * 100) + '%</b></div>' : ''; }).join('') + (P.grid !== undefined ? '<div><span>any other square</span><i style="width:' + Math.round((1 - P.w[P.grid]) / 15 * 100) + '%"></i><b>' + Math.round((1 - P.w[P.grid]) / 15 * 100) + '% each</b></div>' : '') + '</div>';
      el.res.innerHTML = '<p class="gt3f-head ' + (win ? 'gt3f-ok' : 'gt3f-no') + '">' + head + '</p>' + bars + '<p class="gt3f-note">' + P.note + (P.real ? '' : '') + '</p>';
      el.next.hidden = false; el.next.textContent = S.k < M.FOCAL.length - 1 ? 'Next puzzle →' : 'Start again ↺';
      el.score.textContent = 'You coordinated in ' + S.wins + ' of ' + S.played + '.';
    }
    el.opts.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) answer(+b.dataset.k); });
    el.next.addEventListener('click', function () { S.k = (S.k + 1) % M.FOCAL.length; if (S.k === 0) { S.wins = 0; S.played = 0; el.score.textContent = ''; } draw(); el.q.focus && el.q.focus(); });
    draw();
  })();
})(window, document);
