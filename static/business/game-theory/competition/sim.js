/* Game Theory, Chapter 5: Competition. Three interactives:
   1. (main, with missions) Cournot duopoly: best-response curves, firms adjusting step by step to the equilibrium,
      and how output, price and profit compare with monopoly, perfect competition and n firms;
   2. Bertrand price competition: undercutting to marginal cost, capacity limits, differentiated products;
   3. Hotelling's beach: sellers (or candidates) choosing locations, and the median voter.
   Models: model.js (window.GT5M), tested in node. Shared look: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT5M, root = D.getElementById('gt5-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;
  var MS = L.missions($('gt5-missions'), 'gt5', [
    { id: 'adjust', title: 'Settle down', goal: 'Drag the pink point anywhere and press Adjust: the firms take turns best responding until they reach the equilibrium.' },
    { id: 'blind', title: 'Find it blind', goal: 'Hide the curves, then drag the point to within 1 unit of the equilibrium using only the “gain from deviating” readouts.' },
    { id: 'collude', title: 'Form a cartel', goal: 'Put both firms at half the monopoly output (press the button or drag). Compare their profits with the equilibrium.' },
    { id: 'cheat', title: 'Cheat on the cartel', goal: 'From the cartel point, move firm 1 to its best response. Its profit jumps; the cartel is not an equilibrium.' },
    { id: 'cost', title: 'Cost advantage', goal: 'Change the costs so that firm 1 makes at least 60% of the equilibrium output.' },
    { id: 'many', title: 'Crowded market', goal: 'Raise the number of firms until the price is within $10 of marginal cost.' },
    { id: 'war', title: 'Price war', goal: 'In the Bertrand lab with identical products, run the price war down to marginal cost.' },
    { id: 'median', title: 'Meet in the middle', goal: 'In Hotelling’s beach, get both sellers to the median customer.' }
  ]);

  /* =====================================================================================
     1. COURNOT
     ===================================================================================== */
  (function () {
    var view = $('gt5-view'), cv = $('gt5-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c;
    var el = { a: $('gt5-a'), aO: $('gt5-a-o'), c1: $('gt5-c1'), c1O: $('gt5-c1-o'), c2: $('gt5-c2'), c2O: $('gt5-c2-o'), n: $('gt5-n'), nO: $('gt5-n-o'), mode: $('gt5-mode'),
      go: $('gt5-go'), step: $('gt5-step'), cartel: $('gt5-cartel'), iso: $('gt5-iso'), hide: $('gt5-hide'), read: $('gt5-read'), reset: $('gt5-reset'), go2: $('gt5-go2') };
    var S = { P: { a: 100, b: 1, c1: 10, c2: 10 }, n: 2, mode: 'alt', q: { q1: 70, q2: 8 }, path: [], running: false, k: 0, acc: 0, iso: false, hide: false, drag: false, cartelAt: null };
    function eq() { return M.cournot(S.P); }
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }
    function gains() { var P = S.P, b1 = M.br(P, S.q.q2, P.c1), b2 = M.br(P, S.q.q1, P.c2); return { g1: M.profit(P, b1, S.q.q2, P.c1) - M.profit(P, S.q.q1, S.q.q2, P.c1), g2: M.profit(P, b2, S.q.q1, P.c2) - M.profit(P, S.q.q2, S.q.q1, P.c2), b1: b1, b2: b2 }; }
    function checks() {
      var e = eq(), P = S.P, d = Math.hypot(S.q.q1 - e.q1, S.q.q2 - e.q2);
      if (S.hide && !S.running && d <= 1) done('blind', 'Found without the curves: neither firm can gain by changing.');
      var sym = P.c1 === P.c2, half = M.monopoly(P, P.c1).Q / 2;
      if (sym && Math.abs(S.q.q1 - half) <= 1 && Math.abs(S.q.q2 - half) <= 1) { S.cartelAt = half; done('collude', 'The cartel: more profit for both than the equilibrium.'); }
      if (sym && S.cartelAt !== null && Math.abs(S.q.q2 - half) <= 1 && Math.abs(S.q.q1 - M.br(P, half, P.c1)) <= 1) done('cheat', 'Firm 1 cheats and earns more. So would firm 2.');
      if (e.q1 / Math.max(1e-9, e.q1 + e.q2) >= 0.6 - 1e-9) done('cost', 'Lower costs, bigger share: ' + Math.round(100 * e.q1 / (e.q1 + e.q2)) + '%.');
      var cn = M.cournotN(P, P.c1, S.n); if (P.c1 === P.c2 && cn.p - P.c1 <= 10 + 1e-9) done('many', 'With ' + S.n + ' firms the price is $' + fmt(cn.p, 2) + ', close to cost.');
    }
    function sync() {
      var P = S.P; el.a.value = P.a; el.aO.textContent = P.a; el.c1.value = P.c1; el.c1O.textContent = '$' + P.c1; el.c2.value = P.c2; el.c2O.textContent = '$' + P.c2; el.n.value = S.n; el.nO.textContent = S.n;
      GT.seg(el.mode, 'data-m', S.mode); el.iso.checked = S.iso; el.hide.checked = S.hide;
      el.go.textContent = S.running ? '❚❚ Pause' : '▶ Adjust'; if (el.go2) el.go2.textContent = S.running ? '❚❚' : '▶ Adjust';
      var pr = M.price(P, S.q.q1 + S.q.q2), g = gains(), e = eq();
      el.read.innerHTML = '<dt>Outputs q₁ · q₂</dt><dd>' + fmt(S.q.q1, 1) + ' · ' + fmt(S.q.q2, 1) + '</dd><dt>Price</dt><dd>$' + fmt(pr, 2) + '</dd><dt>Profits π₁ · π₂</dt><dd>' + fmt(M.profit(P, S.q.q1, S.q.q2, P.c1), 0) + ' · ' + fmt(M.profit(P, S.q.q2, S.q.q1, P.c2), 0) + '</dd>' +
        '<dt>Gain from deviating: firm 1</dt><dd>' + fmt(g.g1, 1) + '</dd><dt>Gain from deviating: firm 2</dt><dd>' + fmt(g.g2, 1) + '</dd>' + (S.hide ? '' : '<dt>Equilibrium</dt><dd>' + fmt(e.q1, 1) + ' · ' + fmt(e.q2, 1) + '</dd>');
      checks(); render();
    }
    var G = {};
    function render() {
      var w = K.w, h = K.h, narrow = w < 600, P = S.P; dr.bg(c, w, h);
      var e = eq(), mono = M.monopoly(P, Math.min(P.c1, P.c2)), Qc = (P.a - Math.min(P.c1, P.c2)) / P.b, qmax = Math.max(10, Qc * 1.02);
      // the plane
      var px = narrow ? 44 : 52, py = 30, pw = narrow ? w - px - 16 : Math.min(w * 0.58, h - 70), ph = narrow ? Math.min(pw, h * 0.55) : pw;
      G = { px: px, py: py, pw: pw, ph: ph, qmax: qmax };
      var X = function (q) { return px + pw * q / qmax; }, Y = function (q) { return py + ph - ph * q / qmax; };
      c.strokeStyle = 'rgba(219,231,239,.12)'; c.lineWidth = 1;
      var step = qmax > 120 ? 20 : 10;
      for (var v = 0; v <= qmax; v += step) { c.beginPath(); c.moveTo(X(v), py); c.lineTo(X(v), py + ph); c.moveTo(px, Y(v)); c.lineTo(px + pw, Y(v)); c.stroke(); dr.label(c, String(v), X(v), py + ph + 12, C.muted, { size: 10, align: 'center' }); dr.label(c, String(v), px - 6, Y(v), C.muted, { size: 10, align: 'right' }); }
      dr.label(c, 'q₁, firm 1’s output →', px + pw, py + ph + 26, C.p1, { size: 11, bold: true, align: 'right' });
      dr.label(c, '↑ q₂, firm 2’s output', px, py - 14, C.p2, { size: 11, bold: true });
      // isoprofit curves of firm 1: π1 = (a − c1 − b(q1+q2)) q1 = k  ⇒  q2 = (a − c1 − b q1 − k/q1)/b
      if (S.iso) {
        var piE = M.profit(P, e.q1, e.q2, P.c1);
        [0.4, 0.7, 1, 1.3, 1.7].forEach(function (f) {
          var kk = piE * f; if (kk <= 0) return; c.save(); c.strokeStyle = f === 1 ? 'rgba(255,212,121,.75)' : 'rgba(255,212,121,.32)'; c.lineWidth = f === 1 ? 1.8 : 1.2; c.setLineDash([4, 4]); c.beginPath(); var started = false;
          for (var q1 = 0.5; q1 <= qmax; q1 += qmax / 300) { var q2 = (P.a - P.c1 - P.b * q1 - kk / q1) / P.b; if (q2 < 0 || q2 > qmax) { started = false; continue; } if (started) c.lineTo(X(q1), Y(q2)); else { c.moveTo(X(q1), Y(q2)); started = true; } }
          c.stroke(); c.restore();
        });
        dr.label(c, 'firm 1’s isoprofit curves', X(e.q1) + 8, Y(Math.max(0, e.q2 * 0.25)), 'rgba(255,212,121,.8)', { size: 10 });
      }
      // best-response curves
      if (!S.hide) {
        c.save(); c.lineWidth = 3; c.strokeStyle = C.p1; c.beginPath(); c.moveTo(X(M.br(P, 0, P.c1)), Y(0)); var q2z = (P.a - P.c1) / P.b; c.lineTo(X(0), Y(Math.min(q2z, qmax))); c.stroke();
        c.strokeStyle = C.p2; c.beginPath(); c.moveTo(X(0), Y(M.br(P, 0, P.c2))); var q1z = (P.a - P.c2) / P.b; c.lineTo(X(Math.min(q1z, qmax)), Y(0)); c.stroke(); c.restore();
        var fitX = function (t, x) { c.save(); c.font = '600 11px ' + GT.FONT; var tw = c.measureText(t).width; c.restore(); return Math.min(x, px + pw - tw - 2); };
        dr.label(c, 'firm 1’s best response', fitX('firm 1’s best response', X(M.br(P, qmax * 0.62, P.c1)) + 8), Y(qmax * 0.62), C.p1, { size: 11, bold: true });
        dr.label(c, 'firm 2’s best response', fitX('firm 2’s best response', X(qmax * 0.55)), Y(M.br(P, qmax * 0.55, P.c2)) - 14, C.p2, { size: 11, bold: true });
        c.fillStyle = C.green; c.beginPath(); c.arc(X(e.q1), Y(e.q2), 6.5, 0, 7); c.fill(); c.strokeStyle = '#06111a'; c.lineWidth = 2; c.stroke();
        dr.label(c, 'Nash (' + fmt(e.q1, 1) + ', ' + fmt(e.q2, 1) + ')', X(e.q1) + 10, Y(e.q2) - 12, C.green, { size: 11.5, bold: true });
      }
      // the cartel point
      if (P.c1 === P.c2) { var hq = mono.Q / 2; c.save(); c.translate(X(hq), Y(hq)); c.rotate(Math.PI / 4); c.fillStyle = 'rgba(219,231,239,.75)'; c.fillRect(-4.5, -4.5, 9, 9); c.restore(); dr.label(c, 'cartel', X(hq) - 8, Y(hq) + 12, C.muted, { size: 10.5, align: 'right' }); }
      // adjustment path
      if (S.path.length > 1) { c.save(); c.strokeStyle = 'rgba(249,168,212,.7)'; c.lineWidth = 1.8; c.beginPath(); S.path.forEach(function (p, k) { if (k) c.lineTo(X(p.q1), Y(p.q2)); else c.moveTo(X(p.q1), Y(p.q2)); }); c.stroke(); c.restore(); S.path.forEach(function (p) { c.fillStyle = 'rgba(249,168,212,.6)'; c.beginPath(); c.arc(X(p.q1), Y(p.q2), 2.5, 0, 7); c.fill(); }); }
      c.save(); c.shadowColor = C.pink; c.shadowBlur = S.drag ? 14 : 6; c.fillStyle = C.pink; c.beginPath(); c.arc(X(S.q.q1), Y(S.q.q2), 8, 0, 7); c.fill(); c.restore();
      // comparison panel
      var bx = narrow ? 12 : px + pw + 26, by = narrow ? py + ph + 40 : py - 6, bw = narrow ? w - 24 : w - bx - 12, bh = narrow ? h - by - 10 : h - by - 12;
      dr.panel(c, bx, by, bw, bh, 'Equal costs $' + Math.min(P.c1, P.c2) + ': who gets what');
      var cc = Math.min(P.c1, P.c2), cn = M.cournotN(P, cc, S.n), co = M.competitive(P, cc);
      var rows = [['Monopoly', mono.p, mono.Q, mono.profit, M.consumerSurplus(P, mono.Q), C.red], ['Cournot, ' + S.n + ' firm' + (S.n > 1 ? 's' : ''), cn.p, cn.Q, cn.profit, M.consumerSurplus(P, cn.Q), C.gold], ['Competition', co.p, co.Q, 0, M.consumerSurplus(P, co.Q), C.green]];
      var metrics = [['Price', 1, function (r) { return '$' + fmt(r[1], 1); }], ['Output', 2, function (r) { return fmt(r[2], 1); }], ['Total profit', 3, function (r) { return fmt(r[3], 0); }], ['Consumer surplus', 4, function (r) { return fmt(r[4], 0); }]];
      var cols = narrow ? 2 : 1, cellW = (bw - 20) / cols, cellH = (bh - 30) / Math.ceil(metrics.length / cols);
      metrics.forEach(function (m, mi) {
        var cx = bx + 10 + (mi % cols) * cellW, cy = by + 26 + Math.floor(mi / cols) * cellH, mxv = Math.max.apply(null, rows.map(function (r) { return r[m[1]]; })) || 1;
        dr.label(c, m[0], cx, cy + 6, C.muted, { size: 10.5, bold: true });
        var barH = Math.min(14, (cellH - 22) / 3 - 4);
        rows.forEach(function (r, ri) {
          var yy = cy + 16 + ri * (barH + 4), lw = narrow ? 0 : 88, x0 = cx + lw, ww = cellW - lw - 56;
          if (!narrow) dr.label(c, r[0], cx, yy + barH / 2, C.ink, { size: 10.5 });
          c.fillStyle = 'rgba(255,255,255,.06)'; dr.rrect(c, x0, yy, ww, barH, 4); c.fill();
          c.fillStyle = r[5]; dr.rrect(c, x0, yy, Math.max(2, ww * r[m[1]] / mxv), barH, 4); c.fill();
          dr.label(c, m[2](r), x0 + ww + 6, yy + barH / 2, C.ink, { size: 10.5, bold: true });
        });
      });
      if (narrow) { var lx = bx + 10; rows.forEach(function (r) { c.fillStyle = r[5]; c.fillRect(lx, by + bh - 12, 10, 6); var tw = dr.label(c, r[0], lx + 14, by + bh - 9, C.muted, { size: 10 }); lx += tw + 26; }); }
    }
    function stepOnce() { S.q = M.adjust(S.P, S.q, S.mode, S.k); S.k++; S.path.push({ q1: S.q.q1, q2: S.q.q2 }); if (S.path.length > 60) S.path.shift(); var e = eq(); if (Math.hypot(S.q.q1 - e.q1, S.q.q2 - e.q2) < 0.05) { S.running = false; if (S.path.length > 2) done('adjust', 'Best responses meet at the Nash equilibrium.'); } sync(); }
    L.loop(function (dt) { if (!S.running) return; S.acc += dt; if (S.acc > (reduced ? 0.05 : 0.45)) { S.acc = 0; stepOnce(); } }, cv);
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function toQ(p) { return { q1: clamp((p.x - G.px) / G.pw * G.qmax, 0, G.qmax), q2: clamp((G.py + G.ph - p.y) / G.ph * G.qmax, 0, G.qmax) }; }
    cv.addEventListener('pointerdown', function (e) { var p = ptr(e); if (p.x < G.px - 10 || p.x > G.px + G.pw + 10 || p.y < G.py - 10 || p.y > G.py + G.ph + 10) return; S.drag = true; S.running = false; S.q = toQ(p); S.path = [{ q1: S.q.q1, q2: S.q.q2 }]; S.k = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) { } sync(); });
    cv.addEventListener('pointermove', function (e) { if (!S.drag) return; S.q = toQ(ptr(e)); S.path = [{ q1: S.q.q1, q2: S.q.q2 }]; sync(); });
    cv.addEventListener('pointerup', function () { S.drag = false; sync(); });
    cv.addEventListener('keydown', function (e) {
      var d = e.shiftKey ? 5 : 1, k = e.key;
      if (k === 'ArrowRight') S.q.q1 = clamp(S.q.q1 + d, 0, G.qmax); else if (k === 'ArrowLeft') S.q.q1 = clamp(S.q.q1 - d, 0, G.qmax); else if (k === 'ArrowUp') S.q.q2 = clamp(S.q.q2 + d, 0, G.qmax); else if (k === 'ArrowDown') S.q.q2 = clamp(S.q.q2 - d, 0, G.qmax);
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); S.running = !S.running; sync(); return; } else if (k === 's' || k === 'S') { stepOnce(); return; } else return;
      e.preventDefault(); S.path = [{ q1: S.q.q1, q2: S.q.q2 }]; S.k = 0; sync();
    });
    function setP(k, v) { S.P[k] = v; S.path = [{ q1: S.q.q1, q2: S.q.q2 }]; S.k = 0; S.cartelAt = null; sync(); }
    el.a.addEventListener('input', function () { setP('a', +el.a.value); });
    el.c1.addEventListener('input', function () { setP('c1', +el.c1.value); });
    el.c2.addEventListener('input', function () { setP('c2', +el.c2.value); });
    el.n.addEventListener('input', function () { S.n = +el.n.value; sync(); });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) { S.mode = b.dataset.m; sync(); } });
    function toggle() { if (!S.running) { S.path = [{ q1: S.q.q1, q2: S.q.q2 }]; S.k = 0; } S.running = !S.running; sync(); }
    el.go.addEventListener('click', toggle); if (el.go2) el.go2.addEventListener('click', toggle);
    el.step.addEventListener('click', stepOnce);
    el.cartel.addEventListener('click', function () { var hq = M.monopoly(S.P, S.P.c1).Q / 2; S.P.c2 = S.P.c1; S.q = { q1: hq, q2: hq }; S.path = [{ q1: hq, q2: hq }]; S.running = false; sync(); });
    el.iso.addEventListener('change', function () { S.iso = el.iso.checked; sync(); });
    el.hide.addEventListener('change', function () { S.hide = el.hide.checked; sync(); });
    el.reset.addEventListener('click', function () { S.P = { a: 100, b: 1, c1: 10, c2: 10 }; S.q = { q1: 70, q2: 8 }; S.path = []; S.running = false; S.n = 2; S.cartelAt = null; sync(); });
    W.addEventListener('resize', render); L.onTheme(render);
    sync();
    W.__gt5 = { S: S, sync: sync, stepOnce: stepOnce };
  })();

  /* =====================================================================================
     2. BERTRAND
     ===================================================================================== */
  (function () {
    var view = $('gt5b-view'), cv = $('gt5b-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c;
    var el = { kind: $('gt5b-kind'), go: $('gt5b-go'), step: $('gt5b-step'), reset: $('gt5b-reset'), p1: $('gt5b-p1'), p1O: $('gt5b-p1-o'), read: $('gt5b-read'), msg: $('gt5b-msg') };
    var S = { kind: 'same', p1: 55, p2: 55, hist: [], running: false, acc: 0, k: 0 };
    function cap() { return S.kind === 'cap30' ? M.BT.kTight : S.kind === 'cap50' ? M.BT.k : Infinity; }
    function reply(pj) { return S.kind === 'dif' ? Math.round(M.difBR(pj) * 100) / 100 : M.bertrandBR(pj, cap()); }
    function profits(a, b) { if (S.kind === 'dif') return [M.difProfit(a, b), M.difProfit(b, a)]; var s = M.sales(a, b, cap()); return [s.pi1, s.pi2]; }
    function reset() { S.p1 = +el.p1.value; S.p2 = 55; S.hist = [{ p1: S.p1, p2: S.p2 }]; S.k = 0; S.running = false; sync(); }
    function stepOnce() {
      if (S.k % 2 === 0) S.p2 = reply(S.p1); else S.p1 = reply(S.p2);
      S.k++; S.hist.push({ p1: S.p1, p2: S.p2 }); if (S.hist.length > 90) S.hist.shift();
      if (S.kind === 'same' && S.p1 <= M.BT.c + 1 && S.p2 <= M.BT.c + 1) { S.running = false; if (MS.done('war')) L.toast(view, '✓ Two firms are enough to drive the price to cost: the Bertrand paradox.'); }
      if (S.kind === 'dif' && Math.abs(S.p1 - M.difEq()) < 0.01 && Math.abs(S.p2 - M.difEq()) < 0.01) S.running = false;
      if (S.kind === 'cap30' && S.hist.length > 6 && S.hist[S.hist.length - 1].p1 === S.hist[S.hist.length - 3].p1 && S.hist[S.hist.length - 1].p2 === S.hist[S.hist.length - 3].p2) S.running = false;
      sync();
    }
    function sync() {
      GT.seg(el.kind, 'data-k', S.kind); el.p1O.textContent = '$' + el.p1.value; el.go.textContent = S.running ? '❚❚ Pause' : '▶ Run the price war';
      var pr = profits(S.p1, S.p2);
      var note = { same: 'Identical products: the cheaper firm takes the whole market. Each firm’s best reply is to undercut by $1, down to cost.', cap30: 'Each firm can make only 30 units, the Cournot quantity. Undercutting can’t win more customers than 30, so prices stop at about $40, the Cournot price.', cap50: 'Each firm can make 50 units, not enough to serve the whole market at low prices. Undercutting goes on until it pays to jump back up and serve the leftover customers: an Edgeworth cycle.', dif: 'Differentiated products: some customers prefer each firm, so a higher price loses only some of them. Best replies slope upward, and prices settle above cost.' }[S.kind];
      el.msg.textContent = note;
      el.read.innerHTML = '<dt>Prices p₁ · p₂</dt><dd>$' + fmt(S.p1, 2) + ' · $' + fmt(S.p2, 2) + '</dd><dt>Profits π₁ · π₂</dt><dd>' + fmt(pr[0], 0) + ' · ' + fmt(pr[1], 0) + '</dd><dt>Moves</dt><dd>' + S.k + '</dd>' + (S.kind === 'dif' ? '<dt>Equilibrium price</dt><dd>$' + fmt(M.difEq(), 2) + '</dd>' : '<dt>Marginal cost · monopoly price</dt><dd>$10 · $55</dd>');
      render();
    }
    function render() {
      var w = K.w, h = K.h, narrow = w < 560; dr.bg(c, w, h);
      var x0 = narrow ? 44 : 52, x1 = w - 16, y0 = 34, y1 = h - 40, lo = 0, hi = 70;
      var n = Math.max(20, S.hist.length), X = function (k) { return x0 + (x1 - x0) * k / (n - 1); }, Y = function (p) { return y1 - (y1 - y0) * (p - lo) / (hi - lo); };
      dr.label(c, 'Prices, move by move (firms take turns replying)', x0, 16, C.muted, { size: 11, bold: true });
      c.strokeStyle = 'rgba(219,231,239,.12)'; c.lineWidth = 1; for (var v = 0; v <= hi; v += 10) { c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke(); dr.label(c, '$' + v, x0 - 6, Y(v), C.muted, { size: 10, align: 'right' }); }
      function hline(v, col, txt) { c.save(); c.strokeStyle = col; c.setLineDash([6, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke(); c.restore(); dr.label(c, txt, x1 - 4, Y(v) - 9, col, { size: 10.5, bold: true, align: 'right' }); }
      hline(M.BT.c, C.red, 'marginal cost $10'); hline(55, C.muted, 'monopoly price $55');
      if (S.kind === 'dif') hline(M.difEq(), C.green, 'equilibrium $' + fmt(M.difEq(), 2));
      if (S.kind === 'cap30') hline(40, C.green, 'Cournot price $40');
      [['p1', C.p1], ['p2', C.p2]].forEach(function (s, si) {
        c.save(); c.strokeStyle = s[1]; c.lineWidth = 2.5; c.beginPath(); S.hist.forEach(function (e, k) { var y = Y(e[s[0]]) + (si ? 1.5 : -1.5); if (k) { c.lineTo(X(k), Y(S.hist[k - 1][s[0]]) + (si ? 1.5 : -1.5)); c.lineTo(X(k), y); } else c.moveTo(X(k), y); }); c.stroke(); c.restore();
        var last = S.hist[S.hist.length - 1]; c.fillStyle = s[1]; c.beginPath(); c.arc(X(S.hist.length - 1), Y(last[s[0]]), 5, 0, 7); c.fill();
      });
      dr.label(c, 'firm 1', x0 + 6, y1 + 18, C.p1, { size: 11, bold: true }); dr.label(c, 'firm 2', x0 + 60, y1 + 18, C.p2, { size: 11, bold: true });
    }
    L.loop(function (dt) { if (!S.running) return; S.acc += dt; if (S.acc > (reduced ? 0.03 : 0.22)) { S.acc = 0; stepOnce(); } }, cv);
    el.kind.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) { S.kind = b.dataset.k; reset(); } });
    el.go.addEventListener('click', function () { S.running = !S.running; sync(); });
    el.step.addEventListener('click', stepOnce);
    el.reset.addEventListener('click', reset);
    el.p1.addEventListener('input', function () { reset(); });
    W.addEventListener('resize', render);
    reset();
    W.__gt5b = { S: S, stepOnce: stepOnce };
  })();

  /* =====================================================================================
     3. HOTELLING'S BEACH
     ===================================================================================== */
  (function () {
    var view = $('gt5h-view'), cv = $('gt5h-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(99);
    var el = { dist: $('gt5h-dist'), n: $('gt5h-n'), vote: $('gt5h-vote'), go: $('gt5h-go'), reset: $('gt5h-reset'), read: $('gt5h-read') };
    var COLS = [C.p1, C.p2, C.pink];
    var S = { dist: 'uniform', n: 2, vote: false, xs: [0.15, 0.85], w: null, med: 0.5, running: false, acc: 0, k: 0, drag: -1, people: [], moved: 0 };
    function people() { // 160 people placed at quantiles of the density, with a little vertical jitter
      var cum = [], s = 0; S.w.forEach(function (v) { s += v; cum.push(s); }); S.people = [];
      for (var i = 0; i < 160; i++) { var u = (i + 0.5) / 160, j = 0; while (cum[j] < u) j++; S.people.push({ x: (j + 0.5) / S.w.length, y: rng() }); }
    }
    function load() { S.w = M.grid(S.dist, 400); S.med = M.median(S.w); people(); S.xs = S.n === 2 ? [0.15, 0.85] : [0.15, 0.5, 0.85]; S.running = false; S.k = 0; sync(); }
    function stepOnce() { var k = S.k % S.n; S.xs[k] = M.hotBR(S.w, S.xs, k); S.k++; checkMedian(); sync(); }
    function checkMedian() { if (S.n === 2 && Math.abs(S.xs[0] - S.med) <= 0.02 && Math.abs(S.xs[1] - S.med) <= 0.02) { S.running = false; if (MS.done('median')) L.toast(view, S.vote ? '✓ Both candidates at the median voter.' : '✓ Both sellers side by side at the median customer.'); } }
    function sync() {
      GT.seg(el.dist, 'data-d', S.dist); GT.seg(el.n, 'data-n', S.n); el.vote.checked = S.vote; el.go.textContent = S.running ? '❚❚ Pause' : '▶ Let them move';
      var sh = M.shares(S.w, S.xs), who = S.vote ? 'Candidate' : 'Seller';
      el.read.innerHTML = S.xs.map(function (x, k) { return '<dt>' + who + ' ' + (k + 1) + ' at ' + Math.round(x * 100) + '</dt><dd>' + Math.round(sh[k] * 1000) / 10 + '%</dd>'; }).join('') + '<dt>Median ' + (S.vote ? 'voter' : 'customer') + '</dt><dd>' + Math.round(S.med * 100) + '</dd>';
      render();
    }
    var G = {};
    function render() {
      var w = K.w, h = K.h; dr.bg(c, w, h);
      var x0 = 24, x1 = w - 24, base = h - 46, top = 46, X = function (x) { return x0 + (x1 - x0) * x; };
      G = { x0: x0, x1: x1, base: base, top: top };
      dr.label(c, S.vote ? 'Voters from left to right, and the candidates’ positions' : 'A beach 1 km long: sunbathers walk to the nearest ice-cream seller', 14, 18, C.muted, { size: 11.5, bold: true });
      // the density
      var mx = Math.max.apply(null, S.w), hh = (base - top) * 0.55;
      c.fillStyle = 'rgba(255,212,121,.10)'; c.beginPath(); c.moveTo(X(0), base); S.w.forEach(function (v, i) { c.lineTo(X((i + 0.5) / S.w.length), base - hh * v / mx); }); c.lineTo(X(1), base); c.closePath(); c.fill();
      // sand / axis
      c.fillStyle = S.vote ? 'rgba(116,192,252,.08)' : 'rgba(255,212,121,.16)'; c.fillRect(X(0), base, X(1) - X(0), 8);
      [0, 25, 50, 75, 100].forEach(function (t) { dr.label(c, S.vote ? (t === 0 ? 'left' : t === 100 ? 'right' : String(t)) : t / 100 + ' km', X(t / 100), base + 20, C.muted, { size: 10, align: 'center' }); });
      // people colored by nearest seller
      S.people.forEach(function (p) {
        var best = Infinity, who = []; S.xs.forEach(function (x, k) { var d = Math.abs(x - p.x); if (d < best - 1e-12) { best = d; who = [k]; } else if (Math.abs(d - best) <= 1e-12) who.push(k); });
        c.fillStyle = who.length > 1 ? C.ink : COLS[who[0]]; c.globalAlpha = 0.85; c.beginPath(); c.arc(X(p.x), base - 8 - p.y * hh * 0.9, 2.6, 0, 7); c.fill(); c.globalAlpha = 1;
      });
      // the median
      c.save(); c.strokeStyle = C.green; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(S.med), top + 14); c.lineTo(X(S.med), base); c.stroke(); c.restore();
      dr.label(c, 'median', X(S.med), top + 6, C.green, { size: 10.5, bold: true, align: 'center' });
      // the sellers
      var sh = M.shares(S.w, S.xs);
      var order = S.xs.map(function (x, k) { return k; }).sort(function (a2, b2) { return S.xs[a2] - S.xs[b2]; }), lab = {};
      order.forEach(function (k, r) { lab[k] = X(S.xs[k]); });
      for (var it = 0; it < 4; it++) for (var r2 = 1; r2 < order.length; r2++) { var a3 = order[r2 - 1], b3 = order[r2]; if (lab[b3] - lab[a3] < 62) { var mid = (lab[a3] + lab[b3]) / 2; lab[a3] = mid - 31; lab[b3] = mid + 31; } }
      S.xs.forEach(function (x, k) {
        var xx = X(x) + (S.xs.filter(function (y, j) { return j < k && Math.abs(y - x) < 0.015; }).length) * 14, yy = base - 4;
        c.save(); c.strokeStyle = COLS[k]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy - 42); c.stroke();
        c.fillStyle = COLS[k]; c.beginPath(); c.moveTo(xx - 18, yy - 40); c.quadraticCurveTo(xx, yy - 64, xx + 18, yy - 40); c.closePath(); c.fill(); c.restore();
        var lx = clamp(lab[k], G.x0 + 26, G.x1 - 26); if (Math.abs(lx - xx) > 2) { c.save(); c.strokeStyle = COLS[k]; c.globalAlpha = 0.6; c.lineWidth = 1; c.beginPath(); c.moveTo(xx, yy - 60); c.lineTo(lx, yy - 66); c.stroke(); c.restore(); }
        dr.label(c, (S.vote ? 'C' : 'S') + (k + 1) + ' ' + Math.round(sh[k] * 100) + '%', lx, yy - 74, COLS[k], { size: 12, bold: true, align: 'center' });
      });
    }
    L.loop(function (dt) { if (!S.running) return; S.acc += dt; if (S.acc > (reduced ? 0.05 : 0.2)) { S.acc = 0; stepOnce(); if (S.k > 400) S.running = false; } }, cv);
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) { var p = ptr(e); var best = 30, k = -1; S.xs.forEach(function (x, i) { var d = Math.abs(G.x0 + (G.x1 - G.x0) * x - p.x); if (d < best) { best = d; k = i; } }); if (k < 0) return; S.drag = k; S.running = false; try { cv.setPointerCapture(e.pointerId); } catch (er) { } });
    cv.addEventListener('pointermove', function (e) { if (S.drag < 0) return; var p = ptr(e); S.xs[S.drag] = Math.round(clamp((p.x - G.x0) / (G.x1 - G.x0), 0, 1) * 100) / 100; sync(); });
    cv.addEventListener('pointerup', function () { if (S.drag >= 0) { S.drag = -1; checkMedian(); } });
    el.dist.addEventListener('click', function (e) { var b = e.target.closest('button[data-d]'); if (b) { S.dist = b.dataset.d; load(); } });
    el.n.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (b) { S.n = +b.dataset.n; load(); } });
    el.vote.addEventListener('change', function () { S.vote = el.vote.checked; sync(); });
    el.go.addEventListener('click', function () { S.running = !S.running; sync(); });
    el.reset.addEventListener('click', load);
    W.addEventListener('resize', render);
    load();
    W.__gt5h = { S: S, stepOnce: stepOnce };
  })();
})(window, document);
