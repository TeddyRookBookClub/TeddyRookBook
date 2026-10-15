/* Game Theory, Chapter 2: Dominance and the Prisoner's Dilemma. Two interactives:
   1. (main, with missions) cross out strictly dominated actions step by step, you first, or watch it done;
      and play the prisoner's dilemma against bots;
   2. a public-goods game in a group of four, with and without punishment.
   Models: model.js (window.GT2M), tested in node. Shared look and game math: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT2M, root = D.getElementById('gt2-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;

  /* =====================================================================================
     1. CROSS IT OUT, AND THE PRISONER'S DILEMMA
     ===================================================================================== */
  (function () {
    var view = $('gt2-view'), cv = $('gt2-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, store = L.store('gt2'), rng = GT.rng(Date.now() % 1000003);
    var el = { mode: $('gt2-mode'), pz: $('gt2-pz'), pdg: $('gt2-pdg'), kind: $('gt2-kind'), newp: $('gt2-newp'), hint: $('gt2-hint'), step: $('gt2-step'), watch: $('gt2-watch'), none: $('gt2-none'),
      pread: $('gt2-pread'), bots: $('gt2-bots'), q: $('gt2-q'), f: $('gt2-f'), newm: $('gt2-newm'), dread: $('gt2-dread'), blurb: $('gt2-blurb'), reset: $('gt2-reset'), msg: $('gt2-msg') };
    var S = { mode: 'puzzle', kind: '3', P: null, D: null, bot: 'saint', t: 0, fx: [], parts: [], watching: false, wt: 0, focus: 0 };
    var MS = L.missions($('gt2-missions'), 'gt2', [
      { id: 'spot', title: 'Spot one', goal: 'Cross out an action that is strictly dominated: click its name in the matrix.' },
      { id: 'solve3', title: 'Solve a 3×3 yourself', goal: 'Cross out everything down to a single cell in a 3×3 puzzle, without Step, Watch or Hint.' },
      { id: 'solve4', title: 'Solve a 4×4 yourself', goal: 'Six eliminations, no help. Some steps only open up after earlier ones.' },
      { id: 'stuck', title: 'Know when to stop', goal: 'In a Random game, cross out what you can, then press “Nothing left” when no dominated action remains.' },
      { id: 'tempt', title: 'The temptation', goal: 'In the prisoner’s dilemma, fink while the Saint stays quiet: 3 points for you, 0 for it.' },
      { id: 'trap', title: 'The trap', goal: 'End a round at (Fink, Fink), where both get 1 although (Quiet, Quiet) pays both 2.' },
      { id: 'shark', title: 'Swim with the Shark', goal: 'Play a full 10-round match against the Shark. Can you ever finish ahead of it?' }
    ]);
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }

    // ---------- puzzles ----------
    function newPuzzle(kind) {
      S.kind = kind || S.kind;
      var n = S.kind === '4' ? 4 : 3, g = S.kind === 'rand' ? M.genRandom(3, rng) : M.genSolvable(n, rng);
      S.P = { g: g, n: n, alive: { rows: GT.range(n), cols: GT.range(n) }, dead: { rows: {}, cols: {} }, steps: 0, need: S.kind === 'rand' ? null : 2 * (n - 1), mistakes: 0, help: false, finished: false,
        msg: 'Click the name of a row or a column that is strictly dominated: some other action of the same player pays more against everything the opponent might still do.', cmp: null, bad: null, pulse: null };
      S.watching = false; S.fx.length = 0; sync(); render();
    }
    function solvedState() { var P = S.P; return P.alive.rows.length === 1 && P.alive.cols.length === 1; }
    function nameOf(pl, k) { return pl === 1 ? S.P.g.rows[k] : S.P.g.cols[k]; }
    function who(pl) { return pl === 1 ? 'Row' : 'Column'; }
    function tryEliminate(pl, b, auto) {
      var P = S.P, g = P.g; if (P.finished) return;
      var own = pl === 1 ? P.alive.rows : P.alive.cols, opp = pl === 1 ? P.alive.cols : P.alive.rows;
      if (own.indexOf(b) < 0) return;
      var by = -1; own.forEach(function (a) { if (by < 0 && GT.dominates(g, pl, a, b, P.alive)) by = a; });
      if (by < 0) {
        P.mistakes++; var ce = M.counterexamples(g, pl, b, P.alive);
        P.bad = { pl: pl, b: b, ce: ce, t: 0 };
        P.msg = nameOf(pl, b) + ' is not dominated. ' + ce.slice(0, 2).map(function (x) { return nameOf(pl, x.a) + ' does no better against ' + nameOf(pl === 1 ? 2 : 1, x.o) + ' (' + GT.num(x.ua) + ' vs ' + GT.num(x.ub) + ')'; }).join('; ') + '.';
        if (own.length === 1) P.msg = 'That is ' + who(pl) + '’s only action left: it can’t be crossed out.';
        sync(); return;
      }
      // a valid elimination
      if (pl === 1) P.alive.rows = P.alive.rows.filter(function (x) { return x !== b; }); else P.alive.cols = P.alive.cols.filter(function (x) { return x !== b; });
      (pl === 1 ? P.dead.rows : P.dead.cols)[b] = reduced ? 1 : 0.001;
      P.steps++; if (auto) P.help = true; P.bad = null;
      var pairs = opp.map(function (o) { return pl === 1 ? [g.A[by][o], g.A[b][o]] : [g.B[o][by], g.B[o][b]]; });
      P.cmp = { pl: pl, a: by, b: b, opp: opp.slice(), t: reduced ? 1 : 0 };
      P.msg = who(pl) + '’s ' + nameOf(pl, b) + ' is strictly dominated by ' + nameOf(pl, by) + ': ' + pairs.map(function (q) { return GT.num(q[0]) + ' > ' + GT.num(q[1]); }).join(', ') + ' against ' + (pl === 1 ? 'Column' : 'Row') + '’s remaining actions.';
      if (!auto) done('spot', 'Strictly dominated: crossed out.');
      if (solvedState()) finish(true);
      else if (!GT.dominatedAll(g, P.alive).length && S.kind !== 'rand') finish(false);
      sync();
    }
    function finish(solved) {
      var P = S.P; P.finished = true; S.watching = false;
      if (solved) {
        var i = P.alive.rows[0], j = P.alive.cols[0];
        P.msg = 'Solved. Only (' + P.g.rows[i] + ', ' + P.g.cols[j] + ') survives, with payoffs ' + GT.num(P.g.A[i][j]) + ', ' + GT.num(P.g.B[i][j]) + '. It is the game’s only Nash equilibrium (Chapter 3).';
        if (!P.help && P.n === 3 && S.kind === '3') done('solve3', 'You solved a 3×3 by iterated dominance.');
        if (!P.help && P.n === 4) done('solve4', 'Six steps, no help. Nicely reasoned.');
        if (!P.help) burst();
      }
    }
    function claimNone() {
      var P = S.P; if (P.finished && solvedState()) return;
      var d = GT.dominatedAll(P.g, P.alive);
      if (d.length) { P.mistakes++; P.msg = 'Not yet: something is still strictly dominated. Look at ' + who(d[0].pl) + '’s actions.'; P.pulse = { pl: d[0].pl, k: d[0].idx, t: 0 }; }
      else {
        P.finished = true; var cells = P.alive.rows.length * P.alive.cols.length;
        P.msg = 'Right: nothing left is strictly dominated. ' + cells + ' cells survive. Dominance alone can’t pick an outcome here; Chapter 3’s Nash equilibrium goes further.';
        if (cells > 1) done('stuck', 'Correct: dominance gets stuck here.');
      }
      sync();
    }
    function hint() { var P = S.P, d = GT.dominatedAll(P.g, P.alive); P.help = true; if (!d.length) { P.msg = 'No strictly dominated action is left.'; } else { P.pulse = { pl: d[0].pl, k: d[0].idx, t: 0 }; P.msg = 'Hint: look at ' + who(d[0].pl) + '’s ' + nameOf(d[0].pl, d[0].idx) + '. Compare it, entry by entry, with ' + nameOf(d[0].pl, d[0].by) + '.'; } sync(); }
    function step() { var P = S.P, d = GT.dominatedAll(P.g, P.alive); if (!d.length) { if (!P.finished) claimNoneAuto(); return; } tryEliminate(d[0].pl, d[0].idx, true); }
    function claimNoneAuto() { var P = S.P; P.help = true; P.finished = true; P.msg = 'Nothing left is strictly dominated. ' + (P.alive.rows.length * P.alive.cols.length) + ' cells survive.'; sync(); }
    // ---------- prisoner's dilemma ----------
    function newMatch() { S.D = { hist: [], you: 0, it: 0, last: null, msg: 'Choose Quiet or Fink. ' + M.PDBOTS[S.bot].name + ' chooses at the same time. Ten rounds.', t: 1 }; sync(); render(); }
    function playPD(a) {
      var Dd = S.D; if (Dd.hist.length >= 10) newMatch(), Dd = S.D;
      var b = M.pdMove(S.bot, Dd.hist, rng), g = M.PD, u = g.A[a][b], v = g.B[a][b], alt = g.A[1 - a][b];
      Dd.hist.push({ you: a, bot: b }); Dd.you += u; Dd.it += v; Dd.last = { i: a, j: b }; Dd.t = reduced ? 1 : 0;
      var nm = M.PDBOTS[S.bot].name, act = ['stayed quiet', 'finked'];
      Dd.msg = 'You ' + act[a] + ', ' + nm + ' ' + act[b] + ': you get **' + u + '**, it gets **' + v + '**. ' + (a === 1 ? 'Staying quiet would have paid you ' + alt + ': finking earned 1 more.' : 'Finking would have paid you ' + alt + ': 1 more.') + ' In a single round it always does.';
      if (Dd.hist.length === 10) Dd.msg += ' Match over: you ' + Dd.you + ', ' + nm + ' ' + Dd.it + '.' + (S.bot === 'mirror' && a === 1 ? '' : '');
      if (a === 1 && b === 0 && S.bot === 'saint') done('tempt', 'The temptation payoff: 3 for you, 0 for the Saint.');
      if (a === 1 && b === 1) done('trap', 'Both fink: 1 each, though both prefer 2.');
      if (S.bot === 'shark' && Dd.hist.length === 10) done('shark', 'Against an always-finker the best you can do is tie.');
      if (!reduced && a === 1 && b === 0) burst(true);
      sync();
    }
    // ---------- the panel ----------
    function sync() {
      GT.seg(el.mode, 'data-mode', S.mode); el.pz.hidden = S.mode !== 'puzzle'; el.pdg.hidden = S.mode !== 'pd';
      if (S.P) {
        var P = S.P; GT.seg(el.kind, 'data-kind', S.kind);
        el.pread.innerHTML = '<dt>Crossed out</dt><dd>' + P.steps + (P.need ? ' of ' + P.need : '') + '</dd><dt>Wrong clicks</dt><dd>' + P.mistakes + '</dd><dt>Cells left</dt><dd>' + P.alive.rows.length * P.alive.cols.length + '</dd><dt>Help used</dt><dd>' + (P.help ? 'yes' : 'no') + '</dd>';
        el.none.hidden = S.kind !== 'rand';
        el.watch.textContent = S.watching ? '❚❚ Stop' : '▶ Watch it solve';
      }
      if (S.D) {
        var Dd = S.D; GT.seg(el.bots, 'data-bot', S.bot); el.blurb.textContent = M.PDBOTS[S.bot].blurb;
        var fk = Dd.hist.filter(function (h) { return h.you === 1; }).length;
        el.dread.innerHTML = '<dt>Round</dt><dd>' + Dd.hist.length + ' of 10</dd><dt>Your total</dt><dd>' + Dd.you + '</dd><dt>' + M.PDBOTS[S.bot].name + '’s total</dt><dd>' + Dd.it + '</dd><dt>Rounds you finked</dt><dd>' + fk + '</dd>';
      }
      var m = S.mode === 'puzzle' ? (S.P ? S.P.msg : '') : (S.D ? S.D.msg.replace(/\*\*/g, '') : '');
      if (el.msg) el.msg.textContent = m;
      render();
    }
    // ---------- drawing ----------
    function box() {
      var w = K.w, h = K.h, narrow = w < 560, top = narrow ? 52 : 58, bot = narrow ? 104 : 96;
      return { w: w, h: h, narrow: narrow, top: top, bot: bot };
    }
    function matrixBox(n, B, maxCellW, maxCellH, g) {
      var availW = B.w - 24, availH = B.h - B.top - B.bot;
      var headW = g ? GT.headW(c, g, 54, Math.min(120, availW * 0.3)) : clamp(availW * 0.16, 54, 100), headH = 36, names = 22;
      var cw = Math.min(maxCellW, (availW - headW) / n), ch = Math.min(maxCellH, (availH - headH - names) / n);
      var w = headW + cw * n, h = names + headH + ch * n;
      return { x: (B.w - w) / 2, y: B.top + (availH - h) / 2, w: w, h: h, headW: headW, headH: headH };
    }
    function render() {
      var B = box(); dr.bg(c, B.w, B.h);
      if (S.mode === 'puzzle') { if (S.P) renderPuzzle(B); } else if (S.D) renderPD(B);
      S.parts.forEach(function (q) { c.globalAlpha = Math.max(0, q.life); c.fillStyle = q.col; c.fillRect(q.x - 2, q.y - 2, 4, 4); }); c.globalAlpha = 1;
    }
    function renderPuzzle(B) {
      var P = S.P, g = P.g, n = P.n;
      dr.label(c, B.narrow ? (S.kind === 'rand' ? 'Random game: cross out what you can' : 'Cross out dominated actions') : (S.kind === 'rand' ? 'A random game: cross out what you can' : 'Cross out everything no rational player would choose'), 14, 22, C.ink, { size: B.narrow ? 13 : 15, bold: true });
      dr.label(c, 'Crossed out ' + P.steps + (P.need ? ' of ' + P.need : '') + (P.mistakes ? ' · wrong clicks ' + P.mistakes : ''), 14, 42, C.muted, { size: 12 });
      var mb = matrixBox(n, B, 130, 82, g), pulse = P.pulse && !reduced ? 0.5 + 0.5 * Math.sin(S.t * 6) : 1;
      var hl = {}; // cell highlights
      if (P.cmp && P.cmp.t < 3) P.cmp.opp.forEach(function (o) { var pl = P.cmp.pl; hl[pl === 1 ? P.cmp.a + '_' + o : o + '_' + P.cmp.a] = 'rgba(99,230,190,.20)'; hl[pl === 1 ? P.cmp.b + '_' + o : o + '_' + P.cmp.b] = 'rgba(255,135,135,.16)'; });
      if (P.bad) P.bad.ce.forEach(function (x) { var pl = P.bad.pl; hl[pl === 1 ? x.a + '_' + x.o : x.o + '_' + x.a] = 'rgba(255,212,121,.22)'; hl[pl === 1 ? P.bad.b + '_' + x.o : x.o + '_' + P.bad.b] = 'rgba(255,135,135,.25)'; });
      var finishedOne = P.finished && P.alive.rows.length === 1 && P.alive.cols.length === 1;
      var G = GT.drawMatrix(c, mb, g, {
        headW: mb.headW, headH: mb.headH, dead: P.dead, ne: finishedOne ? [[P.alive.rows[0], P.alive.cols[0]]] : [],
        rowHi: P.pulse && P.pulse.pl === 1 ? P.pulse.k : (S.focusPl === 1 ? S.focusK : undefined), colHi: P.pulse && P.pulse.pl === 2 ? P.pulse.k : (S.focusPl === 2 ? S.focusK : undefined),
        cellFill: function (i, j) { return hl[i + '_' + j] || null; }
      });
      S.G = G;
      // keyboard focus ring on a header
      if (S.focusPl) { var fr = S.focusPl === 1 ? G.row(S.focusK) : G.col(S.focusK); c.save(); c.strokeStyle = C.pink; c.lineWidth = 2; c.setLineDash([4, 3]); dr.rrect(c, fr.x + 2, fr.y + 2, fr.w - 4, fr.h - 4, 6); c.stroke(); c.restore(); }
      if (P.pulse) { var pr = P.pulse.pl === 1 ? G.row(P.pulse.k) : G.col(P.pulse.k); c.save(); c.globalAlpha = 0.35 + 0.65 * pulse; c.strokeStyle = C.gold; c.lineWidth = 2.5; dr.rrect(c, pr.x + 1, pr.y + 1, pr.w - 2, pr.h - 2, 7); c.stroke(); c.restore(); }
      // comparison arrows: from each dominated cell to the dominating cell
      if (P.cmp && P.cmp.t < 3) {
        var a = clamp(P.cmp.t / 0.6, 0, 1), fade = P.cmp.t > 2.2 ? 1 - (P.cmp.t - 2.2) / 0.8 : 1;
        P.cmp.opp.forEach(function (o) {
          var r0 = P.cmp.pl === 1 ? G.cell(P.cmp.b, o) : G.cell(o, P.cmp.b), r1 = P.cmp.pl === 1 ? G.cell(P.cmp.a, o) : G.cell(o, P.cmp.a);
          var x0 = r0.x + r0.w * (P.cmp.pl === 1 ? 0.3 : 0.5), y0 = r0.y + r0.h * 0.5, x1 = r1.x + r1.w * (P.cmp.pl === 1 ? 0.3 : 0.5), y1 = r1.y + r1.h * 0.5;
          if (P.cmp.pl === 2) { x0 = r0.x + r0.w * 0.5; x1 = r1.x + r1.w * 0.5; y0 = r0.y + r0.h * 0.78; y1 = r1.y + r1.h * 0.78; } else { y0 = r0.y + r0.h * 0.5; y1 = r1.y + r1.h * 0.5; x0 = x1 = r0.x + 12; }
          var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 4) return;
          var ux = dx / len, uy = dy / len;
          dr.arrow(c, x0 + ux * 10, y0 + uy * 10, (dx - ux * 20) * a, (dy - uy * 20) * a, P.cmp.pl === 1 ? C.p1 : C.p2, { width: 2.5, alpha: 0.9 * fade, glow: true });
        });
      }
      // strike animation progress
      ['rows', 'cols'].forEach(function (k) { Object.keys(P.dead[k]).forEach(function (q) { if (P.dead[k][q] < 1) P.dead[k][q] = Math.min(1, P.dead[k][q] + 0.03 + (P.cmp && P.cmp.t > 0.5 ? 0.04 : 0)); }); });
      // message
      var ty = B.h - B.bot + 18;
      dr.wrap(c, P.msg, 14, ty, B.w - 28, B.narrow ? 17 : 19, P.bad ? '#ffd8a8' : C.ink, { size: B.narrow ? 12.5 : 14, max: B.narrow ? 5 : 4, col2: C.gold });
    }
    function renderPD(B) {
      var Dd = S.D, g = M.PD, nm = M.PDBOTS[S.bot].name;
      g.p2 = nm;
      dr.label(c, (B.narrow ? 'You against ' : 'The prisoner’s dilemma: you against ') + nm, 14, 22, C.ink, { size: B.narrow ? 13 : 15, bold: true });
      dr.label(c, 'Round ' + Math.min(10, Dd.hist.length + (Dd.hist.length < 10 ? 1 : 0)) + ' of 10' + (B.narrow ? '' : ' · click a row or press Q / F'), 14, 42, C.muted, { size: 12 });
      var side = !B.narrow, mbW = side ? B.w * 0.55 : B.w, sub = { w: mbW, h: B.h, top: B.top, bot: side ? B.bot : B.bot + 120 };
      var mb = matrixBox(2, sub, 150, 96, g); if (side) mb.x = 18 + (mbW - 18 - mb.w) / 2;
      var fl = Dd.last && Dd.t < 1 ? { i: Dd.last.i, j: Dd.last.j, t: 0.6 * (1 - Dd.t), col: C.pink } : null;
      S.G = GT.drawMatrix(c, mb, g, { headW: mb.headW, headH: mb.headH, hi: Dd.last ? [Dd.last.i, Dd.last.j] : null, flash: fl, size: B.narrow ? 20 : 26 });
      // the "regret" arrow: from your cell to the other row in the same column
      if (Dd.last) {
        var r0 = S.G.cell(Dd.last.i, Dd.last.j), r1 = S.G.cell(1 - Dd.last.i, Dd.last.j), up = Dd.last.i === 1;
        var xa = r0.x + 14, ya = r0.y + r0.h / 2, yb = r1.y + r1.h / 2, d = g.A[1][Dd.last.j] - g.A[0][Dd.last.j];
        dr.arrow(c, xa, up ? yb : ya, 0, (up ? ya - yb : yb - ya) * 0.86, C.gold, { width: 2, alpha: 0.85 });
        dr.label(c, '+' + d, xa + 8, (ya + yb) / 2, C.gold, { size: 12, bold: true });
      }
      // score panel
      var px = side ? mbW + 10 : 14, pw = side ? B.w - mbW - 24 : B.w - 28, ph = side ? Math.min(250, B.h - B.top - B.bot - 20) : 104, py = side ? B.top + (B.h - B.top - B.bot - ph) / 2 : mb.y + mb.h + 10;
      dr.panel(c, px, py, pw, ph, 'Score after ' + Dd.hist.length + ' of 10');
      var mx = Math.max(30, Dd.you, Dd.it), bw = pw - 70, rows = [['You', Dd.you, C.p1], [nm, Dd.it, C.p2]];
      rows.forEach(function (rw, k) {
        var yy = py + 34 + k * 26;
        dr.label(c, rw[0], px + 10, yy, rw[2], { size: 12, bold: true });
        c.fillStyle = 'rgba(255,255,255,.06)'; dr.rrect(c, px + 60, yy - 8, bw - 4, 16, 6); c.fill();
        c.fillStyle = rw[2]; dr.rrect(c, px + 60, yy - 8, Math.max(2, (bw - 4) * rw[1] / mx), 16, 6); c.fill();
        dr.label(c, String(rw[1]), px + 64 + Math.max(2, (bw - 4) * rw[1] / mx), yy, '#fff', { size: 11.5, bold: true });
      });
      // history chips
      var hy = py + 34 + 2 * 26 + 6, cw = Math.min(28, (pw - 20) / 10);
      for (var k = 0; k < 10; k++) {
        var hx = px + 10 + k * cw, e = Dd.hist[k];
        c.fillStyle = 'rgba(255,255,255,.05)'; dr.rrect(c, hx, hy, cw - 3, 30, 5); c.fill();
        if (e) { dr.label(c, e.you ? 'F' : 'Q', hx + (cw - 3) / 2, hy + 9, C.p1, { size: 11, bold: true, align: 'center', plain: true }); dr.label(c, e.bot ? 'F' : 'Q', hx + (cw - 3) / 2, hy + 22, C.p2, { size: 11, bold: true, align: 'center', plain: true }); }
      }
      if (side && ph > 190) dr.wrap(c, 'Fink pays exactly 1 more than Quiet in each column. So each player finks, and both get 1 instead of 2.', px + 10, hy + 52, pw - 20, 17, C.muted, { size: 12 });
      dr.wrap(c, Dd.msg, 14, B.h - B.bot + 18, B.w - 28, B.narrow ? 17 : 19, C.ink, { size: B.narrow ? 12.5 : 14, max: 4, col2: C.gold });
    }
    function burst(small) { if (reduced) return; var x = K.w / 2, y = K.h / 2; for (var k = 0; k < (small ? 18 : 50); k++) { var a = Math.random() * 6.283, s = 80 + 180 * Math.random(); S.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 1, col: [C.gold, C.pink, C.green, C.blue][k % 4] }); } }
    L.loop(function (dt) {
      S.t += dt;
      var busy = S.parts.length > 0 || (S.mode === 'puzzle' && S.P && (S.P.cmp && S.P.cmp.t < 3 || S.P.pulse)) || (S.mode === 'pd' && S.D && S.D.t < 1);
      if (S.P && S.P.cmp) S.P.cmp.t += dt;
      if (S.P && S.P.pulse) { S.P.pulse.t += dt; if (S.P.pulse.t > 4) S.P.pulse = null; }
      if (S.D && S.D.t < 1) S.D.t = Math.min(1, S.D.t + dt * 1.6);
      S.parts.forEach(function (q) { q.vy += 260 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt * 0.8; }); S.parts = S.parts.filter(function (q) { return q.life > 0; });
      if (S.watching && S.mode === 'puzzle') { S.wt += dt; if (S.wt > 1.9) { S.wt = 0; if (S.P.finished) { S.watching = false; sync(); } else step(); } }
      if (busy || S.watching) render();
    }, cv);
    // ---------- input ----------
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('click', function (e) {
      if (!S.G) return; var p = ptr(e), h = S.G.hit(p.x, p.y); if (!h) return;
      if (S.mode === 'puzzle') { if (h.row !== undefined) tryEliminate(1, h.row); else if (h.col !== undefined) tryEliminate(2, h.col); }
      else { var i = h.row !== undefined ? h.row : h.i; if (i !== undefined && i >= 0) playPD(i); }
    });
    cv.addEventListener('keydown', function (e) {
      var k = e.key;
      if (S.mode === 'pd') { if (k === 'q' || k === 'Q') playPD(0); else if (k === 'f' || k === 'F') playPD(1); else if (k === 'n' || k === 'N') newMatch(); return; }
      var P = S.P, list = P.alive.rows.map(function (x) { return [1, x]; }).concat(P.alive.cols.map(function (x) { return [2, x]; }));
      if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowLeft') {
        e.preventDefault(); S.focus = (S.focus + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : list.length - 1)) % list.length;
        S.focusPl = list[S.focus][0]; S.focusK = list[S.focus][1]; render();
      } else if ((k === 'Enter' || k === ' ') && S.focusPl) { e.preventDefault(); tryEliminate(S.focusPl, S.focusK); S.focusPl = null; }
      else if (k === 'h' || k === 'H') hint(); else if (k === 's' || k === 'S') step(); else if (k === 'n' || k === 'N') newPuzzle();
    });
    cv.addEventListener('blur', function () { S.focusPl = null; render(); });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-mode]'); if (!b) return; S.mode = b.dataset.mode; S.watching = false; sync(); });
    el.kind.addEventListener('click', function (e) { var b = e.target.closest('button[data-kind]'); if (b) newPuzzle(b.dataset.kind); });
    el.newp.addEventListener('click', function () { newPuzzle(); });
    el.hint.addEventListener('click', hint);
    el.step.addEventListener('click', step);
    el.watch.addEventListener('click', function () { if (S.P.finished) newPuzzle(); S.watching = !S.watching; S.wt = 1.5; if (S.watching) S.P.help = true; sync(); });
    el.none.addEventListener('click', claimNone);
    el.bots.addEventListener('click', function (e) { var b = e.target.closest('button[data-bot]'); if (!b) return; S.bot = b.dataset.bot; newMatch(); });
    el.q.addEventListener('click', function () { playPD(0); }); el.f.addEventListener('click', function () { playPD(1); });
    el.newm.addEventListener('click', newMatch);
    el.reset.addEventListener('click', function () { if (S.mode === 'puzzle') newPuzzle(); else newMatch(); });
    W.addEventListener('resize', render); L.onTheme(render);
    newPuzzle('3'); newMatch();
    W.__gt2 = { S: S, tryEliminate: tryEliminate, step: step, claimNone: claimNone, playPD: playPD, newPuzzle: newPuzzle, setMode: function (m) { S.mode = m; sync(); } };
  })();

  /* =====================================================================================
     2. THE PUBLIC-GOODS GAME
     ===================================================================================== */
  (function () {
    var view = $('gt2p-view'), cv = $('gt2p-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(271828);
    var el = { c: $('gt2p-c'), cO: $('gt2p-c-o'), go: $('gt2p-go'), pun: $('gt2p-pun'), fr: $('gt2p-fr'), types: $('gt2p-types'), newg: $('gt2p-new'), auto: $('gt2p-auto'), read: $('gt2p-read'), pbox: $('gt2p-pbox'), msg: $('gt2p-msg') };
    var NAMES = ['You', 'Ana', 'Ben', 'Cy'], TYPEN = { cc: 'conditional cooperator', fr: 'free rider', alt: 'altruist' };
    var S = { you: 10, punish: false, fr: 1, showTypes: false, agents: null, last: null, round: 0, phase: 'give', cs: null, pts: [0, 0, 0, 0], hist: [], total: 0, t: 1, ref: null, auto: 0 };
    function refCurves() { // the simulated lab session: 10 groups of 4 bots, 30% free riders, averaged over 60 runs
      var T = 10, a0 = [], a1 = [], k, t, r = GT.rng(5);
      for (t = 0; t < T; t++) { a0.push(0); a1.push(0); }
      for (k = 0; k < 60; k++) { var x = M.session(10, 0.3, false, T, r), y = M.session(10, 0.3, true, T, r); for (t = 0; t < T; t++) { a0[t] += x[t] / 60; a1[t] += y[t] / 60; } }
      S.ref = { no: a0, yes: a1 };
    }
    function newGame() {
      var types = ['cc', 'cc', 'cc']; for (var k = 0; k < S.fr; k++) types[2 - k] = 'fr';
      if (S.fr === 0) types[2] = 'alt';
      S.agents = [null].concat(types.map(function (t) { return M.makeAgent(t, rng); }));
      S.last = null; S.round = 0; S.phase = 'give'; S.cs = null; S.pts = [0, 0, 0, 0]; S.hist = []; S.total = 0; S.auto = 0;
      el.msg.textContent = 'Round 1. Choose how many of your 20 tokens to put in the project, then press Contribute.';
      sync();
    }
    function contribute() {
      if (S.round >= 10) { newGame(); return; }
      S.cs = M.contribute(S.agents, S.round, S.last, S.punish, rng, S.you); S.t = reduced ? 1 : 0;
      if (S.punish) { S.phase = 'punish'; S.pts = [0, 0, 0, 0]; el.msg.textContent = 'Contributions are in. Assign punishment points if you like (each costs you 1 token and the target 3), then press Finish round.'; sync(); }
      else settle();
    }
    function settle() {
      var res = M.settle(S.agents, S.cs, S.punish, rng, S.pts.slice());
      S.last = res; S.round++; S.total += res.pay[0]; S.phase = 'give';
      var avg = res.c.reduce(function (a, b) { return a + b; }, 0) / 4; S.hist.push(avg);
      var give0 = M.earn(res.c.map(function (v, i) { return i === 0 ? 0 : v; }), 0) - (res.spent[0] + 3 * res.recv[0]);
      el.msg.textContent = 'Round ' + S.round + ': the group gave ' + res.c.join(', ') + ' tokens. You earned ' + fmt(res.pay[0], 1) + '. Had you given 0, you would have earned ' + fmt(give0, 1) + (S.punish && res.recv[0] ? ' before any extra punishment' : '') + '.' + (S.round === 10 ? ' Game over: your total is ' + fmt(S.total, 1) + '.' : '');
      S.t = reduced ? 1 : 0; sync();
    }
    function sync() {
      el.c.value = S.you; el.cO.textContent = S.you + ' of 20';
      el.pun.checked = S.punish; el.types.checked = S.showTypes; GT.seg(el.fr, 'data-fr', S.fr);
      el.go.textContent = S.phase === 'punish' ? 'Finish round' : (S.round >= 10 ? 'New game' : '▶ Contribute');
      el.pbox.hidden = S.phase !== 'punish';
      if (S.phase === 'punish') el.pbox.querySelectorAll('[data-who]').forEach(function (row) {
        var j = +row.dataset.who; row.querySelector('b').textContent = NAMES[j] + ' gave ' + S.cs[j]; row.querySelector('output').textContent = S.pts[j];
      });
      var avg = S.hist.length ? S.hist[S.hist.length - 1] : null;
      el.read.innerHTML = '<dt>Round</dt><dd>' + S.round + ' of 10</dd><dt>Your earnings last round</dt><dd>' + (S.last ? fmt(S.last.pay[0], 1) : '—') + '</dd><dt>Your total</dt><dd>' + fmt(S.total, 1) + '</dd><dt>Group’s average gift</dt><dd>' + (avg === null ? '—' : fmt(avg, 1)) + '</dd>';
      render();
    }
    function render() {
      var w = K.w, h = K.h, narrow = w < 560; dr.bg(c, w, h);
      // the group: four players around a pot
      var gy = narrow ? 30 : 34, gh = h * (narrow ? 0.48 : 0.5), cx = w / 2, cyy = gy + gh / 2, rx = Math.min(w * 0.36, 260), ry = gh * 0.36;
      var pos = [[cx - rx, cyy + ry * 0.55], [cx - rx * 0.45, cyy - ry], [cx + rx * 0.45, cyy - ry], [cx + rx, cyy + ry * 0.55]];
      var cs = S.cs || (S.last ? S.last.c : null), t = S.t, e = 1 - Math.pow(1 - t, 3);
      var tot = cs ? cs.reduce(function (a, b) { return a + b; }, 0) : 0;
      // pot
      var potR = 22 + 22 * Math.sqrt(tot / 80);
      c.save(); c.fillStyle = 'rgba(99,230,190,.10)'; c.strokeStyle = 'rgba(99,230,190,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cyy + 6, potR, 0, 7); c.fill(); c.stroke(); c.restore();
      dr.label(c, cs ? String(tot) : 'pot', cx, cyy + 2, C.green, { size: 15, bold: true, align: 'center' });
      if (cs) dr.label(c, '× 1.6 = ' + fmt(tot * 1.6, 1), cx, cyy + 20, C.muted, { size: 10.5, align: 'center' });
      // flows of tokens into the pot
      if (cs && t < 1) cs.forEach(function (v, i) { for (var k = 0; k < Math.min(8, Math.ceil(v / 3)); k++) { var tt = clamp(t * 1.4 - k * 0.05, 0, 1); var x = pos[i][0] + (cx - pos[i][0]) * tt, y = pos[i][1] + (cyy - pos[i][1]) * tt - Math.sin(tt * Math.PI) * 26; c.fillStyle = C.gold; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); } });
      // punishment arrows
      if (S.last && S.punish && S.phase === 'give' && S.last.pts.length) S.last.pts.forEach(function (row, i) { row.forEach(function (q, j) { if (!q) return; var a = pos[i], b = pos[j], dx = b[0] - a[0], dy = b[1] - a[1], L2 = Math.hypot(dx, dy); dr.arrow(c, a[0] + dx / L2 * 30, a[1] + dy / L2 * 30, dx * (1 - 60 / L2), dy * (1 - 60 / L2), C.red, { width: 1 + q * 0.6, alpha: 0.75, dash: [5, 4] }); }); });
      // the players
      pos.forEach(function (p, i) {
        var col = i === 0 ? C.pink : C.blue, ag = S.agents[i];
        c.fillStyle = 'rgba(255,255,255,.05)'; dr.rrect(c, p[0] - 44, p[1] - 30, 88, 64, 10); c.fill();
        c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1] - 12, 9, 0, 7); c.fill();
        dr.label(c, NAMES[i], p[0], p[1] + 6, col, { size: 12, bold: true, align: 'center' });
        var sub = cs ? 'gave ' + cs[i] : '…';
        dr.label(c, sub, p[0], p[1] + 21, C.ink, { size: 11, align: 'center' });
        if (S.showTypes && ag) dr.label(c, TYPEN[ag.type], p[0], p[1] - 38, C.muted, { size: 10, align: 'center' });
        if (S.last && S.phase === 'give') dr.label(c, '+' + fmt(S.last.pay[i], 1), p[0] + 34, p[1] - 22, C.gold, { size: 10.5, bold: true, align: 'center', alpha: e });
      });
      // chart: average contribution by round
      var chx = narrow ? 34 : 46, chy = gy + gh + 18, chw = w - chx - 16, chh = h - chy - 34;
      dr.panel(c, chx - (narrow ? 26 : 36), chy - 14, chw + (narrow ? 38 : 48), chh + 44, '');
      dr.label(c, 'Average tokens given per round (of 20)', chx, chy, C.muted, { size: 11, bold: true });
      var X = function (r) { return chx + (chw - 10) * r / 9; }, Y = function (v) { return chy + 14 + (chh - 14) * (1 - v / 20); };
      c.strokeStyle = 'rgba(219,231,239,.12)'; c.lineWidth = 1; [0, 5, 10, 15, 20].forEach(function (v) { c.beginPath(); c.moveTo(chx, Y(v)); c.lineTo(chx + chw - 10, Y(v)); c.stroke(); dr.label(c, String(v), chx - 6, Y(v), C.muted, { size: 10, align: 'right' }); });
      for (var r = 0; r < 10; r++) dr.label(c, String(r + 1), X(r), chy + chh + 10, C.muted, { size: 10, align: 'center' });
      function line(arr, col, wdt, dash) { if (!arr || !arr.length) return; c.save(); c.strokeStyle = col; c.lineWidth = wdt; if (dash) c.setLineDash(dash); c.beginPath(); arr.forEach(function (v, k) { if (k) c.lineTo(X(k), Y(v)); else c.moveTo(X(k), Y(v)); }); c.stroke(); c.restore(); c.fillStyle = col; arr.forEach(function (v, k) { c.beginPath(); c.arc(X(k), Y(v), wdt + 0.6, 0, 7); c.fill(); }); }
      line(S.ref.no, 'rgba(143,179,198,.8)', 1.6, [5, 4]); line(S.ref.yes, 'rgba(99,230,190,.75)', 1.6, [5, 4]); line(S.hist, C.pink, 2.6);
      var lx = chx + 4, ly = chy + chh + 26;
      [['simulated lab, no punishment', 'rgba(143,179,198,.9)'], ['with punishment', 'rgba(99,230,190,.9)'], ['your group', C.pink]].forEach(function (it) { c.fillStyle = it[1]; c.fillRect(lx, ly - 2, 14, 3); var tw = dr.label(c, it[0], lx + 18, ly, C.muted, { size: 10.5 }); lx += tw + 32; });
    }
    L.loop(function (dt) { if (S.t < 1) { S.t = Math.min(1, S.t + dt / 1.1); render(); } if (S.auto > 0 && S.t >= 1) { if (S.phase === 'punish') settle(); else { S.auto--; contribute(); } } }, cv);
    el.c.addEventListener('input', function () { S.you = +el.c.value; el.cO.textContent = S.you + ' of 20'; });
    el.go.addEventListener('click', function () { if (S.phase === 'punish') settle(); else contribute(); });
    el.pun.addEventListener('change', function () { S.punish = el.pun.checked; newGame(); });
    el.types.addEventListener('change', function () { S.showTypes = el.types.checked; render(); });
    el.fr.addEventListener('click', function (e) { var b = e.target.closest('button[data-fr]'); if (!b) return; S.fr = +b.dataset.fr; newGame(); });
    el.newg.addEventListener('click', newGame);
    el.auto.addEventListener('click', function () { if (S.round >= 10) newGame(); S.auto = 10 - S.round; });
    el.pbox.addEventListener('click', function (e) { var b = e.target.closest('button[data-d]'); if (!b) return; var j = +b.closest('[data-who]').dataset.who; S.pts[j] = clamp(S.pts[j] + (+b.dataset.d), 0, 5); sync(); });
    W.addEventListener('resize', render);
    refCurves(); newGame();
    W.__gt2p = { S: S, contribute: contribute, settle: settle };
  })();
})(window, document);
