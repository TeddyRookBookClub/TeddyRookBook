/* Game Theory, Chapter 7: Repeated Games and Cooperation. Two interactives:
   1. (main, with missions) an Axelrod-style round-robin tournament of the repeated prisoner's dilemma with classic
      strategies and one you design; noise; an evolutionary run where successful strategies grow; and single matches;
   2. the discount factor: when grim trigger can hold cooperation together, δ ≥ (T − R)/(T − P).
   Models: model.js (window.GT7M), tested in node. Shared look: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT7M, root = D.getElementById('gt7-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;
  var MS = L.missions($('gt7-missions'), 'gt7', [
    { id: 'run', title: 'Hold a tournament', goal: 'Run a round-robin tournament: every strategy plays every other, and itself, for 200 rounds.' },
    { id: 'yours', title: 'Beat the classics', goal: 'Design your own strategy and get it to the top of the table (a tie for first, within 0.03 points, counts).' },
    { id: 'echo', title: 'The echo', goal: 'With noise at 3% or more, watch Tit for tat play itself. One mistake sets off a long run of retaliation.' },
    { id: 'evolve', title: 'Survival of the nicest', goal: 'Run the evolution from equal shares and watch Always defect fall below 1%.' },
    { id: 'invade', title: 'Invasion of the reciprocators', goal: 'Start the evolution in a hostile world, 90% Always defect, and watch cooperation take over.' },
    { id: 'short', title: 'No shadow of the future', goal: 'Make the end uncertain with a continuation chance of 0.5 or less. Who wins the tournament now?' },
    { id: 'delta', title: 'Find the threshold', goal: 'In the discount-factor lab, set δ within 0.01 of the smallest value at which grim trigger sustains cooperation.' }
  ]);
  function done(id, msg, view) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }

  /* =====================================================================================
     1. THE TOURNAMENT
     ===================================================================================== */
  (function () {
    var view = $('gt7-view'), cv = $('gt7-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(Date.now() % 777777 + 1);
    var el = { tab: $('gt7-tab'), line: $('gt7-line'), first: $('gt7-first'), after: $('gt7-after'), grudge: $('gt7-grudge'), noise: $('gt7-noise'), noiseO: $('gt7-noise-o'), len: $('gt7-len'), w: $('gt7-w'), wO: $('gt7-w-o'), wbox: $('gt7-wbox'),
      start: $('gt7-start'), sbox: $('gt7-sbox'), mbox: $('gt7-mbox'), ma: $('gt7-ma'), mb: $('gt7-mb'), go: $('gt7-go'), go2: $('gt7-go2'), read: $('gt7-read'), msg: $('gt7-msg') };
    var S = { tab: 'tour', line: ['allc', 'alld', 'tft', 'grim', 'wsls', 'gtft', 'tf2t', 'rand'], rule: JSON.parse(JSON.stringify(M.DEFAULT_RULE)), noise: 0, len: 'fixed', w: 0.99, start: 'equal',
      T: null, reveal: 0, evo: null, evoT: 0, match: null, matchT: 0, ma: 'tft', mb: 'tft' };
    function opts() { return { rounds: S.len === 'fixed' ? 200 : 0, w: S.w, noise: S.noise, rule: S.rule, maxRounds: 3000 }; }
    function lineup() { return M.ORDER.filter(function (k) { return S.line.indexOf(k) >= 0; }); }
    function runTour(silent) {
      var list = lineup(); if (list.length < 2) { L.toast(view, 'Pick at least two strategies.'); return; }
      var reps = S.len === 'fixed' ? (S.noise > 0 ? 6 : 3) : (S.w > 0.85 ? 40 : 200); // more matches when they are short and noisy
      S.T = M.tournament(list, opts(), rng, reps); S.reveal = reduced ? 1 : 0; S.tab = 'tour';
      var rk = ranking(S.T), top = rk[0];
      el.msg.textContent = 'Tournament done. First: ' + M.STRATS[top.k].name + ' with ' + fmt(top.s, 2) + ' points a round.';
      if (silent) { el.msg.textContent = 'A first tournament has been played for you. Change the lineup, design your own strategy, and press Run.'; sync(); return; }
      done('run', 'Every strategy has played every other.', view);
      var best = rk[0].s; if (list.indexOf('yours') >= 0 && best - rk.filter(function (x) { return x.k === 'yours'; })[0].s < 0.03) done('yours', 'Your strategy is at the top of the table.', view); // a near tie counts: matches against Random are luck
      if (S.len === 'uncertain' && S.w <= 0.5 && top.k === 'alld') done('short', 'With no future to protect, Always defect wins.', view);
      sync();
    }
    function ranking(T) { return T.list.map(function (k, i) { return { k: k, s: T.score[i] }; }).sort(function (a, b) { return b.s - a.s; }); }
    function runEvo() {
      if (!S.T || S.T.list.join() !== lineup().join()) { var list = lineup(); if (list.length < 2) return; S.T = M.tournament(list, opts(), rng, S.noise > 0 ? 6 : 3); S.reveal = 1; }
      var n = S.T.list.length, ia = S.T.list.indexOf('alld');
      var x0 = S.T.list.map(function (k) { return S.start === 'hostile' && ia >= 0 ? (k === 'alld' ? 0.9 : 0.1 / (n - 1)) : 1 / n; });
      S.evo = M.evolve(S.T.S, x0, 200); S.evoT = reduced ? 1 : 0; S.tab = 'evo';
      var last = S.evo[S.evo.length - 1], win = 0; last.forEach(function (v, i) { if (v > last[win]) win = i; });
      el.msg.textContent = 'After 200 generations the largest share is ' + M.STRATS[S.T.list[win]].name + ' (' + Math.round(last[win] * 100) + '%).';
      if (S.start === 'equal' && ia >= 0 && last[ia] < 0.01) done('evolve', 'Always defect dies out once its victims are gone.', view);
      if (S.start === 'hostile' && ia >= 0 && last[ia] < 0.5) done('invade', 'A small cluster of reciprocators took over a world of defectors.', view);
      sync();
    }
    function runMatch() {
      var o = opts(); o.maxRounds = 120; if (S.len === 'fixed') o.rounds = 120;
      S.match = M.match(S.ma, S.mb, o, rng); S.matchT = reduced ? 1 : 0; S.tab = 'match';
      el.msg.textContent = M.STRATS[S.ma].name + ' scored ' + S.match.sa + ', ' + M.STRATS[S.mb].name + ' scored ' + S.match.sb + ' over ' + S.match.n + ' rounds.';
      if (S.ma === 'tft' && S.mb === 'tft' && S.noise >= 0.03) done('echo', 'One slip, and two Tit for tats punish each other back and forth.', view);
      sync();
    }
    function run() { if (S.tab === 'tour') runTour(); else if (S.tab === 'evo') runEvo(); else runMatch(); }
    function sync() {
      GT.seg(el.tab, 'data-t', S.tab); el.sbox.hidden = S.tab !== 'evo'; el.mbox.hidden = S.tab !== 'match';
      el.line.querySelectorAll('button[data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(S.line.indexOf(b.dataset.k) >= 0)); });
      GT.seg(el.first, 'data-v', S.rule.first); el.after.querySelectorAll('[data-i]').forEach(function (g) { GT.seg(g, 'data-v', S.rule.after[+g.dataset.i]); }); el.grudge.checked = S.rule.grudge;
      el.noise.value = S.noise * 100; el.noiseO.textContent = Math.round(S.noise * 100) + '%'; GT.seg(el.len, 'data-l', S.len); el.wbox.hidden = S.len !== 'uncertain'; el.w.value = S.w; el.wO.textContent = fmt(S.w, 2) + ' (about ' + Math.round(1 / (1 - S.w)) + ' rounds)';
      GT.seg(el.start, 'data-s', S.start); el.ma.value = S.ma; el.mb.value = S.mb;
      var label = S.tab === 'tour' ? '▶ Run the tournament' : S.tab === 'evo' ? '▶ Run the evolution' : '▶ Play the match'; el.go.textContent = label; if (el.go2) el.go2.textContent = '▶ Run';
      var rows = [];
      if (S.T) { var rk = ranking(S.T); rows.push(['Winner', M.STRATS[rk[0].k].short + ' · ' + fmt(rk[0].s, 2)]); var yi = rk.findIndex(function (x) { return x.k === 'yours'; }); if (yi >= 0) rows.push(['Your strategy', 'rank ' + (yi + 1) + ' of ' + rk.length]); var ti = rk.findIndex(function (x) { return x.k === 'tft'; }); if (ti >= 0) rows.push(['Tit for tat', 'rank ' + (ti + 1)]); }
      rows.push(['Payoffs T · R · P · S', '5 · 3 · 1 · 0']);
      el.read.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      render();
    }
    // ---------- drawing ----------
    function heat(v) { // 0..5 → red to gold to green
      var t = clamp(v / 5, 0, 1), a = [255, 135, 135], b = [255, 212, 121], g = [99, 230, 190], c1, c2, u;
      if (t < 0.5) { c1 = a; c2 = b; u = t / 0.5; } else { c1 = b; c2 = g; u = (t - 0.5) / 0.5; }
      return 'rgb(' + c1.map(function (x, i) { return Math.round(x + (c2[i] - x) * u); }).join(',') + ')';
    }
    function render() {
      var w = K.w, h = K.h, narrow = w < 600; dr.bg(c, w, h);
      if (S.tab === 'tour') drawTour(w, h, narrow); else if (S.tab === 'evo') drawEvo(w, h, narrow); else drawMatch(w, h, narrow);
    }
    function drawTour(w, h, narrow) {
      if (!S.T) { dr.label(c, 'Choose the lineup, then press Run.', w / 2, h / 2 - 10, C.ink, { size: 15, align: 'center' }); dr.label(c, 'Every strategy plays every other, and itself.', w / 2, h / 2 + 14, C.muted, { size: 13, align: 'center' }); return; }
      var T = S.T, n = T.list.length, hw = narrow ? w - 24 : Math.min(w * 0.56, h - 70), cell = (hw - 56) / n, hx = 12 + 56, hy = 70, rev = Math.floor(S.reveal * n * n + 0.0001);
      dr.label(c, narrow ? 'Points per round, row vs column' : 'Average points per round: row against column', 12, 18, C.muted, { size: 11, bold: true });
      for (var i = 0; i < n; i++) {
        dr.label(c, M.STRATS[T.list[i]].short, hx - 6, hy + cell * (i + 0.5), M.STRATS[T.list[i]].col, { size: 10.5, bold: true, align: 'right' });
        c.save(); c.translate(hx + cell * (i + 0.5), hy - 6); c.rotate(-Math.PI / 4); dr.label(c, M.STRATS[T.list[i]].short, 0, 0, M.STRATS[T.list[i]].col, { size: 10, bold: true }); c.restore();
        for (var j = 0; j < n; j++) {
          var k = i * n + j, x = hx + cell * j, y = hy + cell * i;
          if (k < rev) { c.fillStyle = heat(T.S[i][j]); c.globalAlpha = 0.85; dr.rrect(c, x + 1, y + 1, cell - 2, cell - 2, 3); c.fill(); c.globalAlpha = 1; if (cell > 26) dr.label(c, fmt(T.S[i][j], 1), x + cell / 2, y + cell / 2, '#06111a', { size: Math.min(11, cell / 3), bold: true, align: 'center', plain: true }); }
          else { c.fillStyle = 'rgba(255,255,255,.04)'; dr.rrect(c, x + 1, y + 1, cell - 2, cell - 2, 3); c.fill(); }
        }
      }
      // ranking
      var rk = ranking(T), rx = narrow ? 12 : 12 + hw + 24, ry = narrow ? hy + cell * n + 24 : 70, rw = narrow ? w - 24 : w - rx - 12, rh = narrow ? h - ry - 8 : h - ry - 12, bh = Math.min(26, (rh - 26) / n);
      dr.label(c, 'Average score per round', rx, ry - 14 + (narrow ? 4 : 0), C.muted, { size: 11, bold: true });
      var top = rk[0].s, lo = Math.min(1.5, rk[rk.length - 1].s - 0.2);
      rk.forEach(function (e, q) {
        var y = ry + q * bh + 4, S0 = M.STRATS[e.k], ww = (rw - 120) * clamp((e.s - lo) / (Math.max(3, top) - lo), 0, 1) * Math.min(1, S.reveal * 1.2);
        dr.label(c, (q + 1) + '. ' + S0.short, rx, y + bh / 2 - 2, S0.col, { size: 11.5, bold: true });
        c.fillStyle = S0.col; c.globalAlpha = 0.85; dr.rrect(c, rx + 74, y + 2, Math.max(2, ww), bh - 8, 4); c.fill(); c.globalAlpha = 1;
        dr.label(c, fmt(e.s, 2), rx + 80 + ww, y + bh / 2 - 2, C.ink, { size: 11, bold: true });
      });
    }
    function drawEvo(w, h, narrow) {
      if (!S.evo) { dr.label(c, 'Press Run to let the population evolve.', w / 2, h / 2, C.ink, { size: 15, align: 'center' }); return; }
      var T = S.T, n = T.list.length, G = S.evo.length - 1, shown = Math.max(1, Math.floor(S.evoT * G)), x0 = 46, x1 = w - (narrow ? 14 : 150), y0 = 30, y1 = h - (narrow ? 96 : 36);
      dr.label(c, 'Share of the population, generation by generation', 12, 14, C.muted, { size: 11, bold: true });
      var X = function (g) { return x0 + (x1 - x0) * g / G; }, Y = function (v) { return y1 - (y1 - y0) * v; };
      [0, 0.5, 1].forEach(function (v) { dr.label(c, Math.round(v * 100) + '%', x0 - 6, Y(v), C.muted, { size: 10, align: 'right' }); });
      [0, 50, 100, 150, 200].forEach(function (g) { dr.label(c, String(g), X(g), y1 + 12, C.muted, { size: 10, align: 'center' }); });
      for (var i = n - 1; i >= 0; i--) {
        c.fillStyle = M.STRATS[T.list[i]].col; c.globalAlpha = 0.85; c.beginPath();
        for (var g = 0; g <= shown; g++) { var cum = 0; for (var k = 0; k <= i; k++) cum += S.evo[g][k]; if (g) c.lineTo(X(g), Y(cum)); else c.moveTo(X(g), Y(cum)); }
        for (g = shown; g >= 0; g--) { var cum2 = 0; for (k = 0; k < i; k++) cum2 += S.evo[g][k]; c.lineTo(X(g), Y(cum2)); }
        c.closePath(); c.fill(); c.globalAlpha = 1;
      }
      var last = S.evo[shown];
      var lx = narrow ? 14 : x1 + 12, ly = narrow ? y1 + 30 : y0;
      T.list.forEach(function (k, i) {
        var xx = narrow ? lx + (i % 3) * ((w - 28) / 3) : lx, yy = narrow ? ly + Math.floor(i / 3) * 18 : ly + i * 20;
        c.fillStyle = M.STRATS[k].col; c.fillRect(xx, yy - 5, 10, 10); dr.label(c, M.STRATS[k].short + ' ' + Math.round(last[i] * 100) + '%', xx + 14, yy, C.ink, { size: 11 });
      });
    }
    function drawMatch(w, h, narrow) {
      if (!S.match) { dr.label(c, 'Pick two strategies and press Run.', w / 2, h / 2, C.ink, { size: 15, align: 'center' }); return; }
      var m = S.match, n = m.n, shown = Math.max(1, Math.floor(S.matchT * n)), per = narrow ? 20 : 30, tile = Math.min(24, (w - 40) / per), rows = Math.ceil(n / per), blockH = tile * 2 + 18;
      dr.label(c, M.STRATS[S.ma].name + ' (top) against ' + M.STRATS[S.mb].name + ' (bottom)', 12, 16, C.muted, { size: 11.5, bold: true });
      dr.label(c, 'green = cooperate, red = defect' + (S.noise ? ' · noise ' + Math.round(S.noise * 100) + '%' : ''), 12, 34, C.muted, { size: 10.5 });
      for (var t = 0; t < shown; t++) {
        var rr = Math.floor(t / per), cc = t % per, x = 20 + cc * tile, y = 52 + rr * blockH;
        if (y + blockH > h - 30) break;
        c.fillStyle = m.a[t] ? C.red : C.green; dr.rrect(c, x + 1, y, tile - 2, tile - 2, 3); c.fill();
        c.fillStyle = m.b[t] ? C.red : C.green; dr.rrect(c, x + 1, y + tile, tile - 2, tile - 2, 3); c.fill();
        if (cc === 0) dr.label(c, String(t + 1), 16, y + tile, C.muted, { size: 9, align: 'right' });
      }
      var sa = 0, sb = 0; for (t = 0; t < shown; t++) { sa += M.payoff(m.a[t], m.b[t]); sb += M.payoff(m.b[t], m.a[t]); }
      dr.label(c, M.STRATS[S.ma].short + ' ' + sa + '  ·  ' + M.STRATS[S.mb].short + ' ' + sb + '  after ' + shown + ' rounds', 12, h - 14, C.gold, { size: 12.5, bold: true });
    }
    L.loop(function (dt) {
      var busy = false;
      if (S.tab === 'tour' && S.reveal < 1) { S.reveal = Math.min(1, S.reveal + dt / 1.6); busy = true; }
      if (S.tab === 'evo' && S.evoT < 1) { S.evoT = Math.min(1, S.evoT + dt / 2.4); busy = true; }
      if (S.tab === 'match' && S.matchT < 1) { S.matchT = Math.min(1, S.matchT + dt / 2.2); busy = true; }
      if (busy) render();
    }, cv);
    // ---------- controls ----------
    el.tab.addEventListener('click', function (e) { var b = e.target.closest('button[data-t]'); if (b) { S.tab = b.dataset.t; sync(); } });
    el.line.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; var k = b.dataset.k, i = S.line.indexOf(k); if (i >= 0) S.line.splice(i, 1); else S.line.push(k); sync(); });
    el.first.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) { S.rule.first = +b.dataset.v; if (S.line.indexOf('yours') < 0) S.line.push('yours'); sync(); } });
    el.after.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'), g = e.target.closest('[data-i]'); if (b && g) { S.rule.after[+g.dataset.i] = +b.dataset.v; if (S.line.indexOf('yours') < 0) S.line.push('yours'); sync(); } });
    el.grudge.addEventListener('change', function () { S.rule.grudge = el.grudge.checked; if (S.line.indexOf('yours') < 0) S.line.push('yours'); sync(); });
    el.noise.addEventListener('input', function () { S.noise = +el.noise.value / 100; sync(); });
    el.len.addEventListener('click', function (e) { var b = e.target.closest('button[data-l]'); if (b) { S.len = b.dataset.l; sync(); } });
    el.w.addEventListener('input', function () { S.w = +el.w.value; sync(); });
    el.start.addEventListener('click', function (e) { var b = e.target.closest('button[data-s]'); if (b) { S.start = b.dataset.s; if (S.start === 'hostile' && S.line.indexOf('alld') < 0) S.line.push('alld'); sync(); } });
    el.ma.addEventListener('change', function () { S.ma = el.ma.value; }); el.mb.addEventListener('change', function () { S.mb = el.mb.value; });
    el.go.addEventListener('click', run); if (el.go2) el.go2.addEventListener('click', run);
    cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
    W.addEventListener('resize', render); L.onTheme(render);
    runTour(true);
    W.__gt7 = { S: S, run: run, sync: sync };
  })();

  /* =====================================================================================
     2. THE DISCOUNT FACTOR
     ===================================================================================== */
  (function () {
    var view = $('gt7d-view'), cv = $('gt7d-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c;
    var el = { T: $('gt7d-T'), TO: $('gt7d-T-o'), R: $('gt7d-R'), RO: $('gt7d-R-o'), P: $('gt7d-P'), PO: $('gt7d-P-o'), d: $('gt7d-d'), dO: $('gt7d-d-o'), read: $('gt7d-read') };
    var S = { P: { T: 5, R: 3, P: 1, S: 0 }, d: 0.8, drag: false, user: false };
    function sync() {
      var P = S.P; if (P.R >= P.T) P.R = P.T - 0.5; if (P.P >= P.R) P.P = P.R - 0.5;
      el.T.value = P.T; el.TO.textContent = fmt(P.T, 1); el.R.value = P.R; el.RO.textContent = fmt(P.R, 1); el.P.value = P.P; el.PO.textContent = fmt(P.P, 1); el.d.value = S.d; el.dO.textContent = fmt(S.d, 2);
      var ds = M.threshold(P), cvv = M.coopValue(P, S.d), dv = M.devValue(P, S.d);
      el.read.innerHTML = '<dt>Threshold δ*</dt><dd>' + fmt(ds, 3) + '</dd><dt>Value of cooperating</dt><dd>' + fmt(cvv, 2) + '</dd><dt>Value of defecting once</dt><dd>' + fmt(dv, 2) + '</dd><dt>Verdict</dt><dd>' + (cvv >= dv - 1e-9 ? 'cooperation holds' : 'defecting pays') + '</dd>';
      if (S.user && Math.abs(S.d - ds) <= 0.01) done('delta', 'At δ* = ' + fmt(ds, 2) + ' a grim partner makes cheating exactly not worth it.', view);
      S.user = false; render();
    }
    var G = {};
    function render() {
      var w = K.w, h = K.h, narrow = w < 600, P = S.P; dr.bg(c, w, h);
      // left: the payoff streams
      var lw = narrow ? w - 24 : w * 0.5 - 18, lh = narrow ? h * 0.5 - 18 : h - 24, lx = 12, ly = 12;
      dr.panel(c, lx, ly, lw, lh, 'Payoff per round, discounted by δ each round');
      var N = 16, x0 = lx + 34, x1 = lx + lw - 12, y0 = ly + 46, y1 = ly + lh - 26, bw = (x1 - x0) / N, top = P.T * 1.05;
      var Y = function (v) { return y1 - (y1 - y0) * v / top; };
      [0, Math.round(P.T)].forEach(function (v) { dr.label(c, String(v), x0 - 6, Y(v), C.muted, { size: 10, align: 'right' }); });
      var cum1 = 0, cum2 = 0;
      for (var t = 0; t < N; t++) {
        var f = Math.pow(S.d, t), a = P.R * f, b = (t === 0 ? P.T : P.P) * f; cum1 += a; cum2 += b;
        c.fillStyle = C.green; c.globalAlpha = 0.85; c.fillRect(x0 + t * bw + 1, Y(a), bw / 2 - 1.5, y1 - Y(a)); c.fillStyle = C.red; c.fillRect(x0 + t * bw + bw / 2, Y(b), bw / 2 - 1.5, y1 - Y(b)); c.globalAlpha = 1;
        if (t % 5 === 0) dr.label(c, String(t), x0 + t * bw + bw / 2, y1 + 11, C.muted, { size: 10, align: 'center' });
      }
      dr.label(c, '■ cooperate forever', lx + 12, ly + 30, C.green, { size: 11, bold: true });
      dr.label(c, '■ defect once, then punished', lx + 140, ly + 30, C.red, { size: 11, bold: true });
      // right: average discounted payoffs vs δ
      var rx = narrow ? 12 : w * 0.5 + 6, ry = narrow ? ly + lh + 12 : 12, rw = narrow ? w - 24 : w * 0.5 - 18, rh = narrow ? h - ry - 12 : h - 24;
      dr.panel(c, rx, ry, rw, rh, 'Average payoff per round, as δ varies');
      var a0 = rx + 34, a1 = rx + rw - 14, b0 = ry + 30, b1 = ry + rh - 26, Xd = function (d) { return a0 + (a1 - a0) * d; }, Yd = function (v) { return b1 - (b1 - b0) * (v - P.P * 0.8) / (P.T * 1.05 - P.P * 0.8); };
      G = { a0: a0, a1: a1, b0: b0, b1: b1 };
      [0, 0.5, 1].forEach(function (d) { dr.label(c, String(d), Xd(d), b1 + 11, C.muted, { size: 10, align: 'center' }); });
      [P.P, P.R, P.T].forEach(function (v) { dr.label(c, fmt(v, 1), a0 - 6, Yd(v), C.muted, { size: 10, align: 'right' }); });
      c.strokeStyle = C.green; c.lineWidth = 2.5; c.beginPath(); c.moveTo(Xd(0), Yd(P.R)); c.lineTo(Xd(1), Yd(P.R)); c.stroke();
      c.strokeStyle = C.red; c.lineWidth = 2.5; c.beginPath(); c.moveTo(Xd(0), Yd(P.T)); c.lineTo(Xd(1), Yd(P.P)); c.stroke();
      dr.label(c, 'cooperate: R', Xd(0.02), Yd(P.R) - 10, C.green, { size: 10.5, bold: true });
      dr.label(c, 'defect: (1 − δ)T + δP', Xd(0.04), Yd(P.T) + 12, C.red, { size: 10.5, bold: true });
      var ds = M.threshold(P);
      c.save(); c.strokeStyle = C.gold; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(Xd(ds), b0); c.lineTo(Xd(ds), b1); c.stroke(); c.restore();
      dr.label(c, 'δ* = ' + fmt(ds, 2), Xd(ds) + 4, b0 + 8, C.gold, { size: 11, bold: true });
      c.save(); c.globalAlpha = 0.08; c.fillStyle = C.green; c.fillRect(Xd(ds), b0, Xd(1) - Xd(ds), b1 - b0); c.restore();
      dr.label(c, 'cooperation sustainable', (Xd(ds) + Xd(1)) / 2, b1 - 12, C.green, { size: 10.5, align: 'center' });
      c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.moveTo(Xd(S.d), b0 + 14); c.lineTo(Xd(S.d), b1); c.stroke();
      c.fillStyle = C.pink; c.beginPath(); c.arc(Xd(S.d), Yd(P.R), 5, 0, 7); c.fill(); c.beginPath(); c.arc(Xd(S.d), Yd((1 - S.d) * P.T + S.d * P.P), 5, 0, 7); c.fill();
    }
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) { var p = ptr(e); if (p.x < G.a0 - 6 || p.x > G.a1 + 6 || p.y < G.b0 || p.y > G.b1 + 10) return; S.drag = true; S.d = Math.round(clamp((p.x - G.a0) / (G.a1 - G.a0), 0, 0.99) * 100) / 100; S.user = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { } sync(); });
    cv.addEventListener('pointermove', function (e) { if (!S.drag) return; var p = ptr(e); S.d = Math.round(clamp((p.x - G.a0) / (G.a1 - G.a0), 0, 0.99) * 100) / 100; S.user = true; sync(); });
    cv.addEventListener('pointerup', function () { S.drag = false; });
    ['T', 'R', 'P'].forEach(function (k) { el[k].addEventListener('input', function () { S.P[k] = +el[k].value; sync(); }); });
    el.d.addEventListener('input', function () { S.d = +el.d.value; S.user = true; sync(); });
    W.addEventListener('resize', render);
    sync();
  })();
})(window, document);
