/* Latrunculi, the Roman "game of soldiers". No rulebook survives, so this is one simple modern reconstruction:
   pieces move straight like a rook and are taken when trapped between two enemies (custodian capture), as Ovid's
   "one piece dies by a twin enemy" suggests. Move statistics come from a short look-ahead search: estimates. */
(function (W, D) {
  'use strict';
  var NN = 8, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]], CORNERS = { 0: [1, 8], 7: [6, 15], 56: [48, 57], 63: [55, 62] };
  function start() { var b = []; for (var i = 0; i < 64; i++) b.push(i < 8 ? 2 : i >= 56 ? 1 : 0); return { b: b, turn: 1, quiet: 0 }; }
  function rc(i) { return [i >> 3, i & 7]; }
  function captures(b, t, c) { // enemy pieces taken by c moving to t
    var o = 3 - c, out = [], p = rc(t);
    DIRS.forEach(function (d) {
      var r1 = p[0] + d[0], c1 = p[1] + d[1], r2 = r1 + d[0], c2 = c1 + d[1];
      if (r2 < 0 || r2 >= NN || c2 < 0 || c2 >= NN) return;
      var a = r1 * 8 + c1, z = r2 * 8 + c2;
      if (b[a] === o && b[z] === c && !CORNERS[a]) out.push(a);
    });
    Object.keys(CORNERS).forEach(function (k) { k = +k; var nb = CORNERS[k]; if (b[k] === o && nb.indexOf(t) >= 0 && b[nb[0]] === c && b[nb[1]] === c) out.push(k); });
    return out;
  }
  function moves(S) {
    var c = S.turn, b = S.b, out = [];
    for (var i = 0; i < 64; i++) if (b[i] === c) {
      var p = rc(i);
      DIRS.forEach(function (d) {
        var r = p[0] + d[0], cc = p[1] + d[1];
        while (r >= 0 && r < NN && cc >= 0 && cc < NN && !b[r * 8 + cc]) {
          var t = r * 8 + cc, nb = b.slice(); nb[i] = 0; nb[t] = c;
          out.push({ f: i, t: t, x: captures(nb, t, c) });
          r += d[0]; cc += d[1];
        }
      });
    }
    return out;
  }
  function apply(S, m) { var b = S.b.slice(); b[m.t] = b[m.f]; b[m.f] = 0; m.x.forEach(function (x) { b[x] = 0; }); return { b: b, turn: 3 - S.turn, quiet: m.x.length ? 0 : S.quiet + 1 }; }
  function count(b, c) { var n = 0; for (var i = 0; i < 64; i++) if (b[i] === c) n++; return n; }
  var LIMIT = 50;
  function result(S) { // 1 or 2 = winner, 'draw', or null
    var c = S.turn;
    if (count(S.b, c) < 2) return 3 - c; if (count(S.b, 3 - c) < 2) return c;
    if (!moves(S).length) return 3 - c;
    if (S.quiet >= LIMIT) { var a = count(S.b, 1), z = count(S.b, 2); return a > z ? 1 : z > a ? 2 : 'draw'; }
    return null;
  }
  function danger(b, c) { // how many of c's pieces stand between an enemy and an empty square an enemy could reach
    var o = 3 - c, n = 0;
    for (var i = 0; i < 64; i++) if (b[i] === c) { var p = rc(i); for (var k = 0; k < 2; k++) { var d = DIRS[k * 2 + 0], e = [p[0] + d[0], p[1] + d[1]], f = [p[0] - d[0], p[1] - d[1]]; if (e[0] < 0 || e[0] > 7 || e[1] < 0 || e[1] > 7 || f[0] < 0 || f[0] > 7 || f[1] < 0 || f[1] > 7) continue; var A = b[e[0] * 8 + e[1]], B = b[f[0] * 8 + f[1]]; if ((A === o && !B) || (B === o && !A)) n++; } }
    return n;
  }
  function reach(b, c, s, skip) { // can a piece of c (other than at skip) slide to square s in one move?
    var p = rc(s);
    for (var k = 0; k < 4; k++) { var d = DIRS[k], r = p[0] + d[0], cc = p[1] + d[1]; while (r >= 0 && r < NN && cc >= 0 && cc < NN) { var v = b[r * 8 + cc]; if (v) { if (v === c && r * 8 + cc !== skip) return true; break; } r += d[0]; cc += d[1]; } }
    return false;
  }
  function threats(b, c) { // enemy pieces c could trap with its next move
    var o = 3 - c, n = 0;
    for (var i = 0; i < 64; i++) if (b[i] === o) {
      var p = rc(i), hit = false;
      for (var k = 0; k < 4 && !hit; k += 2) {
        var d = DIRS[k], A = [p[0] + d[0], p[1] + d[1]], B = [p[0] - d[0], p[1] - d[1]];
        if (A[0] < 0 || A[0] > 7 || A[1] < 0 || A[1] > 7 || B[0] < 0 || B[0] > 7 || B[1] < 0 || B[1] > 7) continue;
        var a = A[0] * 8 + A[1], z = B[0] * 8 + B[1];
        if (b[a] === c && !b[z] && reach(b, c, z, a)) hit = true;
        else if (b[z] === c && !b[a] && reach(b, c, a, z)) hit = true;
      }
      if (hit) n++;
    }
    return n;
  }
  function evaluate(S, c) {
    var r = result(S); if (r === c) return 1000; if (r === 3 - c) return -1000; if (r === 'draw') return 0;
    var b = S.b, o = 3 - c, mine = S.turn === c, cen = 0;
    for (var i = 0; i < 64; i++) if (b[i]) { var p = rc(i), central = p[0] >= 2 && p[0] <= 5 && p[1] >= 2 && p[1] <= 5; if (central) cen += b[i] === c ? 1 : -1; }
    return (count(b, c) - count(b, o)) * 20 + threats(b, c) * (mine ? 12 : 4) - threats(b, o) * (mine ? 4 : 12) + cen * 0.8;
  }
  function search(S, depth, alpha, beta, c) {
    var r = result(S); if (r != null) return r === c ? 1000 + depth : r === 'draw' ? 0 : -1000 - depth;
    if (depth === 0) return evaluate(S, c);
    var ms = moves(S); ms.sort(function (a, b) { return b.x.length - a.x.length; });
    var max = S.turn === c, best = max ? -1e9 : 1e9;
    for (var i = 0; i < ms.length; i++) {
      var v = search(apply(S, ms[i]), depth - 1, alpha, beta, c);
      if (max) { if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function rank(S, depth) {
    var c = S.turn, ms = moves(S);
    ms.forEach(function (m) { m.v = search(apply(S, m), (depth || 2) - 1, -1e9, 1e9, c) + m.x.length * 0.5; m.w = 1 / (1 + Math.exp(-m.v / 25)); });
    ms.sort(function (a, b) { return b.v - a.v; });
    return ms;
  }
  W.LatEngine = { start: start, moves: moves, apply: apply, result: result, rank: rank, captures: captures, count: count };

  var root = D.getElementById('latrunculi'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  var pref = { level: 2, hints: true, first: 'you', mode: 'cpu', stats: { w: 0, l: 0, d: 0 } };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-latrunculi')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-latrunculi', JSON.stringify(pref)); } catch (e) { } }
  var S, an = null, sel = -1, over = null, busy = false, st, last = null;
  function two() { return pref.mode === 'two'; }
  function cpu() { return !two() && S.turn === 2; }
  function name(c) { return two() ? (c === 1 ? 'Pale' : 'Dark') : (c === 1 ? 'You' : 'Your opponent'); }
  root.innerHTML = '<div class="bg-top"><h1>Latrunculi</h1><select id="x-mode" aria-label="Players"><option value="cpu">Against the computer</option><option value="two">Two players, one device</option></select>' +
    '<select id="x-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: hard</option></select>' +
    '<select id="x-first" aria-label="Who starts"><option value="you">Pale starts</option><option value="them">Dark starts</option></select><button type="button" class="bg-btn" id="x-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="x-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="lt-board" id="x-board"></div><div class="bg-msg" id="x-msg"></div></div>' +
    '<div class="bg-side"><div class="bg-box" id="x-stats"></div><div class="bg-box" id="x-hbox"><h3>Moves, best first</h3><ol class="bg-hints" id="x-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>best</span><span><i class="sw q1"></i>good</span><span><i class="sw q2"></i>fair</span><span><i class="sw q3"></i>weak</span><span><i class="sw q4"></i>bad</span></div>' +
    '<p class="bg-small">Estimated from a search two moves ahead (your move and the reply) that counts the soldiers left, the enemy soldiers each side could trap next, and control of the centre.</p></div>' +
    '<details class="bg-box bg-rules" id="x-rules"></details></div></div>';
  var bd = $('#x-board');
  for (var i = 0; i < 64; i++) { var b = D.createElement('button'); b.type = 'button'; b.className = 'lt-sq'; b.dataset.i = i; bd.appendChild(b); }
  bd.addEventListener('click', function (e) { var el = e.target.closest('.lt-sq'); if (el) tap(+el.dataset.i); });
  function qual(d) { return d <= 0.02 ? 0 : d <= 0.06 ? 1 : d <= 0.12 ? 2 : d <= 0.22 ? 3 : 4; }
  function newGame() { S = start(); S.turn = pref.first === 'you' ? 1 : 2; sel = -1; over = null; busy = false; last = null; st = { taken: [0, 0, 0], best: 0, plays: 0 }; step(); }
  function step() {
    var r = result(S);
    if (r != null) { over = r; if (!two()) { pref.stats[r === 'draw' ? 'd' : r === 1 ? 'w' : 'l']++; save(); } an = null; return draw(); }
    an = cpu() ? null : (pref.hints ? rank(S, 2) : moves(S));
    if (an && pref.hints) { var bb = an[0].w; an.forEach(function (m) { m.q = qual(bb - m.w); }); }
    draw();
    if (cpu()) { busy = true; setTimeout(reply, 350); }
  }
  function reply() {
    var ms = rank(S, pref.level === 3 ? 3 : 2), m = ms[0];
    if (pref.level === 1 && Math.random() < 0.5) m = ms[Math.floor(Math.random() * ms.length)];
    else if (pref.level === 2 && Math.random() < 0.15) m = ms[Math.min(ms.length - 1, 1 + Math.floor(Math.random() * 3))];
    busy = false; doMove(m);
  }
  function doMove(m) {
    if (!cpu() && pref.hints && an && an[0].w != null) { st.plays++; if (m.w >= an[0].w - 0.02) st.best++; }
    st.taken[S.turn] += m.x.length; last = m;
    S = apply(S, m); sel = -1; step();
  }
  function tap(i) {
    if (over || busy || cpu() || !an) return;
    if (sel >= 0) { var m = an.filter(function (x) { return x.f === sel && x.t === i; })[0]; if (m) return doMove(m); }
    sel = S.b[i] === S.turn && sel !== i && an.some(function (x) { return x.f === i; }) ? i : -1; draw();
  }
  var QC = ['#1a8a4a', '#8fbf3f', '#e2b800', '#e8862a', '#c0392b'];
  function sqName(i) { return 'abcdefgh'[i & 7] + (8 - (i >> 3)); }
  function draw() {
    var by = {}, tg = {};
    if (an && pref.hints) an.forEach(function (m) { var k = sel >= 0 ? (m.f === sel ? m.t : null) : 's' + m.f; if (k != null && !(k in by)) by[k] = m; });
    if (an && sel >= 0) an.forEach(function (m) { if (m.f === sel) tg[m.t] = m; });
    var sqs = bd.children;
    for (var i = 0; i < 64; i++) {
      var el = sqs[i], c = S.b[i], h = '', hint = by[i], src = by['s' + i];
      if (c) h = '<span class="lt-pc p' + c + (i === sel ? ' sel' : '') + '"' + (src ? ' style="box-shadow:0 0 0 4px ' + QC[src.q] + '"' : '') + '></span>';
      else if (tg[i]) h = '<span class="lt-dot" style="background:' + (hint ? QC[hint.q] : 'rgba(0,0,0,.3)') + '">' + (tg[i].x.length ? '✕' : '') + '</span>';
      if (pref.hints && hint && !c) h += '<span class="lt-pct">' + Math.round(hint.w * 100) + '%</span>';
      if (pref.hints && src && sel < 0) h += '<span class="lt-pct">' + Math.round(src.w * 100) + '%</span>';
      el.innerHTML = h; el.className = 'lt-sq' + ((((i >> 3) + (i & 7)) % 2) ? ' dk' : '') + (last && (last.f === i || last.t === i) ? ' last' : '');
      el.setAttribute('aria-label', sqName(i) + (c ? ' ' + (c === 1 ? 'pale' : 'dark') + ' piece' : ''));
    }
    var who = name(S.turn);
    $('#x-msg').innerHTML = over ? (over === 'draw' ? '<b class="la">Pares estis.</b> = You are equals: a draw.' : two() ? '<b>' + name(over) + ' wins!</b>' : over === 1 ? '<b class="la">Vicisti!</b> = You have won.' : '<b class="la">Victus es.</b> = You are beaten.')
      : cpu() ? 'Your opponent is thinking…' : '<b class="la">Move latronem.</b> = Move a soldier. ' + (sel >= 0 ? 'Now tap where it goes (✕ takes a piece).' : who + ': tap one of your pieces.');
    $('#x-stats').innerHTML = '<h3>This game</h3><table><tr><td>Pieces, pale : dark</td><td>' + count(S.b, 1) + ' : ' + count(S.b, 2) + '</td></tr><tr><td>Taken, by pale : by dark</td><td>' + st.taken[1] + ' : ' + st.taken[2] + '</td></tr>' +
      '<tr><td>Moves since the last capture</td><td>' + S.quiet + ' of ' + LIMIT + '</td></tr>' + (pref.hints && st.plays ? '<tr><td>Moves within 2% of the best</td><td>' + st.best + ' of ' + st.plays + '</td></tr>' : '') +
      (!two() ? '<tr><td>Your record (won, drawn, lost)</td><td>' + pref.stats.w + ', ' + pref.stats.d + ', ' + pref.stats.l + '</td></tr>' : '') + '</table>';
    var hl = $('#x-hints'), list = an && pref.hints ? an.filter(function (m) { return sel < 0 || m.f === sel; }) : [];
    hl.innerHTML = list.length ? list.slice(0, 40).map(function (m, n) { return '<li data-k="' + m.f + ',' + m.t + '"><i class="sw q' + m.q + '"></i><span>' + sqName(m.f) + ' → ' + sqName(m.t) + (m.x.length ? ' ✕' + m.x.length : '') + '</span><b>' + Math.round(m.w * 100) + '%</b></li>'; }).join('') : '<li>' + (over ? 'The game is over.' : cpu() ? 'Waiting…' : '') + '</li>';
    hl.querySelectorAll('[data-k]').forEach(function (li) { li.onclick = function () { var p = li.dataset.k.split(',').map(Number), m = an.filter(function (x) { return x.f === p[0] && x.t === p[1]; })[0]; if (m && !busy && !cpu() && !over) doMove(m); }; });
    $('#x-hint').classList.toggle('on', pref.hints); $('#x-hbox').hidden = !pref.hints; $('#x-level').hidden = two();
    $('#x-first').options[0].textContent = two() ? 'Pale starts' : 'You start (pale)'; $('#x-first').options[1].textContent = two() ? 'Dark starts' : 'Opponent starts (dark)';
  }
  $('#x-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<p><b>These are modern rules.</b> No ancient description of the game survives, so every set of rules for latrunculi today is a reconstruction. This one is kept simple:</p>' +
    '<ul><li>Each side has eight soldiers on its back row of an 8 × 8 board.</li><li>A soldier moves any distance along a row or column, like a rook in chess, but cannot jump.</li>' +
    '<li><b>Capture by trapping:</b> move so that an enemy soldier sits between your soldier and another of yours, in a straight line, and it is taken. You can take two or three at once. Moving into such a trap yourself is safe.</li>' +
    '<li>A soldier in a corner is taken when you hold both squares next to it.</li>' +
    '<li>You win when your opponent is down to one soldier or cannot move. After 50 moves with no capture the game ends, and whoever has more soldiers wins.</li></ul>' +
    '<h4>The move statistics</h4><p>With 💡 on, each of your soldiers shows the best estimated chance it offers; tap one to see where it can go. The computer looks one move ahead for each side and judges the position by the soldiers left, the enemy soldiers each side could trap with its next move, and control of the centre.</p>' +
    '<h4>Words</h4><table><tbody><tr><td class="la">latro, latronis</td><td>a soldier for hire; later, a robber</td></tr><tr><td class="la">latrunculus</td><td>a little soldier: a game piece</td></tr><tr><td class="la">calculus</td><td>a pebble; a counter in a game</td></tr><tr><td class="la">tabula</td><td>a board</td></tr><tr><td class="la">moveo, movere</td><td>to move</td></tr></tbody></table>' +
    '<h4>The history</h4><p>Roman writers mention a war game played with pieces called <i>latrones</i> or <i>latrunculi</i>, and boards with grids of 8 × 8 and larger are found across the Roman world. Ovid advises a woman to know how to play it in the <i>Art of Love</i>, and describes a piece being lost when “one piece dies by a twin enemy” (<span class="la">unus cum gemino calculus hoste perit</span>): taken by being trapped between two. The Greeks had a similar game, <i>petteia</i>. How the pieces moved, how big the board was and how a game was won are not known for certain.</p>';
  $('#x-mode').value = pref.mode; $('#x-level').value = pref.level; $('#x-first').value = pref.first;
  $('#x-mode').onchange = function () { pref.mode = this.value; save(); newGame(); };
  $('#x-level').onchange = function () { pref.level = +this.value; save(); };
  $('#x-first').onchange = function () { pref.first = this.value; save(); newGame(); };
  $('#x-hint').onclick = function () { pref.hints = !pref.hints; save(); if (!over && !cpu()) { an = pref.hints ? rank(S, 2) : moves(S); if (pref.hints) { var bb = an[0].w; an.forEach(function (m) { m.q = qual(bb - m.w); }); } } draw(); };
  $('#x-new').onclick = newGame;
  W.__lat = { get S() { return S; }, get an() { return an; }, doMove: doMove, tap: tap, get over() { return over; }, newGame: newGame };
  newGame();
})(window, document);
