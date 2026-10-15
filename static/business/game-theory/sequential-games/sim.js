/* Game Theory, Chapter 6: Sequential Games and Backward Induction. Three interactives:
   1. (main, with missions) a game-tree builder and solver: backward induction animated from the leaves up, or done by
      you; the strategic form with its Nash equilibria, and which one is subgame perfect;
   2. the ultimatum game and the centipede game against bots shaped like experimental behavior;
   3. Stackelberg leadership versus Cournot.
   Models: model.js (window.GT6M), tested in node. Shared look and game math: ../hub.js (window.GT). */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, GT = W.GT, M = W.GT6M, root = D.getElementById('gt6-lab');
  if (!root || !L || !GT || !M) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, C = GT.C, dr = GT.draw, clamp = GT.clamp;
  var MS = L.missions($('gt6-missions'), 'gt6', [
    { id: 'solve', title: 'Reason backward', goal: 'Solve the entry game: press Solve and watch each choice made from the end of the tree back to the start.' },
    { id: 'threat', title: 'Spot the empty threat', goal: 'In the strategic form of the entry game, click the Nash equilibrium that is not subgame perfect.' },
    { id: 'credible', title: 'Make the threat credible', goal: 'Edit the entry game’s payoffs so that fighting pays the incumbent more than accommodating. Solve: does the entrant stay out?' },
    { id: 'commit', title: 'Burn your bridges', goal: 'Solve the commitment game: an investment that makes fighting pay keeps the entrant out.' },
    { id: 'cent', title: 'The centipede', goal: 'Solve the centipede game. Backward induction says take at once, though both could get far more.' },
    { id: 'build', title: 'Build your own', goal: 'Change a tree’s shape (add an action or turn an end into a decision), then solve it.' },
    { id: 'you', title: 'Do it yourself', goal: 'In “You solve” mode, solve a random tree with no mistakes.' },
    { id: 'lead', title: 'Lead the market', goal: 'In the Stackelberg lab, choose the leader’s output that maximizes its profit (within 1 unit).' }
  ]);
  var NAMES = { entry: ['Entrant', 'Incumbent'], commit: ['Entrant', 'Incumbent'], ultimatum: ['Proposer', 'Responder'], centipede: ['Player 1', 'Player 2'], stack: ['Leader', 'Follower'], random: ['Player 1', 'Player 2'] };

  /* =====================================================================================
     1. THE TREE
     ===================================================================================== */
  (function () {
    var view = $('gt6-view'), cv = $('gt6-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c, rng = GT.rng(Date.now() % 54321);
    var el = { pre: $('gt6-pre'), mode: $('gt6-mode'), solve: $('gt6-solve'), clear: $('gt6-clear'), rnd: $('gt6-rnd'), edit: $('gt6-edit'), sf: $('gt6-sf'), msg: $('gt6-msg'), reset: $('gt6-reset'), solve2: $('gt6-solve2') };
    var S = { key: 'entry', t: null, sol: null, shown: {}, anim: null, mode: 'watch', sel: null, mistakes: 0, done: {}, edited: false, pos: {}, msg: '', pulse: 0 };
    function load(key) {
      S.key = key; S.t = key === 'random' ? M.randomTree(rng) : M.PRESETS[key](); S.edited = false;
      if (key === 'stack') S.t.kids.forEach(function (k) { k.kids.forEach(function (l) { l.pay = l.pay.map(function (v) { return Math.round(v / 10) / 10; }); }); });
      clearSol(); S.sel = null; S.msg = intro(); sync();
    }
    function intro() {
      var nm = NAMES[S.key] || NAMES.random;
      return S.mode === 'you' ? 'You solve it: start at the highlighted node, the last decision in the tree, and click the action that player would choose.' : ({ entry: 'An entrant decides whether to enter; the incumbent then fights a price war or accommodates. Press Solve.', commit: 'First the incumbent decides whether to invest in extra capacity, which makes a price war cheaper for it. Then the entry game follows.', ultimatum: 'A proposer offers part of $10; the responder accepts (the split happens) or rejects (both get nothing).', centipede: 'Each player can take the larger share now or pass, which makes the total bigger for the other to decide.', stack: 'The leader chooses its output first; the follower sees it and replies. Profits in hundreds of dollars.', random: 'A random tree. Payoffs are ' + nm[0] + '’s (gold) and ' + nm[1] + '’s (blue).' })[S.key] || '';
    }
    function clearSol() { S.sol = M.solve(S.t); S.shown = {}; S.anim = null; S.mistakes = 0; S.done = {}; }
    function done(id, msg) { if (MS.done(id)) L.toast(view, '✓ ' + msg); }
    function nm(pl) { return (NAMES[S.key] || NAMES.random)[pl - 1]; }
    function finished() {
      var sol = S.sol, v = sol.value[S.t.id], path = M.path(S.t, sol.choice).slice(1).map(function (id) { return M.find(S.t, id).act; });
      S.msg = 'Backward induction: ' + path.join(' → ') + '. Payoffs (' + GT.num(v[0], 2) + ', ' + GT.num(v[1], 2) + ').' + (sol.ties.length ? ' (Some choices were ties; the first action was taken.)' : '');
      if (S.key === 'entry' && !S.edited) done('solve', 'The threat to fight isn’t credible: the entrant comes in.');
      if (S.key === 'entry' && S.edited && S.t.kids[sol.choice[S.t.id]].act === 'Out') done('credible', 'Now fighting pays, the threat is believed, and the entrant stays out.');
      if (S.key === 'commit' && path[0] === 'Invest') done('commit', 'Investing changes the incumbent’s own payoffs, and that makes the threat credible.');
      if (S.key === 'centipede') done('cent', 'Take at once: (1, 0), though passing could reach (5, 3).');
      if (S.edited && S.structural) done('build', 'Your own tree, solved from the leaves up.');
      if (S.mode === 'you' && S.mistakes === 0 && S.key === 'random') done('you', 'A whole tree, solved without a slip.');
      renderSF();
    }
    // ---------- layout ----------
    function layout() {
      var w = K.w, h = K.h, leaves = [], dep = M.depth(S.t);
      M.walk(S.t, function (n) { if (!n.kids.length) leaves.push(n); });
      var top = 70, bot = w < 560 ? 92 : 64, lw = (w - 30) / leaves.length, levH = (h - top - bot) / Math.max(1, dep);
      var pos = {};
      (function rec(n, d) {
        if (!n.kids.length) { var i = leaves.indexOf(n); pos[n.id] = { x: 15 + lw * (i + 0.5), y: top + d * levH }; return; }
        n.kids.forEach(function (k) { rec(k, d + 1); });
        var xs = n.kids.map(function (k) { return pos[k.id].x; }); pos[n.id] = { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, y: top + d * levH };
      })(S.t, 0);
      // leaves sit at the bottom
      leaves.forEach(function (n) { pos[n.id].y = h - bot; });
      S.pos = pos; S.lw = lw; return pos;
    }
    function render() {
      var w = K.w, h = K.h; dr.bg(c, w, h);
      var pos = layout(), sol = S.sol, narrow = w < 560, stackPay = S.lw < 78;
      var names = NAMES[S.key] || NAMES.random;
      var w0 = dr.label(c, '● ' + names[0], 14, 18, C.p1, { size: 12, bold: true });
      dr.label(c, '● ' + names[1], 14 + w0 + 14, 18, C.p2, { size: 12, bold: true });
      var cur = S.mode === 'you' ? nextNode() : (S.anim ? sol.order[S.anim.k] : null);
      // edges
      M.walk(S.t, function (n) {
        n.kids.forEach(function (k, j) {
          var a = pos[n.id], b = pos[k.id], chosen = S.shown[n.id] && sol.choice[n.id] === j, col = n.pl === 1 ? C.p1 : C.p2;
          c.save(); c.strokeStyle = chosen ? col : 'rgba(219,231,239,.28)'; c.lineWidth = chosen ? 4 : 1.8; if (chosen) { c.shadowColor = col; c.shadowBlur = 8; }
          if (S.shown[n.id] && !chosen) c.globalAlpha = 0.45;
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.restore();
          var mx = a.x + (b.x - a.x) * 0.5, my = a.y + (b.y - a.y) * 0.5;
          dr.label(c, k.act, mx + (b.x < a.x ? -6 : b.x > a.x ? 6 : 6), my, chosen ? col : C.ink, { size: narrow ? 10.5 : 11.5, bold: chosen, align: b.x < a.x ? 'right' : 'left' });
        });
      });
      // nodes
      M.walk(S.t, function (n) {
        var p = pos[n.id];
        if (!n.kids.length) {
          var onPath = S.shown[S.t.id] && M.path(S.t, sol.choice).indexOf(n.id) >= 0, s1 = GT.num(n.pay[0], 2), s2 = GT.num(n.pay[1], 2);
          c.fillStyle = onPath ? 'rgba(99,230,190,.18)' : 'rgba(255,255,255,.05)'; var bw = stackPay ? Math.max(34, S.lw - 6) : 70, bh = stackPay ? 40 : 26; dr.rrect(c, p.x - bw / 2, p.y + 6, bw, bh, 7); c.fill();
          if (onPath) { c.strokeStyle = C.green; c.lineWidth = 1.5; c.stroke(); }
          if (S.sel === n.id) { c.strokeStyle = C.pink; c.lineWidth = 2; c.setLineDash([4, 3]); dr.rrect(c, p.x - bw / 2 - 3, p.y + 3, bw + 6, bh + 6, 8); c.stroke(); c.setLineDash([]); }
          if (stackPay) { dr.label(c, s1, p.x, p.y + 17, C.p1, { size: 12, bold: true, align: 'center' }); dr.label(c, s2, p.x, p.y + 34, C.p2, { size: 12, bold: true, align: 'center' }); }
          else { c.save(); c.font = '700 13px ' + GT.FONT; var w1 = c.measureText(s1).width, w2 = c.measureText(s2 + ', ').width; c.restore(); var x0 = p.x - (w1 + w2) / 2; dr.label(c, s1, x0, p.y + 19, C.p1, { size: 13, bold: true }); dr.label(c, ', ' + s2, x0 + w1, p.y + 19, C.p2, { size: 13, bold: true }); }
          c.fillStyle = 'rgba(219,231,239,.6)'; c.beginPath(); c.arc(p.x, p.y, 3, 0, 7); c.fill();
          return;
        }
        var col = n.pl === 1 ? C.p1 : C.p2, isCur = cur === n.id;
        if (isCur) { c.save(); c.strokeStyle = C.pink; c.lineWidth = 3; c.globalAlpha = 0.5 + 0.5 * Math.sin(S.pulse * 6); c.beginPath(); c.arc(p.x, p.y, 19, 0, 7); c.stroke(); c.restore(); }
        if (S.sel === n.id) { c.save(); c.strokeStyle = C.pink; c.setLineDash([4, 3]); c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 18, 0, 7); c.stroke(); c.restore(); }
        c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, 12, 0, 7); c.fill();
        dr.label(c, String(n.pl), p.x, p.y + 1, '#06111a', { size: 12, bold: true, align: 'center', plain: true });
        if (S.shown[n.id]) { var v = sol.value[n.id]; dr.label(c, '(' + GT.num(v[0], 2) + ', ' + GT.num(v[1], 2) + ')', p.x + 17, p.y - 12, C.green, { size: 11.5, bold: true }); }
      });
      dr.wrap(c, S.msg, 14, h - (narrow ? 38 : 20), w - 28, 16, C.ink, { size: narrow ? 11.5 : 12.5, max: narrow ? 2 : 1 });
    }
    function nextNode() { var o = S.sol.order; for (var k = 0; k < o.length; k++) if (!S.shown[o[k]]) return o[k]; return null; }
    // ---------- solving ----------
    function startSolve() { if (S.mode === 'you') return; clearSol(); S.anim = { k: 0, t: 0 }; if (reduced) { S.sol.order.forEach(function (id) { S.shown[id] = 1; }); S.anim = null; finished(); } sync(); }
    function animStep(dt) {
      var A = S.anim; if (!A) return; A.t += dt;
      if (A.t > 0.75) { S.shown[S.sol.order[A.k]] = 1; var n = M.find(S.t, S.sol.order[A.k]); S.msg = nm(n.pl) + ' compares ' + n.kids.map(function (k) { return k.act + ' (' + GT.num(S.sol.value[k.id][n.pl - 1], 2) + ')'; }).join(' and ') + ', and chooses ' + n.kids[S.sol.choice[n.id]].act + '.'; A.k++; A.t = 0; if (A.k >= S.sol.order.length) { S.anim = null; finished(); } sync(); }
    }
    function youPick(n, j) {
      var id = nextNode(); if (!id || n.id !== id) { S.msg = 'Start with the highlighted node: work from the end of the tree back.'; sync(); return; }
      if (S.sol.choice[n.id] === j || Math.abs(S.sol.value[n.kids[j].id][n.pl - 1] - S.sol.value[n.id][n.pl - 1]) < 1e-9) {
        S.sol.choice[n.id] = j; S.shown[n.id] = 1; S.msg = 'Yes: ' + nm(n.pl) + ' gets ' + GT.num(S.sol.value[n.kids[j].id][n.pl - 1], 2) + ' from ' + n.kids[j].act + '.';
        // recompute values upward with this choice (ties)
        var sol2 = M.solve(S.t); S.sol.value = sol2.value;
        if (!nextNode()) finished();
      } else { S.mistakes++; S.msg = 'Not quite: ' + n.kids[j].act + ' gives ' + nm(n.pl) + ' ' + GT.num(S.sol.value[n.kids[j].id][n.pl - 1], 2) + ', but another action gives ' + GT.num(S.sol.value[n.id][n.pl - 1], 2) + '. Compare the ' + (n.pl === 1 ? 'gold' : 'blue') + ' numbers at the end of each branch.'; }
      sync();
    }
    // ---------- the strategic form ----------
    function renderSF() {
      var g = M.strategicForm(S.t), names = NAMES[S.key] || NAMES.random;
      if (g.rows.length > 6 || g.cols.length > 6) { el.sf.innerHTML = '<p class="lab-small">The strategic form of this tree has ' + g.rows.length + ' × ' + g.cols.length + ' strategy pairs, too many to show here. (A strategy must say what to do at <i>every</i> decision node, even ones that are never reached, so the count multiplies quickly.)</p>'; return; }
      g.p1 = names[0]; g.p2 = names[1];
      var ne = GT.pureNE(g), sp = M.spIndex(S.t, g);
      el.sf.innerHTML = GT.matrixHTML(g, { ne: ne, hi: S.shown[S.t.id] ? sp : null, label: 'The strategic form of the tree. Click a Nash equilibrium to see whether it is subgame perfect.', cap: 'Each strategy lists an action at every one of the player’s decision nodes. Green: Nash equilibria (' + ne.length + '). White outline: the subgame-perfect one, found by backward induction. Click an equilibrium.' });
      el.sf.querySelectorAll('tbody tr').forEach(function (tr, i) { tr.querySelectorAll('td').forEach(function (td, j) { td.tabIndex = 0; td.setAttribute('role', 'button'); td.addEventListener('click', function () { cellInfo(g, ne, sp, i, j); }); td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellInfo(g, ne, sp, i, j); } }); }); });
    }
    function cellInfo(g, ne, sp, i, j) {
      var isNE = ne.some(function (e) { return e[0] === i && e[1] === j; }), isSP = sp[0] === i && sp[1] === j;
      var t = '(' + g.rows[i] + ', ' + g.cols[j] + ') ';
      if (!isNE) S.msg = t + 'is not a Nash equilibrium: someone gains by switching strategy.';
      else if (isSP) S.msg = t + 'is a Nash equilibrium and subgame perfect: every planned action is a best choice where it would be taken.';
      else {
        S.msg = t + 'is a Nash equilibrium, but not subgame perfect: it relies on an action that player would not actually choose if that point were reached.';
        if (S.key === 'entry') done('threat', '(Out, Fight) is held up by an empty threat.');
      }
      el.msg.textContent = S.msg; render();
    }
    // ---------- editing ----------
    function renderEdit() {
      var n = S.sel ? M.find(S.t, S.sel) : null, names = NAMES[S.key] || NAMES.random;
      if (!n) { el.edit.innerHTML = '<p class="lab-small">Click a node or an end of the tree to edit it.</p>'; return; }
      var par = M.parentOf(S.t, n.id), h = '';
      if (par) h += '<label class="gt6-row"><span>Action name</span><input type="text" data-f="act" value="' + String(n.act).replace(/"/g, '&quot;') + '" maxlength="14"></label>';
      if (n.kids.length) {
        h += '<div class="gt6-row"><span>Who moves</span><span class="lab-seg"><button type="button" data-f="pl1" aria-pressed="' + (n.pl === 1) + '">' + names[0] + '</button><button type="button" data-f="pl2" aria-pressed="' + (n.pl === 2) + '">' + names[1] + '</button></span></div>';
        h += '<div class="lab-row"><button type="button" class="lab-btn" data-f="add">+ Add an action</button>' + (n.kids.length > 2 ? '<button type="button" class="lab-btn" data-f="rm">− Remove the last</button>' : '') + (par ? '<button type="button" class="lab-btn" data-f="toleaf">Make it an end</button>' : '') + '</div>';
      } else {
        h += '<label class="gt6-row"><span class="gth-k1">' + names[0] + ' gets</span><input type="number" data-f="u1" value="' + n.pay[0] + '" step="1"></label><label class="gt6-row"><span class="gth-k2">' + names[1] + ' gets</span><input type="number" data-f="u2" value="' + n.pay[1] + '" step="1"></label>';
        h += '<div class="lab-row"><button type="button" class="lab-btn" data-f="split">Turn into a decision</button></div>';
      }
      el.edit.innerHTML = h;
    }
    el.edit.addEventListener('change', function (e) {
      var n = M.find(S.t, S.sel), f = e.target.dataset.f; if (!n) return;
      if (f === 'act') n.act = e.target.value.trim() || '·';
      else if (f === 'u1' || f === 'u2') { var v = Math.round((+e.target.value || 0) * 100) / 100; n.pay[f === 'u1' ? 0 : 1] = v; }
      edited(false);
    });
    el.edit.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]'); if (!b) return; var n = M.find(S.t, S.sel), f = b.dataset.f, par = M.parentOf(S.t, S.sel); if (!n) return;
      if (f === 'pl1' || f === 'pl2') { n.pl = f === 'pl1' ? 1 : 2; edited(false); }
      else if (f === 'add') { n.kids.push(M.leaf(n.pl === 1 ? 'X' + n.kids.length : 'y' + n.kids.length, 0, 0)); edited(true); }
      else if (f === 'rm') { n.kids.pop(); edited(true); }
      else if (f === 'toleaf') { n.kids = []; n.pl = 0; n.pay = [0, 0]; edited(true); }
      else if (f === 'split') { n.pl = par && par.pl === 1 ? 2 : 1; n.pay = null; n.kids = [M.leaf(n.pl === 1 ? 'L' : 'l', 1, 0), M.leaf(n.pl === 1 ? 'R' : 'r', 0, 1)]; edited(true); }
    });
    function edited(structural) { S.edited = true; if (structural) S.structural = true; clearSol(); S.msg = 'Edited. Press Solve to find the subgame-perfect equilibrium.'; sync(); }
    function sync() {
      GT.seg(el.pre, 'data-g', S.key); GT.seg(el.mode, 'data-m', S.mode);
      el.solve.disabled = S.mode === 'you'; if (el.solve2) el.solve2.disabled = S.mode === 'you';
      el.msg.textContent = S.msg; renderEdit();
      if (!S.shown[S.t.id]) renderSF();
      render();
    }
    // ---------- input ----------
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function hit(P) {
      var best = null, bd = 18;
      M.walk(S.t, function (n) { var p = S.pos[n.id]; var d = Math.hypot(p.x - P.x, p.y + (n.kids.length ? 0 : 18) - P.y); if (d < bd + (n.kids.length ? 0 : 10)) { bd = d; best = { node: n }; } });
      if (best) return best;
      M.walk(S.t, function (n) { n.kids.forEach(function (k, j) { var a = S.pos[n.id], b = S.pos[k.id], dx = b.x - a.x, dy = b.y - a.y, t = clamp(((P.x - a.x) * dx + (P.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1), d = Math.hypot(a.x + dx * t - P.x, a.y + dy * t - P.y); if (d < 14 && t > 0.08 && (!best || d < best.d)) best = { edge: [n, j], d: d }; }); });
      return best;
    }
    cv.addEventListener('click', function (e) {
      var hres = hit(ptr(e)); if (!hres) return;
      if (S.mode === 'you') {
        var cur = nextNode(); if (!cur) return;
        if (hres.edge) youPick(hres.edge[0], hres.edge[1]);
        else if (hres.node) { var par = M.parentOf(S.t, hres.node.id); if (par) youPick(par, par.kids.indexOf(hres.node)); }
        return;
      }
      S.sel = hres.node ? hres.node.id : hres.edge[0].kids[hres.edge[1]].id; sync();
    });
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startSolve(); }
      else if (S.mode === 'you' && /^[1-9]$/.test(e.key)) { var id = nextNode(); if (id) { var n = M.find(S.t, id), j = +e.key - 1; if (j < n.kids.length) youPick(n, j); } }
      else if (e.key === 'n' || e.key === 'N') load(S.key);
    });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b) load(b.dataset.g); });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.mode = b.dataset.m; clearSol(); S.msg = intro(); sync(); });
    el.solve.addEventListener('click', startSolve); if (el.solve2) el.solve2.addEventListener('click', startSolve);
    el.clear.addEventListener('click', function () { clearSol(); S.msg = intro(); sync(); });
    el.rnd.addEventListener('click', function () { load('random'); });
    el.reset.addEventListener('click', function () { load(S.key); });
    L.loop(function (dt) { S.pulse += dt; animStep(dt); if (S.anim || S.mode === 'you') render(); }, cv);
    W.addEventListener('resize', render); L.onTheme(render);
    load('entry');
    W.__gt6 = { S: S, load: load, startSolve: startSolve, youPick: youPick, nextNode: nextNode, edited: edited, M: M };
  })();

  /* =====================================================================================
     2. ULTIMATUM AND CENTIPEDE
     ===================================================================================== */
  (function () {
    var box = $('gt6u'); if (!box) return;
    var rng = GT.rng(Date.now() % 4441 + 3);
    var el = { tab: $('gt6u-tab'), body: $('gt6u-body'), read: $('gt6u-read'), bot: $('gt6u-bot'), cv: $('gt6u-cv') };
    var S = { tab: 'propose', bot: 'typical', offers: [], earn: 0, rounds: 0, resp: { earn: 0, n: 0, rej: 0, offer: null }, cent: null };
    var K = el.cv ? L.canvas(el.cv) : null;
    function sync() {
      GT.seg(el.tab, 'data-t', S.tab); GT.seg(el.bot, 'data-b', S.bot); el.bot.hidden = S.tab !== 'propose';
      if (S.tab === 'propose') {
        el.body.innerHTML = '<p>You have $10 to split. Choose how much to offer the responder; if they accept, they get your offer and you keep the rest. If they reject, you both get nothing.</p><div class="lab-field"><span><label for="gt6u-o">Your offer</label><output id="gt6u-o-o">$' + (S.lastOffer || 4) + '</output></span><input type="range" id="gt6u-o" min="0" max="10" step="1" value="' + (S.lastOffer || 4) + '"></div><div class="lab-row"><button type="button" class="lab-btn pri" id="gt6u-go">Make the offer</button></div><p id="gt6u-res" aria-live="polite">' + (S.res || '') + '</p>';
        var o = $('gt6u-o'); o.addEventListener('input', function () { $('gt6u-o-o').textContent = '$' + o.value; S.lastOffer = +o.value; });
        $('gt6u-go').addEventListener('click', function () { propose(+o.value); });
      } else if (S.tab === 'respond') {
        if (S.resp.offer === null) S.resp.offer = M.typicalOffer(rng);
        el.body.innerHTML = '<p>A simulated proposer with $10 offers you <b class="gt6-big">$' + S.resp.offer + '</b> and keeps $' + (10 - S.resp.offer) + '. Accept, and you both get those amounts. Reject, and you both get nothing.</p><div class="lab-row"><button type="button" class="lab-btn pri" id="gt6u-acc">Accept $' + S.resp.offer + '</button><button type="button" class="lab-btn" id="gt6u-rej">Reject</button></div><p id="gt6u-res" aria-live="polite">' + (S.res || '') + '</p>';
        $('gt6u-acc').addEventListener('click', function () { respond(true); }); $('gt6u-rej').addEventListener('click', function () { respond(false); });
      } else centBody();
      var r = S.tab === 'propose' ? '<dt>Offers made</dt><dd>' + S.rounds + '</dd><dt>Accepted</dt><dd>' + S.offers.filter(function (x) { return x.ok; }).length + '</dd><dt>You earned</dt><dd>$' + S.earn + (S.rounds ? ' ($' + fmt(S.earn / S.rounds, 2) + ' a round)' : '') + '</dd><dt>Theory, against a money-maximizer</dt><dd>offer $1, keep $9</dd>'
        : S.tab === 'respond' ? '<dt>Offers received</dt><dd>' + S.resp.n + '</dd><dt>You rejected</dt><dd>' + S.resp.rej + '</dd><dt>You earned</dt><dd>$' + S.resp.earn + '</dd><dt>Theory says</dt><dd>accept anything above $0</dd>'
        : '<dt>Backward induction</dt><dd>take at once: $4</dd>' + (S.cent ? '<dt>Piles now</dt><dd>$' + M.centPiles(S.cent.t).big + ' and $' + M.centPiles(S.cent.t).small + '</dd>' : '') + '<dt>Your total</dt><dd>$' + ((S.centTot || 0)) + '</dd>';
      el.read.innerHTML = r; draw();
    }
    function propose(x) {
      var share = x / 10, p = S.bot === 'typical' ? M.acceptProb(share) : (x > 0 ? 1 : 0.5), ok = rng() < p;
      S.offers.push({ x: x, ok: ok }); if (S.offers.length > 60) S.offers.shift(); S.rounds++; if (ok) S.earn += 10 - x;
      S.res = (ok ? '✓ Accepted. You keep $' + (10 - x) + ', the responder gets $' + x + '.' : '✗ Rejected. You both get nothing.') + (S.bot === 'typical' ? ' A typical responder accepts an offer of $' + x + ' about ' + Math.round(p * 100) + '% of the time.' : '');
      sync();
    }
    function respond(acc) {
      var x = S.resp.offer; S.resp.n++; if (acc) S.resp.earn += x; else S.resp.rej++;
      S.res = acc ? 'You accepted $' + x + '. Next offer:' : 'You rejected $' + x + ': you gave up $' + x + ' to make the proposer lose $' + (10 - x) + '. Next offer:';
      S.resp.offer = M.typicalOffer(rng); sync();
    }
    // centipede
    function centStart() { S.cent = { t: 0, over: false, botTurns: 0 }; S.res = 'Two piles: $4 and $1. On your turn, take the big pile (the other player gets the small one) or pass: both piles double and the other player decides. You move first. After six moves the game ends and you get the big pile.'; }
    function centBody() {
      if (!S.cent) centStart();
      var P = M.centPiles(S.cent.t), yourTurn = S.cent.t % 2 === 0 && !S.cent.over;
      el.body.innerHTML = '<div class="gt6-piles"><div><span>big pile</span><b>$' + P.big + '</b></div><div><span>small pile</span><b>$' + P.small + '</b></div><div><span>move</span><b>' + Math.min(6, S.cent.t + 1) + ' of 6</b></div></div><div class="lab-row">' + (S.cent.over ? '<button type="button" class="lab-btn pri" id="gt6u-again">Play again</button>' : '<button type="button" class="lab-btn pri" id="gt6u-take"' + (yourTurn ? '' : ' disabled') + '>Take $' + P.big + '</button><button type="button" class="lab-btn" id="gt6u-pass"' + (yourTurn ? '' : ' disabled') + '>Pass</button>') + '</div><p id="gt6u-res" aria-live="polite">' + (S.res || '') + '</p>';
      if (S.cent.over) $('gt6u-again').addEventListener('click', function () { centStart(); sync(); });
      else { $('gt6u-take').addEventListener('click', function () { centMove(true); }); $('gt6u-pass').addEventListener('click', function () { centMove(false); }); }
    }
    function centMove(take) {
      var C0 = S.cent, P = M.centPiles(C0.t);
      if (take) { C0.over = true; S.centTot = (S.centTot || 0) + P.big; S.res = 'You took $' + P.big + '; the other player gets $' + P.small + '.'; sync(); return; }
      C0.t++; // bot's turn
      var Pb = M.centPiles(C0.t); C0.botTurns++;
      var last = C0.t === 5, takeP = M.centTakeProb(C0.botTurns, last);
      if (rng() < takeP) { C0.over = true; S.centTot = (S.centTot || 0) + Pb.small; S.res = 'You passed, and the other player took $' + Pb.big + '. You get $' + Pb.small + '.'; }
      else { C0.t++; if (C0.t >= 6) { C0.over = true; var Pf = M.centPiles(6); S.centTot = (S.centTot || 0) + Pf.big; S.res = 'Everyone passed to the end: the piles reached $' + Pf.big + ' and $' + Pf.small + ', and you get the big one.'; } else S.res = 'The other player passed too. The piles are now $' + M.centPiles(C0.t).big + ' and $' + M.centPiles(C0.t).small + '.'; }
      sync();
    }
    function draw() {
      if (!K) return; var c = K.c, w = K.w, h = K.h; dr.bg(c, w, h);
      if (S.tab !== 'propose') { el.cv.parentNode.hidden = true; return; } el.cv.parentNode.hidden = false; K.fit(); w = K.w; h = K.h; dr.bg(c, w, h);
      var x0 = 40, x1 = w - 14, y0 = 24, y1 = h - 30, X = function (o) { return x0 + (x1 - x0) * o / 10; }, Y = function (p) { return y1 - (y1 - y0) * p; };
      dr.label(c, 'Chance the responder accepts, by offer', 12, 12, C.muted, { size: 11, bold: true });
      c.strokeStyle = 'rgba(219,231,239,.15)'; [0, 0.5, 1].forEach(function (p) { c.beginPath(); c.moveTo(x0, Y(p)); c.lineTo(x1, Y(p)); c.stroke(); dr.label(c, Math.round(p * 100) + '%', x0 - 5, Y(p), C.muted, { size: 10, align: 'right' }); });
      for (var o = 0; o <= 10; o += 2) dr.label(c, '$' + o, X(o), y1 + 13, C.muted, { size: 10, align: 'center' });
      c.strokeStyle = C.blue; c.lineWidth = 2.5; c.beginPath(); for (var k = 0; k <= 100; k++) { var oo = k / 10, p = S.bot === 'typical' ? M.acceptProb(oo / 10) : (oo > 0 ? 1 : 0.5); if (k) c.lineTo(X(oo), Y(p)); else c.moveTo(X(oo), Y(p)); } c.stroke();
      S.offers.forEach(function (f, i) { c.fillStyle = f.ok ? C.green : C.red; c.globalAlpha = 0.8; c.beginPath(); c.arc(X(f.x) + ((i * 7) % 11 - 5), f.ok ? Y(1) + 8 + (i % 3) * 5 : Y(0) - 8 - (i % 3) * 5, 3.5, 0, 7); c.fill(); c.globalAlpha = 1; });
    }
    el.tab.addEventListener('click', function (e) { var b = e.target.closest('button[data-t]'); if (b) { S.tab = b.dataset.t; S.res = ''; if (S.tab === 'cent') centStart(); sync(); } });
    el.bot.addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (b) { S.bot = b.dataset.b; S.offers = []; S.earn = 0; S.rounds = 0; S.res = ''; sync(); } });
    W.addEventListener('resize', draw);
    sync();
    W.__gt6u = { S: S, propose: propose, respond: respond, centMove: centMove };
  })();

  /* =====================================================================================
     3. STACKELBERG
     ===================================================================================== */
  (function () {
    var view = $('gt6s-view'), cv = $('gt6s-cv'); if (!cv) return;
    var K = L.canvas(cv), c = K.c;
    var el = { q: $('gt6s-q'), qO: $('gt6s-q-o'), read: $('gt6s-read') };
    var S = { q1: 30, drag: false };
    function sync() {
      el.q.value = S.q1; el.qO.textContent = fmt(S.q1, 1);
      var q2 = M.follow(S.q1), p = 100 - S.q1 - q2;
      el.read.innerHTML = '<dt>Follower’s reply q₂</dt><dd>' + fmt(q2, 2) + '</dd><dt>Price</dt><dd>$' + fmt(p, 2) + '</dd><dt>Leader’s profit</dt><dd>' + fmt(M.lprofit(S.q1), 1) + '</dd><dt>Follower’s profit</dt><dd>' + fmt(M.fprofit(S.q1), 1) + '</dd><dt>Cournot profits, for comparison</dt><dd>900 · 900</dd>';
      if (Math.abs(S.q1 - 45) <= 1 && MS.done('lead')) L.toast(view, '✓ 45 units: the leader earns 1,012.5, the follower 506.25.');
      render();
    }
    var G = {};
    function render() {
      var w = K.w, h = K.h, narrow = w < 600; dr.bg(c, w, h);
      var qmax = 92, px = 46, py = 26, pw = narrow ? w - px - 14 : Math.min(w * 0.55, h - 60), ph = narrow ? Math.min(pw, h * 0.52) : pw;
      var X = function (q) { return px + pw * q / qmax; }, Y = function (q) { return py + ph - ph * q / qmax; };
      G = { px: px, pw: pw, py: py, ph: ph, qmax: qmax };
      c.strokeStyle = 'rgba(219,231,239,.12)'; c.lineWidth = 1; for (var v = 0; v <= 90; v += 10) { c.beginPath(); c.moveTo(X(v), py); c.lineTo(X(v), py + ph); c.moveTo(px, Y(v)); c.lineTo(px + pw, Y(v)); c.stroke(); if (v % 20 === 0) { dr.label(c, String(v), X(v), py + ph + 12, C.muted, { size: 10, align: 'center' }); dr.label(c, String(v), px - 6, Y(v), C.muted, { size: 10, align: 'right' }); } }
      dr.label(c, 'leader’s output q₁ →', px + pw, py + ph + 25, C.p1, { size: 11, bold: true, align: 'right' }); dr.label(c, '↑ follower’s q₂', px, py - 12, C.p2, { size: 11, bold: true });
      // leader's isoprofit curves through the Stackelberg and Cournot points
      [[1012.5, 'rgba(255,212,121,.85)'], [900, 'rgba(255,212,121,.4)']].forEach(function (L2) { c.save(); c.strokeStyle = L2[1]; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath(); var st = false; for (var q1 = 1; q1 <= qmax; q1 += 0.3) { var q2 = 90 - q1 - L2[0] / q1; if (q2 < 0 || q2 > qmax) { st = false; continue; } if (st) c.lineTo(X(q1), Y(q2)); else { c.moveTo(X(q1), Y(q2)); st = true; } } c.stroke(); c.restore(); });
      // follower's best response
      c.strokeStyle = C.p2; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Y(45)); c.lineTo(X(90), Y(0)); c.stroke();
      dr.label(c, 'follower’s best reply', X(68), Y(M.follow(68)) - 14, C.p2, { size: 11, bold: true });
      c.save(); c.strokeStyle = 'rgba(255,212,121,.5)'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(X(45), Y(0)); c.lineTo(X(0), Y(90)); c.stroke(); c.restore();
      dr.label(c, 'leader’s Cournot reply', X(8), Y(76), 'rgba(255,212,121,.75)', { size: 10.5 });
      c.fillStyle = C.green; c.beginPath(); c.arc(X(30), Y(30), 6, 0, 7); c.fill(); dr.label(c, 'Cournot (30, 30)', X(30) + 9, Y(30) - 10, C.green, { size: 11, bold: true });
      c.fillStyle = C.gold; c.beginPath(); c.arc(X(45), Y(22.5), 6, 0, 7); c.fill(); dr.label(c, 'Stackelberg (45, 22.5)', X(45) - 4, Y(22.5) + 18, C.gold, { size: 11, bold: true, align: 'right' });
      c.save(); c.shadowColor = C.pink; c.shadowBlur = 10; c.fillStyle = C.pink; c.beginPath(); c.arc(X(S.q1), Y(M.follow(S.q1)), 8, 0, 7); c.fill(); c.restore();
      // leader's profit along the follower's reply
      var bx = narrow ? 14 : px + pw + 24, by = narrow ? py + ph + 40 : py, bw = narrow ? w - 28 : w - bx - 14, bh = narrow ? h - by - 12 : ph;
      dr.panel(c, bx, by, bw, bh, 'Leader’s profit, given the reply');
      var x0 = bx + 40, x1 = bx + bw - 12, y0 = by + 28, y1 = by + bh - 24, Xp = function (q) { return x0 + (x1 - x0) * q / 90; }, Yp = function (v) { return y1 - (y1 - y0) * v / 1100; };
      [0, 500, 1000].forEach(function (v) { c.strokeStyle = 'rgba(219,231,239,.12)'; c.beginPath(); c.moveTo(x0, Yp(v)); c.lineTo(x1, Yp(v)); c.stroke(); dr.label(c, String(v), x0 - 5, Yp(v), C.muted, { size: 10, align: 'right' }); });
      [0, 45, 90].forEach(function (q) { dr.label(c, String(q), Xp(q), y1 + 12, C.muted, { size: 10, align: 'center' }); });
      c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); for (var q = 0; q <= 90; q += 0.5) { var vv = Math.max(0, M.lprofit(q)); if (q) c.lineTo(Xp(q), Yp(vv)); else c.moveTo(Xp(q), Yp(vv)); } c.stroke();
      c.save(); c.strokeStyle = C.green; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x0, Yp(900)); c.lineTo(x1, Yp(900)); c.stroke(); c.restore(); dr.label(c, 'Cournot 900', x1, Yp(900) - 8, C.green, { size: 10, align: 'right' });
      c.fillStyle = C.pink; c.beginPath(); c.arc(Xp(S.q1), Yp(Math.max(0, M.lprofit(S.q1))), 6, 0, 7); c.fill();
    }
    function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) { var p = ptr(e); if (p.x < G.px || p.x > G.px + G.pw || p.y < G.py || p.y > G.py + G.ph) return; S.drag = true; S.q1 = Math.round(clamp((p.x - G.px) / G.pw * G.qmax, 0, 90) * 2) / 2; try { cv.setPointerCapture(e.pointerId); } catch (er) { } sync(); });
    cv.addEventListener('pointermove', function (e) { if (!S.drag) return; var p = ptr(e); S.q1 = Math.round(clamp((p.x - G.px) / G.pw * G.qmax, 0, 90) * 2) / 2; sync(); });
    cv.addEventListener('pointerup', function () { S.drag = false; });
    el.q.addEventListener('input', function () { S.q1 = +el.q.value; sync(); });
    W.addEventListener('resize', render);
    sync();
  })();
})(window, document);
